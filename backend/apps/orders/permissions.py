from rest_framework import permissions


class IsOrderParticipantOrAdmin(permissions.BasePermission):
    """
    Allows access only to authenticated users who are participants in the order
    (e.g., buyer, seller) or administrators.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False

        is_admin = (
            request.user.is_staff 
            or getattr(request.user, 'role', '') in ['ADMIN', 'COOP_ADMIN']
        )
        is_buyer = (
            getattr(obj, 'buyer', None) == request.user 
            or getattr(obj, 'user', None) == request.user
        )
        is_seller = (
            getattr(obj, 'seller', None) == request.user 
            or getattr(obj, 'vendor', None) == request.user
        )

        return bool(is_admin or is_buyer or is_seller)
