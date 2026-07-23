import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.products.models import Category, Product

User = get_user_model()


@pytest.mark.django_db
class TestProductCatalog:

    def test_list_categories(self):
        client = APIClient()
        Category.objects.create(name="Vegetables", slug="vegetables")
        
        response = client.get('/api/categories/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Vegetables"

    def test_create_and_list_product(self):
        client = APIClient()
        farmer = User.objects.create_user(
            username="testfarmer",
            email="farmer@example.com",
            phone="9800000099",
            password="password123"
        )
        category = Category.objects.create(name="Grains", slug="grains")

        client.force_authenticate(user=farmer)

        # Create product
        response = client.post('/api/products/', {
            "title": "Organic Basmati Rice",
            "description": "High quality local rice",
            "price_per_kg": "150.00",
            "available_stock_kg": 500,
            "district": "Chitwan",
            "is_organic": True,
            "category": category.id
        }, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "Organic Basmati Rice"

        # List products anonymously (public view)
        client.logout()
        list_response = client.get('/api/products/')
        assert list_response.status_code == status.HTTP_200_OK
        assert len(list_response.data) == 1
        assert list_response.data[0]["district"] == "Chitwan"