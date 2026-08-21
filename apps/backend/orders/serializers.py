from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    buyer = serializers.ReadOnlyField(source='buyer.email')

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('total_price', 'status')