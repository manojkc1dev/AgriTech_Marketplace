import django_filters
from apps.products.models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price_per_unit", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price_per_unit", lookup_expr='lte')
    category = django_filters.UUIDFilter(field_name="category_id")
    search = django_filters.CharFilter(field_name="title", lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['category', 'status', 'min_price', 'max_price', 'search']
