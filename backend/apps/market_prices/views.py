from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Avg, Min, Max
from .models import DailyMarketPrice
from .serializers import DailyMarketPriceSerializer


class MarketPriceIndexView(APIView):
    """
    Returns filtered active price directory for the frontend table.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = DailyMarketPrice.objects.select_related('market_origin').all()

        crop = request.query_params.get('crop')
        region = request.query_params.get('region')
        search = request.query_params.get('search')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')

        if search:
            queryset = queryset.filter(crop_name__icontains=search)
        if crop and crop != '-- Quick Product Select --':
            queryset = queryset.filter(crop_name__icontains=crop)
        if region and region != 'All Regions':
            queryset = queryset.filter(market_origin__region__iexact=region)
        if min_price:
            queryset = queryset.filter(daily_rate__gte=min_price)
        if max_price:
            queryset = queryset.filter(daily_rate__lte=max_price)

        serializer = DailyMarketPriceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarketPriceStatsView(APIView):
    """
    Computes summary cards (Avg Rate, Weekly Range, Volatility) for selected crop.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        crop = request.query_params.get('crop', 'Tomato (Golbheda)')
        region = request.query_params.get('region')

        queryset = DailyMarketPrice.objects.filter(crop_name__icontains=crop)
        if region and region != 'All Regions':
            queryset = queryset.filter(market_origin__region__iexact=region)

        stats = queryset.aggregate(
            avg_rate=Avg('daily_rate'),
            min_rate=Min('daily_rate'),
            max_rate=Max('daily_rate'),
        )

        avg_val = stats['avg_rate'] or 0
        min_val = stats['min_rate'] or 0
        max_val = stats['max_rate'] or 0

        return Response({
            'crop': crop,
            'avg_rate': round(avg_val, 2),
            'weekly_range': f"{round(min_val)}-{round(max_val)}",
            'volatility_nrs': round(max_val - min_val, 2),
        }, status=status.HTTP_200_OK)