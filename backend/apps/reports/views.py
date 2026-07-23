from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Sum, Count, Avg, Q
from apps.orders.models import Order, OrderStatus, OrderItem
from apps.payments.models import PaymentStatus
from apps.products.models import Product


class FarmerDashboardAnalyticsView(APIView):
    """
    GET: Real-time sales and revenue performance metrics for the logged-in farmer
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Total & Escrow Earnings
        total_revenue = Order.objects.filter(
            farmer=user, 
            order_status=OrderStatus.DELIVERED
        ).aggregate(total=Sum('total_amount'))['total'] or 0.00

        escrow_held = Order.objects.filter(
            farmer=user, 
            payment_status=PaymentStatus.ESCROW_HELD
        ).aggregate(total=Sum('total_amount'))['total'] or 0.00

        # 2. Order Breakdown
        orders = Order.objects.filter(farmer=user)
        total_orders = orders.count()
        pending_orders = orders.filter(order_status=OrderStatus.PENDING).count()
        shipped_orders = orders.filter(order_status=OrderStatus.SHIPPED).count()
        delivered_orders = orders.filter(order_status=OrderStatus.DELIVERED).count()

        # 3. Product & Inventory Metrics
        products = Product.objects.filter(farmer=user)
        active_listings = products.filter(is_available=True).count()
        total_stock_kg = products.aggregate(total_stock=Sum('available_stock_kg'))['total_stock'] or 0

        # 4. Top Selling Crop
        top_selling_item = OrderItem.objects.filter(
            order__farmer=user, 
            order__order_status=OrderStatus.DELIVERED
        ).values('product__title').annotate(
            total_kg=Sum('quantity_kg'),
            total_earned=Sum('unit_price') * Sum('quantity_kg')
        ).order_by('-total_kg').first()

        data = {
            "financial_summary": {
                "total_revenue_nrs": total_revenue,
                "escrow_pending_nrs": escrow_held
            },
            "order_summary": {
                "total_orders": total_orders,
                "pending": pending_orders,
                "shipped": shipped_orders,
                "delivered": delivered_orders
            },
            "inventory_summary": {
                "active_listings": active_listings,
                "total_stock_kg": total_stock_kg
            },
            "top_performing_crop": top_selling_item or "No sales recorded yet"
        }

        return Response(data, status=status.HTTP_200_OK)


class MarketplaceOverviewAnalyticsView(APIView):
    """
    GET: System-wide Gross Merchandise Value (GMV) & marketplace throughput (Admin / Analytics)
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        gmv = Order.objects.filter(
            order_status=OrderStatus.DELIVERED
        ).aggregate(total=Sum('total_amount'))['total'] or 0.00

        total_orders = Order.objects.count()
        total_products = Product.objects.filter(is_available=True).count()

        return Response({
            "gross_merchandise_value_nrs": gmv,
            "total_orders_processed": total_orders,
            "active_market_listings": total_products
        }, status=status.HTTP_200_OK)