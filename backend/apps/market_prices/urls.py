from django.urls import path
from .views import MarketPriceIndexView, MarketPriceStatsView

urlpatterns = [
    path('', MarketPriceIndexView.as_view(), name='market_price_index'),
    path('stats/', MarketPriceStatsView.as_view(), name='market_price_stats'),
]