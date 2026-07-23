from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import DemandPost, DemandStatus
from .serializers import DemandPostSerializer
from drf_spectacular.utils import extend_schema


class DemandPostListCreateView(APIView):
    """
    GET: Public Broadcast Feed (All active demands)
    POST: Broadcast a new B2B Demand requirement
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        demands = DemandPost.objects.filter(status=DemandStatus.ACTIVE)
        serializer = DemandPostSerializer(demands, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @extend_schema(request=DemandPostSerializer)
    def post(self, request):
        serializer = DemandPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(buyer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyDemandPostsView(APIView):
    """
    GET: Current buyer's active/past demand posts feed
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        my_demands = DemandPost.objects.filter(buyer=request.user)
        serializer = DemandPostSerializer(my_demands, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)