from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from drf_spectacular.utils import extend_schema


class CategoryListView(APIView):
    """
    GET: List all crop categories
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        responses={200: ProductSerializer(many=True)},
        summary="List all available products with optional filtering"
    )
    def get(self, request):
        queryset = Product.objects.filter(is_available=True).select_related('farmer', 'category')

        search = request.query_params.get('search')
        district = request.query_params.get('district')
        category = request.query_params.get('category')
        is_organic = request.query_params.get('organic')

        if search:
            queryset = queryset.filter(title__icontains=search)
        if district:
            queryset = queryset.filter(district__iexact=district)
        if category:
            queryset = queryset.filter(category__id=category)
        if is_organic is not None:
            queryset = queryset.filter(is_organic=is_organic.lower() == 'true')

        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ProductSerializer,
        responses={201: ProductSerializer},
        summary="Create a new product listing"
    )
    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(farmer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    


class ProductDetailView(APIView):
    """
    GET: View single product listing
    PUT/PATCH: Update listing stock/price
    DELETE: Remove listing
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        if product.farmer != request.user:
            return Response({"error": "Unauthorized action"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)