from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.serializers import ProductSerializer  # Adjust path if needed


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "subtotal", "added_at"]

    def get_subtotal(self, obj):
        return float(obj.product.price * obj.quantity)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "total_amount", "updated_at"]
        read_only_fields = ["user"]

    def get_total_amount(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())