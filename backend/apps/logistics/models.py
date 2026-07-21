from django.db import models
from apps.orders.models import Order


class ShipmentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Pickup'
    PICKED_UP = 'PICKED_UP', 'Picked Up'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    DELIVERED = 'DELIVERED', 'Delivered'
    FAILED = 'FAILED', 'Delivery Failed'


class Shipment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    tracking_code = models.CharField(max_length=50, unique=True)
    driver_name = models.CharField(max_length=150, blank=True)
    driver_phone = models.CharField(max_length=20, blank=True)
    vehicle_number = models.CharField(max_length=50, blank=True)  # e.g., Ba 2 Cha 1234
    pickup_address = models.TextField()
    delivery_address = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=ShipmentStatus.choices,
        default=ShipmentStatus.PENDING
    )
    dispatched_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment #{self.tracking_code} | Order #{self.order.id} ({self.status})"