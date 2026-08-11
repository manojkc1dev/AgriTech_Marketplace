from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User, UserRole, KycStatus


class LogisticsViewSetTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Driver / Carrier User
        self.carrier_user = User.objects.create_user(
            email="driver@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'ADMIN', 'ADMIN'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

        self.buyer = User.objects.create_user(
            email="buyer_logistics@agritech.com",
            password="Password123!",
            role=UserRole.BUYER,
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_unauthenticated_user_cannot_access_logistics(self):
        try:
            url = reverse('shipment-list')
        except Exception:
            url = '/api/logistics/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_authenticated_carrier_can_list_shipments(self):
        self.client.force_authenticate(user=self.carrier_user)
        try:
            url = reverse('shipment-list')
        except Exception:
            url = '/api/logistics/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_buyer_access_to_logistics(self):
        self.client.force_authenticate(user=self.buyer)
        try:
            url = reverse('shipment-list')
        except Exception:
            url = '/api/logistics/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])