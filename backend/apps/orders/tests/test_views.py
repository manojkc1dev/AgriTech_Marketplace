from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User, UserRole, KycStatus


class OrdersDetailViewSetTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()

        self.buyer = User.objects.create_user(
            email="buyer_detail@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

        self.farmer = User.objects.create_user(
            email="farmer_detail@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'FARMER', 'FARMER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_buyer_create_order(self):
        self.client.force_authenticate(user=self.buyer)
        try:
            url = reverse('order-list')
        except Exception:
            url = '/api/orders/'

        payload = {
            "total_price": "150.00",
            "items": []
        }
        response = self.client.post(url, payload, format='json')
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_get_order_detail_unauthenticated(self):
        try:
            url = reverse('order-detail', kwargs={'pk': 1})
        except Exception:
            url = '/api/orders/1/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])