from django.urls import path
from .views import DispatchOrderView, TrackShipmentView

urlpatterns = [
    path('dispatch/', DispatchOrderView.as_view(), name='shipment_dispatch'),
    path('track/<str:tracking_code>/', TrackShipmentView.as_view(), name='shipment_track'),
]