from rest_framework import serializers
from .models import Category, ProduceBatch, Listing


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProduceBatchSerializer(serializers.ModelSerializer):
    farmer = serializers.ReadOnlyField(source='farmer.email')

    class Meta:
        model = ProduceBatch
        fields = '__all__'


class ListingSerializer(serializers.ModelSerializer):
    farmer = serializers.ReadOnlyField(source='farmer.email')
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Listing
        fields = '__all__'