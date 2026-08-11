import tempfile
from decimal import Decimal
from PIL import Image
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User, UserRole, KycStatus
from apps.products.models import Category, Product, ProductStatus, UnitChoices
from apps.products.services import ProductService


class ProductEndpointSecurityAndIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Category setup
        self.category = Category.objects.create(name="Grains")

        # Verified & Approved Farmer
        self.farmer = User.objects.create_user(
            email="farmer_approved@agritech.com",
            password="Password123!",
            role=UserRole.FARMER,
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

        # Unverified / Pending Farmer
        self.pending_farmer = User.objects.create_user(
            email="farmer_pending@agritech.com",
            password="Password123!",
            role=UserRole.FARMER,
            is_verified=False,
            kyc_status=KycStatus.PENDING
        )

        # Separate Buyer User
        self.buyer = User.objects.create_user(
            email="buyer@agritech.com",
            password="Password123!",
            role=UserRole.BUYER,
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

        # Sample Product
        self.product = ProductService.create_product(
            seller=self.farmer,
            data={
                "category": self.category,
                "title": "Organic Basmati Rice",
                "description": "High quality aged basmati rice.",
                "price_per_unit": Decimal('120.00'),
                "quantity_available": Decimal('500.00'),
                "unit": UnitChoices.KG,
                "location_district": "Chitwan",
                "location_city": "Bharatpur"
            }
        )

        self.list_url = reverse('product-list')
        self.detail_url = reverse('product-detail', kwargs={'pk': self.product.id})

    def test_unauthenticated_user_can_list_and_retrieve_products(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Organic Basmati Rice")

    def test_unverified_or_non_kyc_user_cannot_create_product(self):
        self.client.force_authenticate(user=self.pending_farmer)
        payload = {
            "category": self.category.id,
            "title": "Unauthorized Listing",
            "description": "Test description",
            "price_per_unit": "50.00",
            "quantity_available": "100.00",
            "unit": UnitChoices.KG,
            "location_district": "Kathmandu",
            "location_city": "Kathmandu"
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approved_farmer_can_create_product(self):
        self.client.force_authenticate(user=self.farmer)
        payload = {
            "category": self.category.id,
            "title": "Fresh Wheat",
            "description": "Premium wheat harvest.",
            "price_per_unit": "45.00",
            "quantity_available": "1000.00",
            "unit": UnitChoices.KG,
            "location_district": "Rupandehi",
            "location_city": "Bhairahawa"
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.filter(title="Fresh Wheat").count(), 1)

    def test_idor_protection_user_cannot_update_another_sellers_product(self):
        # Buyer attempts to modify Farmer's product
        self.client.force_authenticate(user=self.buyer)
        payload = {"title": "Hacked Title"}
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_seller_can_soft_delete_own_product(self):
        self.client.force_authenticate(user=self.farmer)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        self.product.refresh_from_db()
        self.assertTrue(self.product.is_deleted)
        self.assertEqual(self.product.status, ProductStatus.ARCHIVED)

    def test_product_image_upload_validation(self):
        self.client.force_authenticate(user=self.farmer)
        upload_url = reverse('product-upload-image', kwargs={'pk': self.product.id})

        # Generate mock image file
        image = Image.new('RGB', (100, 100), color='red')
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
        image.save(tmp_file, 'JPEG')
        tmp_file.seek(0)

        response = self.client.post(upload_url, {'image': tmp_file, 'is_primary': True}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.product.images.count(), 1)

    def test_atomic_stock_deduction_service(self):
        updated_product = ProductService.deduct_stock(
            product_id=str(self.product.id),
            quantity=Decimal('200.00')
        )
        self.assertEqual(updated_product.quantity_available, Decimal('300.00'))
        self.assertEqual(updated_product.status, ProductStatus.ACTIVE)

        # Fully exhaust stock
        exhausted_product = ProductService.deduct_stock(
            product_id=str(self.product.id),
            quantity=Decimal('300.00')
        )
        self.assertEqual(exhausted_product.quantity_available, Decimal('0.00'))
        self.assertEqual(exhausted_product.status, ProductStatus.SOLD_OUT)