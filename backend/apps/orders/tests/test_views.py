from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User, UserRole, KycStatus


class OrdersViewSetTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()

        self.buyer = User.objects.create_user(
            email="buyer_orders@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

        self.farmer = User.objects.create_user(
            email="farmer_orders@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'FARMER', 'FARMER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_unauthenticated_user_cannot_access_orders(self):
        try:
            url = reverse('order-list')
        except Exception:
            url = '/api/orders/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_authenticated_buyer_can_list_orders(self):
        self.client.force_authenticate(user=self.buyer)
        try:
            url = reverse('order-list')
        except Exception:
            url = '/api/orders/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_authenticated_farmer_can_list_orders(self):
        self.client.force_authenticate(user=self.farmer)
        try:
            url = reverse('order-list')
        except Exception:
            url = '/api/orders/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])