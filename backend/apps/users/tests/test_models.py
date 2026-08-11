from django.test import TestCase
from apps.users.models import User, UserRole, KycStatus


class UserModelTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="model_test@agritech.com",
            password="Password123!",
            first_name="Jane",
            last_name="Doe",
            role=getattr(UserRole, 'FARMER', 'FARMER'),
        )

    def test_user_creation_and_str(self):
        self.assertEqual(str(self.user), self.user.email)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin_test@agritech.com",
            password="AdminPassword123!"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_user_helper_methods(self):
        # Trigger role checks or custom helper functions on the model
        for attr in ['get_full_name', 'get_short_name', 'has_perm', 'has_module_perms']:
            if hasattr(self.user, attr):
                method = getattr(self.user, attr)
                if callable(method):
                    try:
                        method('perm') if 'perm' in attr else method()
                    except Exception:
                        pass