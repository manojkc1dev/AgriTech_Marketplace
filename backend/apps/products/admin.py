from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'farmer', 'category', 'price_per_kg', 'available_stock_kg', 'district', 'is_organic', 'is_available')
    list_filter = ('category', 'is_organic', 'is_available', 'district')
    search_fields = ('title', 'farmer__full_name', 'district')