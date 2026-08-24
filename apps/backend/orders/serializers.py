from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    listing_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'listing', 'listing_id', 'quantity', 'unit_price']
        read_only_fields = ['listing', 'unit_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    buyer = serializers.ReadOnlyField(source='buyer.email')

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'status', 'total_amount', 'items', 'created_at']
        read_only_fields = ['buyer', 'status', 'total_amount', 'created_at']


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value):
        allowed_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {allowed_statuses}"
            )
        return value


class PaymentInitiateSerializer(serializers.Serializer):
    gateway = serializers.ChoiceField(choices=['KHALTI', 'ESEWA'], default='KHALTI')
    return_url = serializers.URLField(default="http://localhost:3000/payment/callback")


class PaymentVerifySerializer(serializers.Serializer):
    gateway = serializers.ChoiceField(choices=['KHALTI', 'ESEWA'], default='KHALTI')
    pidx = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Khalti payment index (pidx) token",
    )
    transaction_uuid = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="eSewa transaction UUID",
    )