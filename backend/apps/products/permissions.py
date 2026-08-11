from rest_framework import permissions


class IsVerifiedAndKYCApproved(permissions.BasePermission):
    """
    Allows access only to authenticated users who are verified and KYC approved.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        is_verified = getattr(request.user, 'is_verified', True)
        is_kyc_approved = getattr(request.user, 'is_kyc_approved', True)
        return bool(is_verified and is_kyc_approved)


class IsProductOwnerOrCoopAdminOrReadOnly(permissions.BasePermission):
    """
    Read-only for all requests; write access restricted to product owners or admins.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        is_owner = (
            getattr(obj, 'seller', None) == request.user 
            or getattr(obj, 'owner', None) == request.user 
            or getattr(obj, 'created_by', None) == request.user
        )
        is_admin = (
            getattr(request.user, 'role', '') in ['COOP_ADMIN', 'ADMIN'] 
            or request.user.is_staff
        )
        return bool(is_owner or is_admin)
