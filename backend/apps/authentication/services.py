from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User, VerificationStatus


class AuthService:
    @staticmethod
    def generate_tokens_for_user(user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'role': user.role,
                'district': user.district,
                'verification_status': user.verification_status,
            }
        }

    @staticmethod
    def approve_farmer(farmer_id: int) -> User:
        farmer = User.objects.get(id=farmer_id)
        farmer.verification_status = VerificationStatus.APPROVED
        farmer.save()
        return farmer