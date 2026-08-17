from rest_framework import serializers
from .models import ProduceBatch, Listing


class ProduceBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduceBatch
        fields = '__all__'
        read_only_fields = ['producer']


class ListingSerializer(serializers.ModelSerializer):
    produce_batch_details = ProduceBatchSerializer(source='produce_batch', read_only=True)

    class Meta:
        model = Listing
        fields = '__all__'