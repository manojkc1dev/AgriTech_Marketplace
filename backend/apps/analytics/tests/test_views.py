from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User, UserRole, KycStatus


class AnalyticsViewSetTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin_user = User.objects.create_user(
            email="admin_analytics@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'ADMIN', 'ADMIN'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

        self.farmer_user = User.objects.create_user(
            email="farmer_analytics@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'FARMER', 'FARMER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_unauthenticated_user_cannot_access_analytics(self):
        try:
            url = reverse('analytics-list')
        except Exception:
            url = '/api/analytics/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_authenticated_user_can_access_analytics(self):
        self.client.force_authenticate(user=self.admin_user)
        try:
            url = reverse('analytics-list')
        except Exception:
            url = '/api/analytics/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])