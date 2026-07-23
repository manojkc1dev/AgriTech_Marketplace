import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.orders.models import Order
from apps.payments.models import PaymentTransaction, PaymentGateway

User = get_user_model()


@pytest.mark.django_db
class TestPaymentInitiation:

    def test_initiate_payment_success(self):
        client = APIClient()

        # 1. Create Buyer and Farmer with distinct credentials
        buyer = User.objects.create_user(
            username="buyer_initiate",
            email="buyer_init@example.com",
            phone="9800000001",
            password="password123"
        )
        farmer = User.objects.create_user(
            username="farmer_initiate",
            email="farmer_init@example.com",
            phone="9800000002",
            password="password123"
        )

        client.force_authenticate(user=buyer)

        # 2. Create test order
        order = Order.objects.create(
            buyer=buyer,
            farmer=farmer,
            total_amount=1000.00
        )

        # 3. Request payment initiation
        response = client.post('/api/payments/initiate/', {
            "order_id": order.id,
            "gateway": "ESEWA"
        }, format='json')

        # 4. Assertions matching your updated view/model
        assert response.status_code == status.HTTP_201_CREATED
        assert "transaction" in response.data
        assert response.data["transaction"]["amount"] == "1000.00"
        assert response.data["transaction"]["gateway"] == "ESEWA"


@pytest.mark.django_db
class TestPaymentVerification:

    def test_verify_payment_success(self):
        """Test verifying a valid transaction with status SUCCESS."""
        client = APIClient()

        buyer = User.objects.create_user(
            username="verify_buyer",
            email="vbuyer@example.com",
            phone="9800000003",
            password="password123"
        )
        farmer = User.objects.create_user(
            username="verify_farmer",
            email="vfarmer@example.com",
            phone="9800000004",
            password="password123"
        )

        client.force_authenticate(user=buyer)

        order = Order.objects.create(
            buyer=buyer,
            farmer=farmer,
            total_amount=1500.00
        )

        # Pre-create a pending transaction
        txn = PaymentTransaction.objects.create(
            order=order,
            transaction_id="TXN-ESEWA-001",
            gateway=PaymentGateway.ESEWA,
            amount=1500.00,
            is_successful=False
        )

        # Call verify endpoint
        response = client.post('/api/payments/verify/', {
            "order_id": order.id,
            "transaction_id": "TXN-ESEWA-001",
            "status": "SUCCESS",
            "raw_response": {"idx": "ESEWA_REF_123"}
        }, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_successful"] is True

        # Check DB state updated
        txn.refresh_from_db()
        assert txn.is_successful is True
        assert txn.raw_response == {"idx": "ESEWA_REF_123"}

    def test_verify_payment_failure(self):
        """Test handling a failed payment status from gateway."""
        client = APIClient()

        buyer = User.objects.create_user(
            username="fail_buyer",
            email="fbuyer@example.com",
            phone="9800000005",
            password="password123"
        )
        farmer = User.objects.create_user(
            username="fail_farmer",
            email="ffarmer@example.com",
            phone="9800000006",
            password="password123"
        )

        client.force_authenticate(user=buyer)

        order = Order.objects.create(
            buyer=buyer,
            farmer=farmer,
            total_amount=2000.00
        )

        PaymentTransaction.objects.create(
            order=order,
            transaction_id="TXN-FAIL-001",
            gateway=PaymentGateway.ESEWA,
            amount=2000.00,
            is_successful=False
        )

        response = client.post('/api/payments/verify/', {
            "order_id": order.id,
            "transaction_id": "TXN-FAIL-001",
            "status": "FAILED"
        }, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Payment verification failed."