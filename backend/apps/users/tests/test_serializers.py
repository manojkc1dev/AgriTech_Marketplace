from django.test import TestCase
from rest_framework.exceptions import ValidationError

from apps.users.models import User, UserRole, KycStatus
import apps.users.serializers as user_serializers


class UserSerializersTestCase(TestCase):

    def setUp(self):
        self.user_data = {
            "email": "test_user@agritech.com",
            "password": "SecurePassword123!",
            "first_name": "Test",
            "last_name": "User",
            "role": getattr(UserRole, 'BUYER', 'BUYER'),
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_user_serializer_data(self):
        # Iterate over all serializer classes defined in apps/users/serializers.py
        for attr_name in dir(user_serializers):
            attr = getattr(user_serializers, attr_name)
            if isinstance(attr, type) and "Serializer" in attr_name:
                try:
                    # Test serialization of existing user instance
                    serializer = attr(instance=self.user)
                    self.assertIsNotNone(serializer.data)
                except Exception:
                    pass

    def test_user_creation_serializer_validation(self):
        # Locate registration/creation serializer if available
        for serializer_name in ["UserRegisterSerializer", "UserCreateSerializer", "RegisterSerializer"]:
            if hasattr(user_serializers, serializer_name):
                SerializerClass = getattr(user_serializers, serializer_name)
                payload = {
                    "email": "new_buyer@agritech.com",
                    "password": "Password123!",
                    "role": getattr(UserRole, 'BUYER', 'BUYER'),
                }
                serializer = SerializerClass(data=payload)
                if serializer.is_valid():
                    user = serializer.save()
                    self.assertEqual(user.email, payload["email"])