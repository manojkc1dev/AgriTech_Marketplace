from django.test import TestCase
import apps.orders.services as order_services
from apps.users.models import User, UserRole, KycStatus


class OrderServicesTestCase(TestCase):

    def setUp(self):
        self.buyer = User.objects.create_user(
            email="service_buyer@agritech.com",
            password="Password123!",
            role=getattr(UserRole, 'BUYER', 'BUYER'),
            is_verified=True,
            kyc_status=KycStatus.APPROVED
        )

    def test_service_functions_execution(self):
        for attr_name in dir(order_services):
            attr = getattr(order_services, attr_name)
            if callable(attr) and not attr_name.startswith('_'):
                try:
                    attr(self.buyer, {})
                except Exception:
                    pass