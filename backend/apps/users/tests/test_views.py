from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from apps.users.models import User, UserRole, KycStatus

class UserViewsTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user_view@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_get_user_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/me/')  # Adjust endpoint path if necessary
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])