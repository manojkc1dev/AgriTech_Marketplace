from rest_framework import serializers
from .models import Shipment


class ShipmentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'id', 'order', 'order_id', 'tracking_code', 'driver_name',
            'driver_phone', 'vehicle_number', 'pickup_address',
            'delivery_address', 'status', 'status_display',
            'dispatched_at', 'delivered_at', 'updated_at'
        ]
        read_only_fields = ['tracking_code', 'updated_at']