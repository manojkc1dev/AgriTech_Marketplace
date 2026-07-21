from django.urls import path
from .views import FarmerDashboardAnalyticsView, MarketplaceOverviewAnalyticsView

urlpatterns = [
    path('dashboard/', FarmerDashboardAnalyticsView.as_view(), name='farmer_dashboard_analytics'),
    path('overview/', MarketplaceOverviewAnalyticsView.as_view(), name='marketplace_overview_analytics'),
]