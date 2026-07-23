import pytest
from rest_framework import status
from rest_framework.test import APIClient
from apps.orders.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestPaymentInitiation:
    def test_initiate_payment_success(self):
        client = APIClient()

        # 1. Create Buyer and Farmer with distinct phone numbers & emails
        buyer = User.objects.create_user(
            username="testbuyer",
            email="buyer@example.com",
            phone="9800000001",
            password="password123"
        )
        farmer = User.objects.create_user(
            username="testfarmer",
            email="farmer@example.com",
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

        # 4. Assertions
        assert response.status_code == status.HTTP_201_CREATED
        assert "transaction" in response.data
        assert response.data["transaction"]["amount"] == "1000.00"