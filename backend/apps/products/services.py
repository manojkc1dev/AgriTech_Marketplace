from django.db import transaction
from django.core.exceptions import ValidationError
from apps.products.models import Product, ProductImage, ProductStatus


class ProductService:

    @staticmethod
    @transaction.atomic
    def create_product(seller, data: dict) -> Product:
        images_data = data.pop('images', [])
        product = Product.objects.create(seller=seller, **data)

        for img_data in images_data:
            ProductImage.objects.create(product=product, **img_data)

        return product

    @staticmethod
    @transaction.atomic
    def soft_delete_product(product: Product) -> Product:
        product.is_deleted = True
        if hasattr(ProductStatus, 'ARCHIVED'):
            product.status = ProductStatus.ARCHIVED
        product.save(update_fields=['is_deleted', 'status', 'updated_at'])
        return product

    @staticmethod
    @transaction.atomic
    def deduct_stock(product: Product, quantity: int) -> Product:
        if product.quantity_available < quantity:
            raise ValidationError("Insufficient stock available.")
        
        product.quantity_available -= quantity
        if product.quantity_available == 0 and hasattr(ProductStatus, 'OUT_OF_STOCK'):
            product.status = ProductStatus.OUT_OF_STOCK
            
        product.save(update_fields=['quantity_available', 'status', 'updated_at'])
        return product