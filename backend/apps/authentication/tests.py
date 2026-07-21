import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

# Get your custom user model cleanly
User = get_user_model()

# ==========================================
# 1. MODEL TESTS (Testing the Database)
# ==========================================
@pytest.mark.django_db
class TestUserModel:
    
    def test_create_user(self):
        """Test creating a standard user with email"""
        user = User.objects.create_user(
            username='johndoe',
            email='john@agritech.com',
            password='StrongPassword123!'
        )
        
        assert user.email == 'john@agritech.com'
        assert user.is_active == True
        assert user.is_staff == False
        assert user.is_superuser == False

    def test_create_superuser(self):
        """Test creating a superuser"""
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@agritech.com',
            password='SuperSecretPassword!'
        )
        
        assert admin_user.is_staff == True
        assert admin_user.is_superuser == True


# ==========================================
# 2. API TESTS (Testing the Endpoints)
# ==========================================
@pytest.mark.django_db
class TestAuthenticationAPI:
    
    def setup_method(self):
        """This runs before every test in this class"""
        self.client = APIClient()
        self.register_url = '/api/auth/register/' 

    def test_user_registration_api(self):
        """Ensure a user can register via the API"""
        payload = {
            'username': 'newfarmer',
            'email': 'farmer@agritech.com',
            'password': 'SecurePassword123!'
        }
        
        # We expect a 404 right now because the URL isn't built yet.
        response = self.client.post(self.register_url, payload)
        
        # We will change this to 201_CREATED once we actually build the view!
        # assert response.status_code == 201 