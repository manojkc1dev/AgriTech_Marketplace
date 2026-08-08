from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdminUser])
def pending_verification_view(request):
    pending_users = User.objects.filter(is_active=False)
    
    users_data = [{
        "id": u.id,
        "email": getattr(u, 'email', ''),
        "role": getattr(u, 'role', 'user'),
        "is_verified": getattr(u, 'is_verified', False)
    } for u in pending_users]

    return Response(users_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def verify_user_view(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        user.is_active = True
        if hasattr(user, 'is_verified'):
            user.is_verified = True
        user.save()
        return Response({"message": "User verified successfully."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user_view(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)