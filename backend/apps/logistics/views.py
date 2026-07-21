import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from apps.orders.models import Order, OrderStatus
from .models import Shipment, ShipmentStatus
from .serializers import ShipmentSerializer


class DispatchOrderView(APIView):
    """
    POST: Assign driver & vehicle, create shipment record for an order
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        driver_name = request.data.get('driver_name', '')
        driver_phone = request.data.get('driver_phone', '')
        vehicle_number = request.data.get('vehicle_number', '')
        pickup_address = request.data.get('pickup_address', '')

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        tracking_code = f"TRK-{uuid.uuid4().hex[:8].upper()}"

        shipment, created = Shipment.objects.update_or_create(
            order=order,
            defaults={
                'tracking_code': tracking_code,
                'driver_name': driver_name,
                'driver_phone': driver_phone,
                'vehicle_number': vehicle_number,
                'pickup_address': pickup_address,
                'delivery_address': order.delivery_address,
                'status': ShipmentStatus.PICKED_UP,
                'dispatched_at': timezone.now()
            }
        )

        order.order_status = OrderStatus.SHIPPED
        order.save()

        return Response(ShipmentSerializer(shipment).data, status=status.HTTP_201_CREATED)


class TrackShipmentView(APIView):
    """
    GET: Fetch real-time shipment status by tracking code
    PATCH: Update shipment status (e.g., mark DELIVERED)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, tracking_code):
        try:
            shipment = Shipment.objects.get(tracking_code=tracking_code)
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment tracking code invalid."}, status=status.HTTP_404_NOT_FOUND)

        return Response(ShipmentSerializer(shipment).data, status=status.HTTP_200_OK)

    def patch(self, request, tracking_code):
        try:
            shipment = Shipment.objects.get(tracking_code=tracking_code)
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment tracking code invalid."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status in ShipmentStatus.values:
            shipment.status = new_status
            if new_status == ShipmentStatus.DELIVERED:
                shipment.delivered_at = timezone.now()
                # Update main order status
                shipment.order.order_status = OrderStatus.DELIVERED
                shipment.order.save()
            shipment.save()
            return Response(ShipmentSerializer(shipment).data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid shipment status."}, status=status.HTTP_400_BAD_REQUEST)