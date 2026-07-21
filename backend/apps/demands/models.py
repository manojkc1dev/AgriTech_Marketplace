from django.db import models
from django.conf import settings


class DemandStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    FULFILLED = 'FULFILLED', 'Fulfilled'
    CANCELLED = 'CANCELLED', 'Cancelled'


class DemandPost(models.Model):
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='demand_posts'
    )
    crop_name = models.CharField(max_length=150)  # e.g., "Tomato (Golbheda)", "Ginger (Aduwa)"
    quantity_wanted = models.PositiveIntegerField(help_text="Quantity needed in KG")
    offered_rate = models.DecimalField(max_digits=10, decimal_places=2, help_text="NRs per KG")
    status = models.CharField(
        max_length=20, 
        choices=DemandStatus.choices, 
        default=DemandStatus.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.crop_name} - {self.quantity_wanted}KG @ NRs. {self.offered_rate}/KG"