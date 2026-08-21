from rest_framework import viewsets, permissions
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        listing = serializer.validated_data['listing']
        quantity = serializer.validated_data['quantity']
        total_price = listing.price_per_unit * quantity
        serializer.save(buyer=self.request.user, total_price=total_price)