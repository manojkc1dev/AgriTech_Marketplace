import uuid
from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


class UnitChoices(models.TextChoices):
    KG = 'KG', _('Kilogram')
    TON = 'TON', _('Metric Ton')
    QUINTAL = 'QUINTAL', _('Quintal')
    PIECE = 'PIECE', _('Piece')
    CRATE = 'CRATE', _('Crate')
    LITER = 'LITER', _('Liter')


class ProductStatus(models.TextChoices):
    DRAFT = 'DRAFT', _('Draft')
    ACTIVE = 'ACTIVE', _('Active')
    SOLD_OUT = 'SOLD_OUT', _('Sold Out')
    ARCHIVED = 'ARCHIVED', _('Archived')


class ActiveProductManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_categories'
        verbose_name_plural = _('Categories')
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    cooperative = models.ForeignKey(
        'cooperatives.Cooperative',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products'
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_available = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=20, choices=UnitChoices.choices, default=UnitChoices.KG)
    
    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.ACTIVE,
        db_index=True
    )
    location_district = models.CharField(max_length=100, db_index=True)
    location_city = models.CharField(max_length=100)
    
    is_deleted = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ActiveProductManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'app_products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_deleted', 'created_at']),
            models.Index(fields=['category', 'status', 'is_deleted']),
            models.Index(fields=['seller', 'is_deleted']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price_per_unit__gt=0),
                name='product_price_must_be_positive'
            ),
            models.CheckConstraint(
                check=models.Q(quantity_available__gte=0),
                name='product_quantity_must_be_non_negative'
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        if self.quantity_available == 0 and self.status == ProductStatus.ACTIVE:
            self.status = ProductStatus.SOLD_OUT
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.title} ({self.quantity_available} {self.unit})"


def product_image_upload_path(instance, filename: str) -> str:
    ext = filename.split('.')[-1].lower()
    return f"products/{instance.product.id}/{uuid.uuid4().hex}.{ext}"


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to=product_image_upload_path)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_product_images'
        ordering = ['-is_primary', 'created_at']

    def __str__(self) -> str:
        return f"Image {self.id} for Product {self.product_id}"