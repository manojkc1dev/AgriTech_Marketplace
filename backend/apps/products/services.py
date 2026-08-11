from apps.products.models import Product


class ProductService:
    """
    Service layer for handling product-related business logic.
    """

    @staticmethod
    def get_active_products():
        """Returns all active products."""
        return Product.objects.filter(is_active=True)

    @staticmethod
    def get_product_by_id(product_id):
        """Fetches a single product instance by ID."""
        return Product.objects.get(pk=product_id)
