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





# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# from apps.orders.models import Order
# from .models import PaymentTransaction, PaymentGateway


# class PaymentInitiateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         order_id = request.data.get("order_id")
#         gateway = request.data.get("gateway", "ESEWA")

#         try:
#             order = Order.objects.get(id=order_id, buyer=request.user)
#         except Order.DoesNotExist:
#             return Response({"error": "Order not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

#         # Create a pending payment transaction
#         transaction = PaymentTransaction.objects.create(
#             order=order,
#             transaction_id=f"TXN-{order.id}-{int(timezone.now().timestamp())}",
#             amount=order.total_amount,
#             gateway=gateway,
#             is_successful=False
#         )

#         return Response({
#             "message": "Payment initiated successfully.",
#             "transaction": {
#                 "id": transaction.id,
#                 "transaction_id": transaction.transaction_id,
#                 "amount": str(transaction.amount),
#                 "gateway": transaction.gateway
#             }
#         }, status=status.HTTP_201_CREATED)


# class PaymentVerifyView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         order_id = request.data.get("order_id")
#         transaction_id = request.data.get("transaction_id")
#         gateway_status = request.data.get("status")
#         raw_data = request.data.get("raw_response", {})

#         try:
#             transaction = PaymentTransaction.objects.filter(order_id=order_id).latest('created_at')
#         except PaymentTransaction.DoesNotExist:
#             return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

#         if gateway_status in ["SUCCESS", "COMPLETE", "COMPLETED"]:
#             transaction.is_successful = True
#             transaction.transaction_id = transaction_id or transaction.transaction_id
#             transaction.raw_response = raw_data
#             transaction.save()

#             order = transaction.order
#             if hasattr(order, 'payment_status'):
#                 order.payment_status = "PAID"
#                 order.save()

#             return Response({
#                 "message": "Payment verified successfully.",
#                 "transaction_id": transaction.transaction_id,
#                 "is_successful": transaction.is_successful
#             }, status=status.HTTP_200_OK)
#         else:
#             transaction.is_successful = False
#             transaction.raw_response = raw_data
#             transaction.save()
            
#             return Response({"error": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)








import uuid
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.orders.models import Order
from .models import PaymentTransaction, PaymentGateway
from .utils import generate_esewa_signature

class PaymentInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        gateway = request.data.get("gateway", PaymentGateway.ESEWA)

        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        txn_id = f"TXN-{order.id}-{uuid.uuid4().hex[:6].upper()}"

        # Create a pending transaction record
        transaction = PaymentTransaction.objects.create(
            order=order,
            transaction_id=txn_id,
            amount=order.total_amount,
            gateway=gateway,
            is_successful=False
        )

        checkout_data = {}

        if gateway == PaymentGateway.ESEWA:
            total_amount = str(order.total_amount)
            product_code = "EPAYTEST"
            message = f"total_amount={total_amount},transaction_uuid={txn_id},product_code={product_code}"
            secret_key = getattr(settings, "ESEWA_SECRET_KEY", "8gBm/:&EnhH.1/q")
            signature = generate_esewa_signature(secret_key, message)

            checkout_data = {
                "amount": total_amount,
                "tax_amount": "0",
                "total_amount": total_amount,
                "transaction_uuid": txn_id,
                "product_code": product_code,
                "success_url": "http://localhost:3000/payment/success",
                "failure_url": "http://localhost:3000/payment/failure",
                "signed_field_names": "total_amount,transaction_uuid,product_code",
                "signature": signature,
                "gateway_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
            }

        elif gateway == PaymentGateway.KHALTI:
            # Khalti expects amount in Paisa (NPR * 100)
            paisa_amount = int(float(order.total_amount) * 100)
            
            khalti_payload = {
                "return_url": "http://localhost:3000/payment/success",
                "website_url": "http://localhost:3000",
                "amount": paisa_amount,
                "purchase_order_id": str(order.id),
                "purchase_order_name": f"AgriTech Order #{order.id}",
            }
            
            headers = {
                "Authorization": "Key test_secret_key_f59e8b7d18b4499ca40f68195a846e9b", # Replace with your sandbox key or env variable
                "Content-Type": "application/json",
            }

            try:
                # Call Khalti e-payment init API (Sandbox)
                response = requests.post(
                    "https://dev.khalti.com/api/v2/epayment/initiate/",
                    json=khalti_payload,
                    headers=headers
                )
                res_data = response.json()
                
                if response.status_code == 200:
                    # Khalti returns a 'pidx' and 'payment_url'
                    transaction.transaction_id = res_data.get("pidx", txn_id)
                    transaction.save()

                    checkout_data = {
                        "pidx": res_data.get("pidx"),
                        "gateway_url": res_data.get("payment_url"),
                    }
                else:
                    return Response({"error": "Khalti initialization failed", "details": res_data}, status=status.HTTP_400_BAD_REQUEST)
            except requests.exceptions.RequestException as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "message": "Payment parameters generated successfully.",
            "transaction_id": transaction.transaction_id,
            "gateway": gateway,
            "checkout_data": checkout_data
        }, status=status.HTTP_201_CREATED)




class PaymentVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        transaction_id = request.data.get("transaction_id") # This will be the pidx for Khalti
        gateway_status = request.data.get("status")
        raw_data = request.data.get("raw_response", {})

        try:
            transaction = PaymentTransaction.objects.filter(order_id=order_id).latest('created_at')
        except PaymentTransaction.DoesNotExist:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        # If it's Khalti, optionally verify via lookup API using pidx
        if transaction.gateway == PaymentGateway.KHALTI and transaction_id:
            headers = {"Authorization": "Key test_secret_key_f59e8b7d18b4499ca40f68195a846e9b", "Content-Type": "application/json"}
            lookup_res = requests.post("https://dev.khalti.com/api/v2/epayment/lookup/", json={"pidx": transaction_id}, headers=headers)
            if lookup_res.status_code == 200:
                lookup_data = lookup_res.json()
                raw_data = lookup_data
                if lookup_data.get("status") == "Completed":
                    gateway_status = "SUCCESS"

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