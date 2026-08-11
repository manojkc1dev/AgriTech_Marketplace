from decimal import Decimal
from rest_framework import serializers
from apps.orders.models import Order, OrderItem, OrderStatus, PaymentStatus


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=2)


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemCreateSerializer(many=True, min_length=1)
    shipping_address = serializers.CharField(max_length=1000)
    contact_phone = serializers.CharField(max_length=20)
    idempotency_key = serializers.CharField(max_length=255, required=False, allow_null=True)


class OrderItemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'unit_price', 'quantity', 'subtotal']


class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status',
            'total_amount', 'items_count', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemDetailSerializer(many=True, read_only=True)
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'buyer_email', 'status', 'payment_status',
            'total_amount', 'shipping_address', 'contact_phone',
            'idempotency_key', 'items', 'created_at', 'updated_at'
        ]


class OrderStateTransitionSerializer(serializers.Serializer):
    target_status = serializers.ChoiceField(choices=OrderStatus.choices)