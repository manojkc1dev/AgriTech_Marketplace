# import uuid
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions, serializers
# from drf_spectacular.utils import extend_schema, inline_serializer

# from apps.orders.models import Order, PaymentStatus
# from .models import PaymentTransaction, PaymentGateway
# from .serializers import PaymentTransactionSerializer


# class InitiatePaymentView(APIView):
#     """
#     POST: Initiate eSewa / Khalti payment token for an order
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     @extend_schema(
#         request=inline_serializer(
#             name='InitiatePaymentRequest',
#             fields={
#                 'order_id': serializers.IntegerField(default=1),
#                 'gateway': serializers.ChoiceField(
#                     choices=[PaymentGateway.ESEWA, PaymentGateway.KHALTI],
#                     default=PaymentGateway.ESEWA
#                 )
#             }
#         ),
#         responses={201: inline_serializer(
#             name='InitiatePaymentResponse',
#             fields={
#                 'message': serializers.CharField(),
#                 'transaction': PaymentTransactionSerializer(),
#                 'checkout_details': serializers.JSONField()
#             }
#         )}
#     )
#     def post(self, request):
#         order_id = request.data.get('order_id')
#         gateway = request.data.get('gateway', PaymentGateway.ESEWA)

#         try:
#             order = Order.objects.get(id=order_id, buyer=request.user)
#         except Order.DoesNotExist:
#             return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

#         txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"

#         payment = PaymentTransaction.objects.create(
#             order=order,
#             transaction_id=txn_id,
#             gateway=gateway,
#             amount=order.total_amount,
#             is_successful=False
#         )

#         return Response({
#             "message": "Payment transaction initiated successfully.",
#             "transaction": PaymentTransactionSerializer(payment).data,
#             "checkout_details": {
#                 "amount": str(order.total_amount),
#                 "product_code": "AGRI_MKT_NP",
#                 "transaction_id": txn_id
#             }
#         }, status=status.HTTP_201_CREATED)


# class VerifyPaymentView(APIView):
#     """
#     POST: Verify payment response and hold funds in Escrow
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     @extend_schema(
#         request=inline_serializer(
#             name='VerifyPaymentRequest',
#             fields={
#                 'transaction_id': serializers.CharField(
#                     help_text="Transaction ID generated during payment initiation"
#                 )
#             }
#         )
#     )
#     def post(self, request):
#         txn_id = request.data.get('transaction_id')

#         try:
#             payment = PaymentTransaction.objects.get(transaction_id=txn_id)
#         except PaymentTransaction.DoesNotExist:
#             return Response({"error": "Transaction reference not found."}, status=status.HTTP_404_NOT_FOUND)

#         payment.is_successful = True
#         payment.save()

#         # Update Order payment status to Held in Escrow
#         order = payment.order
#         order.payment_status = PaymentStatus.ESCROW_HELD
#         order.save()

#         return Response({
#             "message": "Payment verified. Funds held safely in Escrow.",
#             "order_id": order.id,
#             "payment_status": order.get_payment_status_display()
#         }, status=status.HTTP_200_OK)





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.orders.models import Order
from .models import PaymentTransaction, PaymentGateway


class PaymentInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        gateway = request.data.get("gateway", "ESEWA")

        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        # Create a pending payment transaction
        transaction = PaymentTransaction.objects.create(
            order=order,
            transaction_id=f"TXN-{order.id}-{int(timezone.now().timestamp())}",
            amount=order.total_amount,
            gateway=gateway,
            is_successful=False
        )

        return Response({
            "message": "Payment initiated successfully.",
            "transaction": {
                "id": transaction.id,
                "transaction_id": transaction.transaction_id,
                "amount": str(transaction.amount),
                "gateway": transaction.gateway
            }
        }, status=status.HTTP_201_CREATED)


class PaymentVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        transaction_id = request.data.get("transaction_id")
        gateway_status = request.data.get("status")
        raw_data = request.data.get("raw_response", {})

        try:
            transaction = PaymentTransaction.objects.filter(order_id=order_id).latest('created_at')
        except PaymentTransaction.DoesNotExist:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        if gateway_status in ["SUCCESS", "COMPLETE", "COMPLETED"]:
            transaction.is_successful = True
            transaction.transaction_id = transaction_id or transaction.transaction_id
            transaction.raw_response = raw_data
            transaction.save()

            order = transaction.order
            if hasattr(order, 'payment_status'):
                order.payment_status = "PAID"
                order.save()

            return Response({
                "message": "Payment verified successfully.",
                "transaction_id": transaction.transaction_id,
                "is_successful": transaction.is_successful
            }, status=status.HTTP_200_OK)
        else:
            transaction.is_successful = False
            transaction.raw_response = raw_data
            transaction.save()
            
            return Response({"error": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)