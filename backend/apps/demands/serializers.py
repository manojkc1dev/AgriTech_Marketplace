from rest_framework import serializers
from .models import DemandPost


class DemandPostSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DemandPost
        fields = [
            'id', 'buyer', 'buyer_name', 'crop_name', 
            'quantity_wanted', 'offered_rate', 'status', 
            'status_display', 'created_at'
        ]
        read_only_fields = ['buyer', 'created_at']