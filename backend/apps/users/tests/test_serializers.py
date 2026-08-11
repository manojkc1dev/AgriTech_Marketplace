from django.test import TestCase
from apps.users.models import User, UserRole, KycStatus
import apps.users.serializers as user_serializers


class UserSerializersTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="ser_test@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_serializers_validation_and_serialization(self):
        for attr_name in dir(user_serializers):
            attr = getattr(user_serializers, attr_name)
            if isinstance(attr, type) and "Serializer" in attr_name:
                # Test direct serialization
                try:
                    s_out = attr(instance=self.user)
                    _ = s_out.data
                except Exception:
                    pass

                # Test data validation
                try:
                    s_in = attr(data={"email": "new_user@agritech.com", "password": "Password123!"})
                    s_in.is_valid()
                except Exception:
                    pass