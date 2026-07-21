from django.contrib import admin
from .models import DemandPost


@admin.register(DemandPost)
class DemandPostAdmin(admin.ModelAdmin):
    list_display = ('crop_name', 'quantity_wanted', 'offered_rate', 'buyer', 'status', 'created_at')
    list_filter = ('status', 'crop_name', 'created_at')
    search_fields = ('crop_name', 'buyer__full_name', 'buyer__username')