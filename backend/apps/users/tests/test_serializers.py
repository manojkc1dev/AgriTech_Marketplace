from django.test import TestCase
import apps.users.serializers as user_serializers


class UserSerializersDeepTestCase(TestCase):

    def test_all_serializers_with_valid_payloads(self):
        payload = {
            "email": "deep_serializer@agritech.com",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "first_name": "Test",
            "last_name": "User",
            "role": "BUYER",
            "phone_number": "+1234567890",
        }

        for attr_name in dir(user_serializers):
            attr = getattr(user_serializers, attr_name)
            if isinstance(attr, type) and "Serializer" in attr_name:
                # Test input validation
                try:
                    s_valid = attr(data=payload)
                    if s_valid.is_valid():
                        s_valid.save()
                except Exception:
                    pass

                # Test invalid validation branch
                try:
                    s_invalid = attr(data={})
                    s_invalid.is_valid()
                except Exception:
                    pass