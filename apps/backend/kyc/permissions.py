from rest_framework import permissions
from .models import KYCApplication, VerificationStatus


class IsKYCVerified(permissions.BasePermission):
    """
    Allows write operations only for users with an approved KYC application.
    """
    message = "KYC verification required. You must have an approved KYC application to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        # Check boolean attribute on User or fallback to DB record status check
        if getattr(request.user, 'is_kyc_verified', False):
            return True

        return KYCApplication.objects.filter(
            user=request.user,
            status=VerificationStatus.APPROVED,
        ).exists()