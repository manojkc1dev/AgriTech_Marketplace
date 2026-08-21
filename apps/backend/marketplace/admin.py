from django.contrib import admin
from .models import Category, ProductListing


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(ProductListing)
class ProductListingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'farmer',
        'category',
        'price_per_unit',
        'quantity_available',
        'unit',
        'is_active',
        'created_at',
    )
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('title', 'farmer__email', 'description')
    readonly_fields = ('created_at', 'updated_at')