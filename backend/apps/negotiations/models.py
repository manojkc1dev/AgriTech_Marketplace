from django.db import models
from django.conf import settings


class NegotiationStatus(models.TextChoices):
    NEGOTIATING = 'NEGOTIATING', 'Negotiating'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    REJECTED = 'REJECTED', 'Rejected'
    COMPLETED = 'COMPLETED', 'Completed'


class CounterOffer(models.Model):
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='buyer_negotiations'
    )
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_negotiations'
    )
    crop_name = models.CharField(max_length=150)  # e.g. Tomato (Golbheda)
    volume_kg = models.PositiveIntegerField(help_text="Volume in KG")
    offered_rate_per_kg = models.DecimalField(max_digits=10, decimal_places=2, help_text="NRs per KG")
    status = models.CharField(
        max_length=20,
        choices=NegotiationStatus.choices,
        default=NegotiationStatus.NEGOTIATING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    @property
    def total_sum(self):
        return self.volume_kg * self.offered_rate_per_kg

    def __str__(self):
        return f"{self.crop_name} | {self.volume_kg}KG @ NRs.{self.offered_rate_per_kg}/KG ({self.status})"