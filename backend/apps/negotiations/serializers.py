from rest_framework import serializers
from .models import CounterOffer


class CounterOfferSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    total_sum = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CounterOffer
        fields = [
            'id', 'crop_name', 'buyer', 'buyer_name', 
            'farmer', 'farmer_name', 'volume_kg', 
            'offered_rate_per_kg', 'total_sum', 
            'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['buyer', 'created_at', 'updated_at']