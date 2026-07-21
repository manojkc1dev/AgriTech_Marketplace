from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)  # e.g., Vegetables, Fruits, Grains
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    title = models.CharField(max_length=200)  # e.g. "Fresh Red Tomato (Golbheda)"
    description = models.TextField(blank=True)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2, help_text="Base rate NRs / KG")
    available_stock_kg = models.PositiveIntegerField(help_text="Stock in KG")
    district = models.CharField(max_length=100, default='Kathmandu')  # e.g., Dhading, Kavre, Chitwan
    is_organic = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.available_stock_kg}KG @ NRs.{self.price_per_kg}/KG ({self.district})"