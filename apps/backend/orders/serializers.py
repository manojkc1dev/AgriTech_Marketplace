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