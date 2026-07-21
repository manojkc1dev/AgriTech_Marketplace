from django.contrib import admin
from .models import Shipment


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('tracking_code', 'order', 'status', 'vehicle_number', 'driver_phone', 'updated_at')
    list_filter = ('status',)
    search_fields = ('tracking_code', 'order__id', 'driver_name', 'vehicle_number')