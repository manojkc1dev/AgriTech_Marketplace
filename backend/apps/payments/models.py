import uuid
from django.db import models
from apps.orders.models import Order


class PaymentGateway(models.TextChoices):
    ESEWA = "ESEWA", "eSewa"
    KHALTI = "KHALTI", "Khalti"


class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PAID = "PAID", "Paid"
    COMPLETED = "COMPLETED", "Completed"
    FAILED = "FAILED", "Failed"
    ESCROW_HELD = "ESCROW_HELD", "Held in Escrow"
    REFUNDED = "REFUNDED", "Refunded"


class PaymentTransaction(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="transactions"
    )
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    gateway = models.CharField(
        max_length=20,
        choices=PaymentGateway.choices,
        default=PaymentGateway.ESEWA,
    )
    is_successful = models.BooleanField(default=False)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.gateway} - {self.transaction_id} (Success: {self.is_successful})"