from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.products.models import Category, Product, ProductImage
from apps.products.filters import ProductFilter
from apps.products.permissions import IsVerifiedAndKYCApproved, IsProductOwnerOrCoopAdminOrReadOnly
from apps.products.serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer, ProductImageSerializer
)
from apps.products.services import ProductService


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'seller', 'cooperative').prefetch_related('images').filter(is_deleted=False)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description', 'location_district', 'location_city']
    ordering_fields = ['price_per_unit', 'created_at', 'quantity_available']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Dynamically assign permissions:
        - SAFE methods (GET): Open to anyone (AllowAny) so customers can browse products.
        - UNSAFE methods (POST, PUT, DELETE): Require user to be authenticated, KYC approved, and owner/admin.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [
                permissions.IsAuthenticated,
                IsVerifiedAndKYCApproved,
                IsProductOwnerOrCoopAdminOrReadOnly
            ]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductCreateUpdateSerializer

    def perform_create(self, serializer):
        product = ProductService.create_product(
            seller=self.request.user,
            data=serializer.validated_data
        )
        serializer.instance = product

    def perform_destroy(self, instance):
        ProductService.soft_delete_product(instance)

    @action(detail=True, methods=['post'], url_path='upload-image')
    def upload_image(self, request, pk=None):
        product = self.get_object()  # Triggers object-level permission checks
        
        if product.images.count() >= 5:
            return Response(
                {"error": "Maximum of 5 images allowed per product listing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ProductImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        is_primary = serializer.validated_data.get('is_primary', False)
        if is_primary:
            product.images.filter(is_primary=True).update(is_primary=False)
            
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)