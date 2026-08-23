from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer
from marketplace.models import Listing


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({"error": "Order must contain at least one item."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(buyer=request.user, total_amount=0)
        total = 0

        for item in items_data:
            try:
                listing = Listing.objects.select_for_update().get(id=item['listing_id'], is_active=True)
            except Listing.DoesNotExist:
                transaction.set_rollback(True)
                return Response({"error": f"Listing ID {item['listing_id']} not found or inactive."}, status=status.HTTP_400_BAD_REQUEST)

            qty = float(item['quantity'])
            if listing.stock_quantity < qty:
                transaction.set_rollback(True)
                return Response({"error": f"Insufficient stock for {listing.title}. Available: {listing.stock_quantity}"}, status=status.HTTP_400_BAD_REQUEST)

            listing.stock_quantity -= qty
            listing.save()

            item_total = listing.price_per_unit * qty
            total += item_total

            OrderItem.objects.create(
                order=order,
                listing=listing,
                quantity=qty,
                unit_price=listing.price_per_unit
            )

        order.total_amount = total
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)