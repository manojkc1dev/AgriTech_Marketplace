from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from drf_spectacular.utils import extend_schema, inline_serializer

from .models import Wishlist
from .serializers import WishlistSerializer


class WishlistListToggleView(APIView):
    """
    GET: Retrieve logged-in user's wishlisted items
    POST: Save item to wishlist or remove if already exists (toggle)
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: WishlistSerializer(many=True)}
    )
    def get(self, request):
        items = Wishlist.objects.filter(user=request.user).select_related('product')
        serializer = WishlistSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=inline_serializer(
            name='WishlistToggleRequest',
            fields={
                'product': serializers.IntegerField(default=1, help_text="ID of the product to add/remove")
            }
        ),
        responses={
            200: inline_serializer(
                name='WishlistRemoveResponse',
                fields={
                    'message': serializers.CharField(),
                    'is_favorited': serializers.BooleanField()
                }
            ),
            201: inline_serializer(
                name='WishlistAddResponse',
                fields={
                    'message': serializers.CharField(),
                    'is_favorited': serializers.BooleanField(),
                    'item': WishlistSerializer()
                }
            )
        }
    )
    def post(self, request):
        product_id = request.data.get('product')
        if not product_id:
            return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        existing_item = Wishlist.objects.filter(user=request.user, product_id=product_id).first()

        if existing_item:
            existing_item.delete()
            return Response({"message": "Product removed from wishlist.", "is_favorited": False}, status=status.HTTP_200_OK)

        serializer = WishlistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Product added to wishlist.", "is_favorited": True, "item": serializer.data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)