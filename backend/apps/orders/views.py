from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from django.db.models import Q
from .models import Order, OrderItem, OrderStatus
from .serializers import OrderSerializer
from apps.products.models import Product


class OrderListCreateView(APIView):
    """
    GET: List current user's orders (buyer or seller)
    POST: Checkout / Place new order (atomically deducts product stock)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(
            Q(buyer=request.user) | Q(farmer=request.user)
        ).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request):
        items_data = request.data.get('items', [])
        delivery_address = request.data.get('delivery_address', '')

        if not items_data or not delivery_address:
            return Response(
                {"error": "Please provide items and delivery address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            first_product = Product.objects.get(id=items_data[0]['product_id'])
            farmer = first_product.farmer
        except Product.DoesNotExist:
            return Response({"error": "Invalid product ID."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            buyer=request.user,
            farmer=farmer,
            delivery_address=delivery_address,
            total_amount=0
        )

        total = 0
        for item in items_data:
            try:
                product = Product.objects.select_for_update().get(id=item['product_id'])
            except Product.DoesNotExist:
                transaction.set_rollback(True)
                return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

            quantity = int(item['quantity_kg'])

            if product.available_stock_kg < quantity:
                transaction.set_rollback(True)
                return Response(
                    {"error": f"Insufficient stock for {product.title}. Only {product.available_stock_kg}KG available."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            unit_price = product.price_per_kg
            subtotal = quantity * unit_price
            total += subtotal

            # Deduct inventory stock automatically
            product.available_stock_kg -= quantity
            if product.available_stock_kg == 0:
                product.is_available = False
            product.save()

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity_kg=quantity,
                unit_price=unit_price
            )

        order.total_amount = total
        order.save()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """
    GET: Retrieve single order details
    PATCH: Farmer/Buyer updates order status
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Order.objects.get(Q(id=pk) & (Q(buyer=user) | Q(farmer=user)))
        except Order.DoesNotExist:
            return None

    def get(self, request, pk):
        order = self.get_object(pk, request.user)
        if not order:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        order = self.get_object(pk, request.user)
        if not order:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('order_status')
        if new_status in OrderStatus.values:
            order.order_status = new_status
            order.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid order status."}, status=status.HTTP_400_BAD_REQUEST)