from rest_framework import viewsets, permissions
from .models import ProduceBatch, Listing
from .serializers import ProduceBatchSerializer, ListingSerializer


class ProduceBatchViewSet(viewsets.ModelViewSet):
    serializer_class = ProduceBatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProduceBatch.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.filter(is_active=True)
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


class ProductViewSet(ListingViewSet):
    """ViewSet for managing marketplace product listings."""
    pass