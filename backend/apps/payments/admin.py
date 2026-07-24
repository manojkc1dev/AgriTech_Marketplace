from django.contrib import admin
from .models import PaymentTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "transaction_id",
        "order",
        "gateway",
        "amount",
        "is_successful",
        "created_at",
    )
    list_filter = ("gateway", "is_successful", "created_at")
    search_fields = ("transaction_id", "order__id")