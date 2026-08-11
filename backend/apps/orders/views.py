from django.db import models
from django.core.exceptions import ValidationError
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.models import UserRole
from apps.orders.models import Order
from apps.orders.permissions import IsOrderParticipantOrAdmin
from apps.orders.serializers import (
    OrderCreateSerializer,
    OrderListSerializer,
    OrderDetailSerializer,
    OrderStateTransitionSerializer
)
from apps.orders.services import OrderService


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrderParticipantOrAdmin]
    http_method_names = ['get', 'post']

    def get_queryset(self):
        user = self.request.user

        # Defensive check for unauthenticated requests
        if not user or not user.is_authenticated:
            return Order.objects.none()

        queryset = Order.objects.prefetch_related('items__product').select_related('buyer')

        # Platform administrators can view all orders
        if user.is_superuser or user.role == UserRole.ADMIN:
            return queryset.all()

        # Buyers view their own orders; Sellers view orders containing their listed products
        return queryset.filter(
            models.Q(buyer=user) | models.Q(items__product__seller=user)
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action == 'list':
            return OrderListSerializer
        return OrderDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order, created = OrderService.create_order(
                buyer=request.user,
                items_data=serializer.validated_data['items'],
                shipping_address=serializer.validated_data['shipping_address'],
                contact_phone=serializer.validated_data['contact_phone'],
                idempotency_key=serializer.validated_data.get('idempotency_key')
            )
            response_serializer = OrderDetailSerializer(order, context={'request': request})
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response(response_serializer.data, status=status_code)

        except ValidationError as exc:
            error_detail = exc.messages if hasattr(exc, 'messages') else str(exc)
            return Response({"error": error_detail}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='transition')
    def transition_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStateTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated_order = OrderService.transition_order_status(
                order_id=str(order.id),
                target_status=serializer.validated_data['target_status'],
                actor=request.user
            )
            return Response(
                OrderDetailSerializer(updated_order, context={'request': request}).data,
                status=status.HTTP_200_OK
            )
        except ValidationError as exc:
            error_detail = exc.messages if hasattr(exc, 'messages') else str(exc)
            return Response({"error": error_detail}, status=status.HTTP_400_BAD_REQUEST)