import uuid
import requests
from django.conf import settings
from rest_framework import permissions, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer

from apps.orders.models import Order
from .models import PaymentGateway, PaymentTransaction
from .utils import generate_esewa_signature

from django.db import transaction as db_transaction
from .models import PaymentGateway, PaymentTransaction, PaymentStatus


class PaymentInitiateView(APIView):
    """
    POST: Initiate payment for an order via eSewa or Khalti.
    Generates checkout parameters and stores a pending transaction.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Initiate Payment Transaction",
        description="Generates payment signatures and gateway URLs for eSewa v2 or Khalti v2.",
        request=inline_serializer(
            name='PaymentInitiateRequest',
            fields={
                'order_id': serializers.IntegerField(default=1, help_text="ID of the order to pay for"),
                'gateway': serializers.ChoiceField(
                    choices=[PaymentGateway.ESEWA, PaymentGateway.KHALTI],
                    default=PaymentGateway.ESEWA,
                    help_text="Gateway choice: ESEWA or KHALTI"
                )
            }
        ),
        responses={
            201: inline_serializer(
                name='PaymentInitiateResponse',
                fields={
                    'message': serializers.CharField(),
                    'transaction_id': serializers.CharField(),
                    'gateway': serializers.CharField(),
                    'checkout_data': serializers.JSONField()
                }
            ),
            400: inline_serializer(
                name='PaymentInitiateError',
                fields={'error': serializers.CharField(), 'details': serializers.JSONField(required=False)}
            ),
            404: inline_serializer(
                name='PaymentOrderNotFound',
                fields={'error': serializers.CharField()}
            )
        }
    )
    def post(self, request):
        order_id = request.data.get("order_id")
        gateway = request.data.get("gateway", PaymentGateway.ESEWA)

        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found or unauthorized."},
                status=status.HTTP_404_NOT_FOUND
            )

        txn_id = f"TXN-{order.id}-{uuid.uuid4().hex[:6].upper()}"

        # Save pending transaction record
        transaction = PaymentTransaction.objects.create(
            order=order,
            transaction_id=txn_id,
            amount=order.total_amount,
            gateway=gateway,
            is_successful=False
        )

        checkout_data = {}

        # ----------------------------------------------------
        # 1. eSewa v2 Integration
        # ----------------------------------------------------
        if gateway == PaymentGateway.ESEWA:
            total_amount = str(order.total_amount)
            product_code = getattr(settings, "ESEWA_PRODUCT_CODE", "EPAYTEST")
            secret_key = getattr(settings, "ESEWA_SECRET_KEY", "8gBm/:&EnhH.1/q")
            message = f"total_amount={total_amount},transaction_uuid={txn_id},product_code={product_code}"

            signature = generate_esewa_signature(secret_key, message)

            checkout_data = {
                "amount": total_amount,
                "tax_amount": "0",
                "total_amount": total_amount,
                "transaction_uuid": txn_id,
                "product_code": product_code,
                "success_url": getattr(settings, "ESEWA_SUCCESS_URL", "http://localhost:3000/payment/success"),
                "failure_url": getattr(settings, "ESEWA_FAILURE_URL", "http://localhost:3000/payment/failure"),
                "signed_field_names": "total_amount,transaction_uuid,product_code",
                "signature": signature,
                "gateway_url": getattr(
                    settings,
                    "ESEWA_GATEWAY_URL",
                    "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
                )
            }

        # ----------------------------------------------------
        # 2. Khalti v2 Integration
        # ----------------------------------------------------
        elif gateway == PaymentGateway.KHALTI:
            paisa_amount = int(float(order.total_amount) * 100)
            khalti_secret_key = getattr(
                settings,
                "KHALTI_SECRET_KEY",
                "Key test_secret_key_f59e8b7d18b4499ca40f68195a846e9b"
            )

            khalti_payload = {
                "return_url": getattr(settings, "KHALTI_RETURN_URL", "http://localhost:3000/payment/success"),
                "website_url": getattr(settings, "KHALTI_WEBSITE_URL", "http://localhost:3000"),
                "amount": paisa_amount,
                "purchase_order_id": str(order.id),
                "purchase_order_name": f"AgriTech Order #{order.id}",
            }

            headers = {
                "Authorization": khalti_secret_key,
                "Content-Type": "application/json",
            }

            try:
                response = requests.post(
                    getattr(settings, "KHALTI_INITIATE_URL", "https://dev.khalti.com/api/v2/epayment/initiate/"),
                    json=khalti_payload,
                    headers=headers,
                    timeout=10
                )
                res_data = response.json()

                if response.status_code == 200:
                    pidx = res_data.get("pidx", txn_id)
                    transaction.transaction_id = pidx
                    transaction.save()

                    checkout_data = {
                        "pidx": pidx,
                        "gateway_url": res_data.get("payment_url"),
                    }
                else:
                    return Response(
                        {"error": "Khalti initialization failed", "details": res_data},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except requests.exceptions.RequestException as e:
                return Response(
                    {"error": f"Gateway connection error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({
            "message": "Payment parameters generated successfully.",
            "transaction_id": transaction.transaction_id,
            "gateway": gateway,
            "checkout_data": checkout_data
        }, status=status.HTTP_201_CREATED)


class PaymentVerifyView(APIView):
    """
    POST: Verify payment transaction and update order payment status.
    Performs server-to-server verification for Khalti payments.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Verify Payment Transaction",
        description="Verifies transaction outcome. For Khalti, performs automated server-to-server lookup.",
        request=inline_serializer(
            name='PaymentVerifyRequest',
            fields={
                'order_id': serializers.IntegerField(help_text="ID of the target order"),
                'transaction_id': serializers.CharField(
                    required=False,
                    help_text="Transaction ID or Khalti 'pidx'"
                ),
                'status': serializers.CharField(
                    required=False,
                    help_text="Gateway return status e.g., 'COMPLETE' or 'SUCCESS'"
                ),
                'raw_response': serializers.JSONField(
                    required=False,
                    help_text="Raw payload returned by the gateway callback"
                )
            }
        ),
        responses={
            200: inline_serializer(
                name='PaymentVerifySuccess',
                fields={
                    'message': serializers.CharField(),
                    'transaction_id': serializers.CharField(),
                    'is_successful': serializers.BooleanField()
                }
            ),
            400: inline_serializer(
                name='PaymentVerifyFailure',
                fields={'error': serializers.CharField()}
            ),
            404: inline_serializer(
                name='PaymentVerifyNotFound',
                fields={'error': serializers.CharField()}
            )
        }
    )
    def post(self, request):
        order_id = request.data.get("order_id")
        transaction_id = request.data.get("transaction_id")
        gateway_status = request.data.get("status")
        raw_data = request.data.get("raw_response", {})

        try:
            transaction = PaymentTransaction.objects.filter(order_id=order_id).latest('created_at')
        except PaymentTransaction.DoesNotExist:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        # Automated lookup verification for Khalti
        if transaction.gateway == PaymentGateway.KHALTI and (transaction_id or transaction.transaction_id):
            lookup_pidx = transaction_id or transaction.transaction_id
            khalti_secret_key = getattr(
                settings,
                "KHALTI_SECRET_KEY",
                "Key test_secret_key_f59e8b7d18b4499ca40f68195a846e9b"
            )
            headers = {
                "Authorization": khalti_secret_key,
                "Content-Type": "application/json"
            }
            try:
                lookup_res = requests.post(
                    getattr(settings, "KHALTI_LOOKUP_URL", "https://dev.khalti.com/api/v2/epayment/lookup/"),
                    json={"pidx": lookup_pidx},
                    headers=headers,
                    timeout=10
                )
                if lookup_res.status_code == 200:
                    lookup_data = lookup_res.json()
                    raw_data = lookup_data
                    if lookup_data.get("status") == "Completed":
                        gateway_status = "SUCCESS"
            except requests.exceptions.RequestException:
                pass  # Fallback to provided status payload if lookup call fails

        if gateway_status in ["SUCCESS", "COMPLETE", "COMPLETED"]:
            with db_transaction.atomic():
                transaction.is_successful = True
                transaction.transaction_id = transaction_id or transaction.transaction_id
                transaction.raw_response = raw_data
                transaction.save()

                order = transaction.order
                if hasattr(order, 'payment_status'):
                    order.payment_status = PaymentStatus.PAID
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