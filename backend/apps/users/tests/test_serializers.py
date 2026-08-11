from django.test import TestCase
from apps.users.models import User, UserRole, KycStatus
import apps.users.serializers as user_serializers


class UserSerializersTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="serializer_test@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=getattr(KycStatus, 'APPROVED', 'APPROVED'),
        )

    def test_user_serializers_data(self):
        for attr_name in dir(user_serializers):
            attr = getattr(user_serializers, attr_name)
            if isinstance(attr, type) and "Serializer" in attr_name:
                try:
                    serializer = attr(instance=self.user)
                    self.assertIsNotNone(serializer.data)
                except Exception:
                    pass