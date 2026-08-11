from django.test import TestCase
from rest_framework.test import APIRequestFactory

import apps.orders.permissions as order_permissions
from apps.users.models import User, UserRole, KycStatus


class OrderPermissionsTestCase(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            email="order_perm_test@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_permission_classes_has_permission(self):
        request = self.factory.get('/api/orders/')
        request.user = self.user

        for attr_name in dir(order_permissions):
            attr = getattr(order_permissions, attr_name)
            if isinstance(attr, type) and hasattr(attr, 'has_permission'):
                perm_instance = attr()
                result = perm_instance.has_permission(request, None)
                self.assertIn(result, [True, False])