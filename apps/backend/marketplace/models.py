from django.conf import settings
from django.db import models


class ProduceBatch(models.Model):
    producer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='produce_batches',
    )
    crop_name = models.CharField(max_length=100)
    quantity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    harvest_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_name} ({self.quantity_kg} kg) - {self.producer.email}"


class ListingStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    SOLD_OUT = 'SOLD_OUT', 'Sold Out'
    CANCELLED = 'CANCELLED', 'Cancelled'


class Listing(models.Model):
    produce_batch = models.ForeignKey(
        ProduceBatch,
        on_delete=models.CASCADE,
        related_name='listings',
    )
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    available_quantity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=ListingStatus.choices,
        default=ListingStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Listing #{self.id} - {self.produce_batch.crop_name} @ NRs.{self.price_per_kg}/kg"