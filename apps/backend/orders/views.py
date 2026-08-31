from decimal import Decimal
from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, serializers, status, viewsets
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
from .services import (
    initiate_esewa_payment,
    initiate_khalti_payment,
    verify_esewa_payment,
    verify_khalti_payment as verify_khalti_service,
)


class OrderViewSet(viewsets.ModelViewSet):
  serializer_class = OrderSerializer
  permission_classes = [permissions.IsAuthenticated]

  def get_queryset(self):
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
    items_data = request.data.get("items", [])
    if not items_data:
      return Response(
          {"error": "Order must contain at least one item."},
          status=status.HTTP_400_BAD_REQUEST,
      )

    order = Order.objects.create(
        buyer=request.user, total_amount=Decimal("0.00")
    )
    total = Decimal("0.00")

    for item in items_data:
      try:
        listing = Listing.objects.select_for_update().get(
            id=item["listing_id"], is_active=True
        )
      except Listing.DoesNotExist:
        transaction.set_rollback(True)
        return Response(
            {"error": f"Listing ID {item['listing_id']} not found or inactive."},
            status=status.HTTP_400_BAD_REQUEST,
        )

      try:
        qty = Decimal(str(item["quantity"]))
      except (ValueError, TypeError):
        transaction.set_rollback(True)
        return Response(
            {"error": "Invalid quantity format."},
            status=status.HTTP_400_BAD_REQUEST,
        )

      if listing.stock_quantity < qty:
        transaction.set_rollback(True)
        return Response(
            {
                "error": (
                    f"Insufficient stock for {listing.title}. Available:"
                    f" {listing.stock_quantity}"
                )
            },
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
      methods=["patch"],
      url_path="status",
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
      responses={200: serializers.Serializer},
  )
  @action(detail=True, methods=["post"], url_path="initiate-payment")
  def initiate_payment(self, request, pk=None):
    order = self.get_object()
    if order.status != "PENDING":
      return Response(
          {"error": "Only pending orders can be paid."},
          status=status.HTTP_400_BAD_REQUEST,
      )

    serializer = PaymentInitiateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    gateway = serializer.validated_data["gateway"]
    return_url = serializer.validated_data["return_url"]

    if gateway == "KHALTI":
      res_data, status_code = initiate_khalti_payment(
          order, return_url, request.user
      )
      if status_code == 200:
        order.payment_gateway = "KHALTI"
        if pidx := res_data.get("pidx"):
          order.transaction_id = pidx
        order.save()
      return Response(res_data, status_code)

    elif gateway == "ESEWA":
      payload = initiate_esewa_payment(order, return_url)
      order.payment_gateway = "ESEWA"
      order.transaction_id = payload.get("transaction_uuid")
      order.save()
      return Response(payload, status=status.HTTP_200_OK)

    return Response(
        {"error": f"Gateway {gateway} is not supported."},
        status=status.HTTP_400_BAD_REQUEST,
    )

  @extend_schema(
      summary="Verify payment callback",
      request=PaymentVerifySerializer,
      responses={200: OrderSerializer},
  )
  @action(detail=False, methods=["post"], url_path="verify-payment")
  def verify_payment(self, request):
    serializer = PaymentVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    gateway = serializer.validated_data["gateway"]
    pidx = serializer.validated_data.get("pidx")
    transaction_uuid = serializer.validated_data.get("transaction_uuid")

    if gateway == "KHALTI" and pidx:
      res_data, status_code = verify_khalti_service(pidx)
      payment_status = res_data.get("status", "").lower()
      if status_code == 200 and payment_status in ["completed", "complete"]:
        try:
          order = Order.objects.get(transaction_id=pidx)
        except Order.DoesNotExist:
          return Response(
              {"error": f"Order with pidx {pidx} not found."},
              status=status.HTTP_404_NOT_FOUND,
          )

        order.status = "CONFIRMED"
        order.payment_gateway = "KHALTI"
        order.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

      return Response(
          {"error": "Khalti payment verification failed.", "details": res_data},
          status=(
              status.HTTP_400_BAD_REQUEST if status_code == 200 else status_code
          ),
      )

    elif gateway == "ESEWA" and transaction_uuid:
      try:
        order_id = transaction_uuid.split("-")[1]
        order = Order.objects.get(id=order_id)
      except (Order.DoesNotExist, IndexError, ValueError):
        return Response(
            {"error": "Invalid transaction_uuid or order not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

      if order.status == "CONFIRMED":
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

      res_data, status_code = verify_esewa_payment(
          transaction_uuid, order.total_amount
      )
      esewa_status = res_data.get("status", "").upper()
      if status_code == 200 and esewa_status in ["COMPLETE", "COMPLETED"]:
        order.status = "CONFIRMED"
        order.payment_gateway = "ESEWA"
        order.transaction_id = transaction_uuid
        order.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

      return Response(
          {
              "error": "eSewa transaction not marked as COMPLETE.",
              "details": res_data,
          },
          status=(
              status.HTTP_400_BAD_REQUEST if status_code == 200 else status_code
          ),
      )

    return Response(
        {"error": "Invalid verification payload or missing gateway parameters."},
        status=status.HTTP_400_BAD_REQUEST,
    )