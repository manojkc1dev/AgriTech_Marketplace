from django.urls import path
from .views import PaymentInitiateView, PaymentVerifyView

app_name = "payments"

urlpatterns = [
    path("initiate/", PaymentInitiateView.as_view(), name="payment-initiate"),
    path("verify/", PaymentVerifyView.as_view(), name="payment-verify"),
]