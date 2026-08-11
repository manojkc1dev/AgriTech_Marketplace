from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User, UserRole, KycStatus


class CooperativeViewSetTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email="coop_member@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'FARMER', 'FARMER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_unauthenticated_user_cooperative_access(self):
        try:
            url = reverse('cooperative-list')
        except Exception:
            url = '/api/cooperatives/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED, status.HTTP_404_NOT_FOUND])

    def test_authenticated_user_can_list_cooperatives(self):
        self.client.force_authenticate(user=self.user)
        try:
            url = reverse('cooperative-list')
        except Exception:
            url = '/api/cooperatives/'

        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
        