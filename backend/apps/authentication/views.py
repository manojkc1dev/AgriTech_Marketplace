from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.users.models import User, VerificationStatus
from .serializers import RegisterSerializer, UserSerializer
from .services import AuthService


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = AuthService.generate_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PendingFarmerQueueView(APIView):
    """
    Endpoint for Admin Verification Queue tab
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        pending_farmers = User.objects.filter(verification_status=VerificationStatus.PENDING)
        serializer = UserSerializer(pending_farmers, many=True)
        return Response(serializer.data)


class ApproveFarmerView(APIView):
    """
    Endpoint to click 'Approve Farmer Credentials'
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, farmer_id):
        try:
            farmer = AuthService.approve_farmer(farmer_id)
            return Response({
                "message": f"Farmer {farmer.full_name} approved successfully.",
                "user": UserSerializer(farmer).data
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)