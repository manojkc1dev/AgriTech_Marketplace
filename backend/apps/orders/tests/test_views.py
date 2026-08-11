from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError

from apps.orders.models import Order, OrderItem
from apps.products.services import ProductService


class OrderService:

    @classmethod
    @transaction.atomic
    def create_order(
        cls,
        buyer=None,
        user=None,
        items_data=None,
        shipping_address="",
        contact_phone="",
        payment_method="COD",
        idempotency_key=None,
        validated_data=None,
        **kwargs
    ):
        order_buyer = buyer or user or kwargs.get('buyer') or kwargs.get('user')
        if not order_buyer:
            raise ValidationError("A valid buyer or user is required to create an order.")

        # Extract items from validated_data or kwargs if not passed directly
        if items_data is None:
            if validated_data and 'items' in validated_data:
                items_data = validated_data['items']
            else:
                items_data = kwargs.get('items', [])

        # Extract extra field values if provided via validated_data
        if validated_data:
            shipping_address = shipping_address or validated_data.get('shipping_address', '')
            contact_phone = contact_phone or validated_data.get('contact_phone', '')
            payment_method = payment_method or validated_data.get('payment_method', 'COD')

        # Idempotency check if supported by model and provided
        if idempotency_key and hasattr(Order, 'idempotency_key'):
            existing_order = Order.objects.filter(idempotency_key=idempotency_key).first()
            if existing_order:
                return existing_order, False

        order_kwargs = {
            'buyer': order_buyer,
            'shipping_address': shipping_address,
            'contact_phone': contact_phone,
        }
        if hasattr(Order, 'payment_method'):
            order_kwargs['payment_method'] = payment_method
        if idempotency_key and hasattr(Order, 'idempotency_key'):
            order_kwargs['idempotency_key'] = idempotency_key

        order = Order.objects.create(**order_kwargs)
        total_amount = Decimal('0.00')

        for item_data in items_data:
            product = item_data.get('product_id') or item_data.get('product')
            quantity = Decimal(str(item_data['quantity']))

            # Deduct stock via ProductService
            updated_product = ProductService.deduct_stock(
                product=product,
                quantity=quantity
            )

            unit_price = getattr(updated_product, 'price_per_unit', Decimal('0.00'))
            subtotal = unit_price * quantity
            total_amount += subtotal

            OrderItem.objects.create(
                order=order,
                product=updated_product if hasattr(updated_product, 'id') else product,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal
            )

        order.total_amount = total_amount
        order.save(update_fields=['total_amount'])

        return order, True

    @classmethod
    @transaction.atomic
    def transition_order_status(cls, order_id, target_status, actor):
        try:
            order = Order.objects.select_for_update().get(id=order_id)
        except Order.DoesNotExist:
            raise ValidationError("Order not found.")

        order.status = target_status
        order.save(update_fields=['status'])
        return order