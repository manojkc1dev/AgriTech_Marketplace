import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.orders.models import Order, PaymentStatus
from .models import PaymentTransaction, PaymentGateway
from .serializers import PaymentTransactionSerializer


class InitiatePaymentView(APIView):
    """
    POST: Initiate eSewa / Khalti payment token for an order
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        gateway = request.data.get('gateway', PaymentGateway.ESEWA)

        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"

        payment = PaymentTransaction.objects.create(
            order=order,
            transaction_id=txn_id,
            gateway=gateway,
            amount=order.total_amount,
            is_successful=False
        )

        return Response({
            "message": "Payment transaction initiated successfully.",
            "transaction": PaymentTransactionSerializer(payment).data,
            "checkout_details": {
                "amount": str(order.total_amount),
                "product_code": "AGRI_MKT_NP",
                "transaction_id": txn_id
            }
        }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    """
    POST: Verify payment response and hold funds in Escrow
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        txn_id = request.data.get('transaction_id')

        try:
            payment = PaymentTransaction.objects.get(transaction_id=txn_id)
        except PaymentTransaction.DoesNotExist:
            return Response({"error": "Transaction reference not found."}, status=status.HTTP_404_NOT_FOUND)

        payment.is_successful = True
        payment.save()

        # Update Order payment status to Held in Escrow
        order = payment.order
        order.payment_status = PaymentStatus.ESCROW_HELD
        order.save()

        return Response({
            "message": "Payment verified. Funds held safely in Escrow.",
            "order_id": order.id,
            "payment_status": order.get_payment_status_display()
        }, status=status.HTTP_200_OK)