from rest_framework import serializers
from marketplace.serializers import ListingSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
  listing_id = serializers.IntegerField(write_only=True)
  listing_detail = ListingSerializer(source='listing', read_only=True)

  class Meta:
    model = OrderItem
    fields = [
        'id',
        'listing_id',
        'listing_detail',
        'quantity',
        'unit_price',
    ]
    read_only_fields = ['unit_price']


class OrderSerializer(serializers.ModelSerializer):
  items = OrderItemSerializer(many=True)
  buyer = serializers.ReadOnlyField(source='buyer.email')

  class Meta:
    model = Order
    fields = [
        'id',
        'buyer',
        'status',
        'payment_gateway',
        'transaction_id',
        'total_amount',
        'items',
        'created_at',
        'updated_at',
    ]
    read_only_fields = [
        'buyer',
        'status',
        'payment_gateway',
        'transaction_id',
        'total_amount',
        'created_at',
        'updated_at',
    ]


class OrderStatusUpdateSerializer(serializers.ModelSerializer):

  class Meta:
    model = Order
    fields = ['status']

  def validate_status(self, value):
    allowed_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
    if value not in allowed_statuses:
      raise serializers.ValidationError(
          f'Invalid status. Must be one of: {allowed_statuses}'
      )
    return value


class PaymentInitiateSerializer(serializers.Serializer):
  gateway = serializers.ChoiceField(
      choices=['KHALTI', 'ESEWA'], default='KHALTI'
  )
  return_url = serializers.URLField(
      default='http://localhost:3000/payment/callback'
  )


class PaymentVerifySerializer(serializers.Serializer):
  gateway = serializers.ChoiceField(
      choices=['KHALTI', 'ESEWA'], default='KHALTI'
  )
  pidx = serializers.CharField(
      required=False,
      allow_blank=True,
      help_text='Khalti payment index (pidx) token.',
  )
  transaction_uuid = serializers.CharField(
      required=False,
      allow_blank=True,
      help_text='eSewa transaction UUID.',
  )

  def validate(self, attrs):
    gateway = attrs.get('gateway')
    pidx = attrs.get('pidx')
    transaction_uuid = attrs.get('transaction_uuid')

    if gateway == 'KHALTI' and not pidx:
      raise serializers.ValidationError({
          'pidx': 'Field pidx is required when verifying Khalti payments.'
      })
    if gateway == 'ESEWA' and not transaction_uuid:
      raise serializers.ValidationError({
          'transaction_uuid': (
              'Field transaction_uuid is required when verifying eSewa'
              ' payments.'
          )
      })

    return attrs