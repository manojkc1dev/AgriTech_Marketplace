from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'status', 'payment_gateway', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_gateway')
    search_fields = ('buyer__email', 'transaction_id')
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'listing', 'quantity', 'unit_price')