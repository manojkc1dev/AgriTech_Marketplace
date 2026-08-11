from django.db import transaction
from apps.orders.models import Order


class OrderService:
    """
    Service layer for handling order processing and business logic.
    """

    @staticmethod
    def get_orders_for_user(user):
        """Returns orders where the user is either the buyer or seller."""
        if getattr(user, 'is_staff', False):
            return Order.objects.all()
        return Order.objects.filter(buyer=user)

    @staticmethod
    def get_order_by_id(order_id):
        """Fetches a single order instance by ID."""
        return Order.objects.get(pk=order_id)

    @staticmethod
    @transaction.atomic
    def create_order(user, validated_data):
        """Creates an order instance."""
        return Order.objects.create(buyer=user, **validated_data)
