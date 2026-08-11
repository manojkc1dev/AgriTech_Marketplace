import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending Payment')
    PAID = 'PAID', _('Paid')
    PROCESSING = 'PROCESSING', _('Processing')
    SHIPPED = 'SHIPPED', _('Shipped')
    DELIVERED = 'DELIVERED', _('Delivered')
    CANCELLED = 'CANCELLED', _('Cancelled')


class PaymentStatus(models.TextChoices):
    UNPAID = 'UNPAID', _('Unpaid')
    PAID = 'PAID', _('Paid')
    FAILED = 'FAILED', _('Failed')
    REFUNDED = 'REFUNDED', _('Refunded')


class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=32, unique=True, editable=False)
    
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
        db_index=True
    )
    
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    shipping_address = models.TextField()
    contact_phone = models.CharField(max_length=20)
    
    idempotency_key = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', 'status']),
            models.Index(fields=['status', 'payment_status']),
            models.Index(fields=['created_at', 'status']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(total_amount__gt=Decimal('0.00')),
                name='order_total_must_be_positive'
            ),
        ]

    def __str__(self) -> str:
        return f"Order {self.order_number} ({self.get_status_display()})"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    
    # Historical snapshots locked at order creation time
    product_title = models.CharField(max_length=255)
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_order_items'
        indexes = [
            models.Index(fields=['order', 'product']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(unit_price__gt=Decimal('0.00')),
                name='item_unit_price_must_be_positive'
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gt=Decimal('0.00')),
                name='item_quantity_must_be_positive'
            ),
            models.CheckConstraint(
                condition=models.Q(subtotal__gt=Decimal('0.00')),
                name='item_subtotal_must_be_positive'
            ),
        ]

    def __str__(self) -> str:
        return f"{self.quantity} x {self.product_title} for Order {self.order_id}"