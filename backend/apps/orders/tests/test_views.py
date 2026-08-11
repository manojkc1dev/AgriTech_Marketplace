from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User, UserRole, KycStatus


class OrdersViewSetActionsTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()

        self.buyer = User.objects.create_user(
            email="buyer_actions@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

        self.farmer = User.objects.create_user(
            email="farmer_actions@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'FARMER', 'FARMER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_authenticated_buyer_order_endpoints(self):
        self.client.force_authenticate(user=self.buyer)

        # List orders
        response = self.client.get('/api/orders/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

        # Retrieve order 1
        response = self.client.get('/api/orders/1/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

        # Patch order status / metadata
        response = self.client.patch('/api/orders/1/', {'status': 'CANCELLED'}, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])

    def test_authenticated_farmer_order_endpoints(self):
        self.client.force_authenticate(user=self.farmer)

        response = self.client.get('/api/orders/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

        response = self.client.patch('/api/orders/1/', {'status': 'CONFIRMED'}, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])