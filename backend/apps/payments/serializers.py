from rest_framework import serializers
from .models import PaymentTransaction


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'order', 'transaction_id', 'gateway', 'amount', 'is_successful', 'created_at']
        read_only_fields = ['transaction_id', 'is_successful', 'created_at']