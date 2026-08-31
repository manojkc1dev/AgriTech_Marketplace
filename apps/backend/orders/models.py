from django.conf import settings
from django.db import models
from marketplace.models import Listing


class Order(models.Model):
  STATUS_CHOICES = [
      ('PENDING', 'Pending'),
      ('CONFIRMED', 'Confirmed'),
      ('CANCELLED', 'Cancelled'),
      ('DELIVERED', 'Delivered'),
  ]

  GATEWAY_CHOICES = [
      ('NONE', 'None'),
      ('KHALTI', 'Khalti'),
      ('ESEWA', 'eSewa'),
  ]

  buyer = models.ForeignKey(
      settings.AUTH_USER_MODEL,
      on_delete=models.CASCADE,
      related_name='orders',
  )
  status = models.CharField(
      max_length=20, choices=STATUS_CHOICES, default='PENDING'
  )
  payment_gateway = models.CharField(
      max_length=20, choices=GATEWAY_CHOICES, default='NONE'
  )
  transaction_id = models.CharField(
      max_length=255,
      blank=True,
      null=True,
      help_text='Stores transaction_uuid for eSewa or pidx for Khalti.',
  )
  total_amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=0.00
  )
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    ordering = ['-created_at']

  def __str__(self):
    return f'Order #{self.id} - {self.buyer.email} ({self.status})'


class OrderItem(models.Model):
  order = models.ForeignKey(
      Order, on_delete=models.CASCADE, related_name='items'
  )
  listing = models.ForeignKey(Listing, on_delete=models.PROTECT)
  quantity = models.DecimalField(max_digits=10, decimal_places=2)
  unit_price = models.DecimalField(max_digits=10, decimal_places=2)

  def __str__(self):
    return f'{self.quantity} x {self.listing.title}'