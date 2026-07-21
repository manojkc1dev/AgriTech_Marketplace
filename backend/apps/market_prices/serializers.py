from rest_framework import serializers
from .models import MarketOrigin, DailyMarketPrice


class MarketOriginSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrigin
        fields = ['id', 'name', 'region', 'district']


class DailyMarketPriceSerializer(serializers.ModelSerializer):
    market_origin_name = serializers.CharField(source='market_origin.name', read_only=True)
    region = serializers.CharField(source='market_origin.region', read_only=True)

    class Meta:
        model = DailyMarketPrice
        fields = [
            'id', 'crop_name', 'market_origin', 'market_origin_name', 
            'region', 'daily_rate', 'weekly_trend_percentage', 'date_registered'
        ]