from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsPlatformAdminOrReadOnly(BasePermission):
    """
    Allows full access to Platform Admins (is_superuser or role == 'ADMIN').
    Others have read-only access (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role == 'ADMIN'
        )


class IsCooperativeAdminOrOwner(BasePermission):
    """
    Object-level permission to ensure a user belongs to the cooperative 
    and acts as a Cooperative Admin or represents that cooperative entity, 
    or is a global platform admin.
    """
    def has_object_permission(self, request, view, obj):
        # Platform admins can do anything
        if request.user and (request.user.is_authenticated and (request.user.is_superuser or request.user.role == 'ADMIN')):
            return True
        
        # Safe methods allowed for authenticated users
        if request.method in SAFE_METHODS and request.user and request.user.is_authenticated:
            return True

        # Resolve the cooperative object depending on whether it's Cooperative, Announcement, or Message
        cooperative = obj if hasattr(obj, 'description') else getattr(obj, 'cooperative', None)
        if not cooperative:
            return False

        # Check if the user is linked to this specific cooperative as a cooperative admin
        return request.user.is_authenticated and (
            request.user.role == 'COOPERATIVE' and request.user.cooperative_id == cooperative.id
        )