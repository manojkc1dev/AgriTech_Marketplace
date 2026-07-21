from django.urls import path
from .views import NegotiationListView, UpdateNegotiationStatusView

urlpatterns = [
    path('', NegotiationListView.as_view(), name='negotiation_list_create'),
    path('<int:pk>/status/', UpdateNegotiationStatusView.as_view(), name='negotiation_status_update'),
]