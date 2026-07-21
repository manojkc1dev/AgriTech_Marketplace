from django.contrib import admin
from .models import CounterOffer


@admin.register(CounterOffer)
class CounterOfferAdmin(admin.ModelAdmin):
    list_display = (
        'crop_name', 'farmer', 'buyer', 'volume_kg', 
        'offered_rate_per_kg', 'get_total_sum', 'status', 'updated_at'
    )
    list_filter = ('status', 'crop_name')
    search_fields = ('crop_name', 'farmer__full_name', 'buyer__full_name')

    @admin.display(description='Total Sum (NRs.)')
    def get_total_sum(self, obj):
        return f"NRs. {obj.total_sum:,.2f}"