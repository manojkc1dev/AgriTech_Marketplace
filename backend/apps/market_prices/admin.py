from django.contrib import admin
from .models import MarketOrigin, DailyMarketPrice


@admin.register(MarketOrigin)
class MarketOriginAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'district')
    search_fields = ('name', 'district')
    list_filter = ('region',)


@admin.register(DailyMarketPrice)
class DailyMarketPriceAdmin(admin.ModelAdmin):
    list_display = ('crop_name', 'market_origin', 'daily_rate', 'weekly_trend_percentage', 'date_registered')
    list_filter = ('market_origin__region', 'crop_name', 'date_registered')
    search_fields = ('crop_name', 'market_origin__name')
    date_hierarchy = 'date_registered'