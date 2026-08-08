from django.urls import path
from .views import MarketPriceAlertsView, MarketPriceIndexView, MarketPriceStatsView

urlpatterns = [
    path('', MarketPriceIndexView.as_view(), name='market-price_index'),
    path('stats/', MarketPriceStatsView.as_view(), name='market-price_stats'),
    path('alerts/', MarketPriceAlertsView.as_view(), name='market-price_alerts'),
]