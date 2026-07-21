from django.db import models
from apps.orders.models import Order


class PaymentGateway(models.TextChoices):
    ESEWA = 'ESEWA', 'eSewa'
    KHALTI = 'KHALTI', 'Khalti'
    STRIPE = 'STRIPE', 'Stripe'
    COD = 'COD', 'Cash on Delivery'


class PaymentTransaction(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    transaction_id = models.CharField(max_length=100, unique=True)
    gateway = models.CharField(
        max_length=20, 
        choices=PaymentGateway.choices, 
        default=PaymentGateway.ESEWA
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_successful = models.BooleanField(default=False)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Txn #{self.transaction_id} | Order #{self.order.id} | NRs. {self.amount}"