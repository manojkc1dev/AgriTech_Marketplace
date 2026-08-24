from decimal import Decimal
import requests
from django.conf import settings
from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from marketplace.models import Listing
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderStatusUpdateSerializer,
    PaymentInitiateSerializer,
    PaymentVerifySerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admins can view all orders; buyers view only their own
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(buyer=self.request.user)

    @extend_schema(
        summary="Create a new order",
        request=OrderSerializer,
        responses={201: OrderSerializer},
    )
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        items_data = request.data.get('items', [])
        if not items_data:
            return Response(
                {"error": "Order must contain at least one item."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = Order.objects.create(buyer=request.user, total_amount=Decimal('0.00'))
        total = Decimal('0.00')

        for item in items_data:
            try:
                listing = Listing.objects.select_for_update().get(
                    id=item['listing_id'], is_active=True
                )
            except Listing.DoesNotExist:
                transaction.set_rollback(True)
                return Response(
                    {"error": f"Listing ID {item['listing_id']} not found or inactive."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                qty = Decimal(str(item['quantity']))
            except (ValueError, TypeError):
                transaction.set_rollback(True)
                return Response(
                    {"error": "Invalid quantity format."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if listing.stock_quantity < qty:
                transaction.set_rollback(True)
                return Response(
                    {"error": f"Insufficient stock for {listing.title}. Available: {listing.stock_quantity}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            listing.stock_quantity -= qty
            listing.save()

            item_total = listing.price_per_unit * qty
            total += item_total

            OrderItem.objects.create(
                order=order,
                listing=listing,
                quantity=qty,
                unit_price=listing.price_per_unit,
            )

        order.total_amount = total
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Update order status (Admin/Seller)",
        request=OrderStatusUpdateSerializer,
        responses={200: OrderSerializer},
    )
    @action(
        detail=True,
        methods=['patch'],
        url_path='status',
        permission_classes=[permissions.IsAdminUser],
    )
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(
            order, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Initiate payment for an order",
        request=PaymentInitiateSerializer,
        responses={200: OrderSerializer},
    )
    @action(detail=True, methods=['post'], url_path='initiate-payment')
    def initiate_payment(self, request, pk=None):
        order = self.get_object()
        if order.status != 'PENDING':
            return Response(
                {"error": "Only pending orders can be paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gateway = serializer.validated_data['gateway']
        return_url = serializer.validated_data['return_url']

        if gateway == 'KHALTI':
            payload = {
                "return_url": return_url,
                "website_url": "http://localhost:3000",
                "amount": int(order.total_amount * 100),  # Amount in paisa
                "purchase_order_id": str(order.id),
                "purchase_order_name": f"Order #{order.id}",
                "customer_info": {
                    "name": request.user.email.split('@')[0],
                    "email": request.user.email,
                },
            }
            headers = {
                "Authorization": f"Key {getattr(settings, 'KHALTI_SECRET_KEY', 'Key test_secret_key')}",
                "Content-Type": "application/json",
            }

            response = requests.post(
                "https://a.khalti.com/api/v2/epayment/initiate/",
                json=payload,
                headers=headers,
            )
            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            return Response(response.json(), status=response.status_code)

        return Response(
            {"error": f"Gateway {gateway} is not supported yet."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @extend_schema(
        summary="Verify payment callback",
        request=PaymentVerifySerializer,
        responses={200: OrderSerializer},
    )
    @action(detail=False, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gateway = serializer.validated_data['gateway']
        pidx = serializer.validated_data.get('pidx')

        if gateway == 'KHALTI' and pidx:
            headers = {
                "Authorization": f"Key {getattr(settings, 'KHALTI_SECRET_KEY', 'Key test_secret_key')}",
                "Content-Type": "application/json",
            }
            response = requests.post(
                "https://a.khalti.com/api/v2/epayment/lookup/",
                json={"pidx": pidx},
                headers=headers,
            )

            if response.status_code == 200:
                res_data = response.json()
                if res_data.get('status') == 'Completed':
                    order_id = res_data.get('purchase_order_id')
                    order = Order.objects.get(id=order_id)
                    order.status = 'CONFIRMED'
                    order.save()
                    return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
                return Response(
                    {"error": "Payment is not marked as completed.", "details": res_data},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(response.json(), status=response.status_code)

        return Response(
            {"error": "Invalid verification payload or missing pidx."},
            status=status.HTTP_400_BAD_REQUEST,
        )