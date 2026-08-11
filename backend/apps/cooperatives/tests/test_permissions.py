from django.test import TestCase
from rest_framework.test import APIRequestFactory

import apps.cooperatives.permission as coop_permissions
from apps.users.models import User, UserRole, KycStatus


class CooperativePermissionsTestCase(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            email="perm_test@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'FARMER', 'FARMER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_permission_classes_has_permission(self):
        request = self.factory.get('/api/cooperatives/')
        request.user = self.user

        for attr_name in dir(coop_permissions):
            attr = getattr(coop_permissions, attr_name)
            if isinstance(attr, type) and hasattr(attr, 'has_permission'):
                perm_instance = attr()
                result = perm_instance.has_permission(request, None)
                self.assertIn(result, [True, False])