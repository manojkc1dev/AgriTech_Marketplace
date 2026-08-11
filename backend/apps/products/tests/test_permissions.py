from django.urls import reverse, NoReverseMatch
from rest_framework import status
from rest_framework.test import APITestCase
from apps.users.models import User, UserRole, KycStatus
from apps.products.models import Category, UnitChoices


class ProductPermissionsTestCase(APITestCase):

    def setUp(self):
        self.category = Category.objects.create(name="Vegetables", slug="vegetables")
        
        self.approved_farmer = User.objects.create_user(
            email="farmer@test.com",
            password="Password123!",
            role=UserRole.FARMER,
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )
        
        self.unapproved_farmer = User.objects.create_user(
            email="unapproved@test.com",
            password="Password123!",
            role=UserRole.FARMER,
            is_verified=False,
            kyc_status=KycStatus.PENDING
        )

        try:
            self.list_create_url = reverse('products:product-list')
        except NoReverseMatch:
            self.list_create_url = reverse('product-list')

    def test_anonymous_user_can_list_products(self):
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unapproved_user_cannot_create_product(self):
        self.client.force_authenticate(user=self.unapproved_farmer)
        data = {
            "title": "Fresh Tomatoes",
            "description": "Fresh locally grown tomatoes.",
            "category": self.category.id,
            "price_per_unit": "50.00",
            "quantity_available": 100,
            "unit": UnitChoices.KG if hasattr(UnitChoices, 'KG') else "KG",
            "location_district": "Kathmandu",
            "location_city": "Kathmandu"
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approved_farmer_can_create_product(self):
        self.client.force_authenticate(user=self.approved_farmer)
        data = {
            "title": "Fresh Tomatoes",
            "description": "Fresh locally grown tomatoes.",
            "category": self.category.id,
            "price_per_unit": "50.00",
            "quantity_available": 100,
            "unit": UnitChoices.KG if hasattr(UnitChoices, 'KG') else "KG",
            "location_district": "Kathmandu",
            "location_city": "Kathmandu"
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)