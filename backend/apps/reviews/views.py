from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Review
from .serializers import ReviewSerializer


class ProductReviewListCreateView(APIView):
    """
    GET: Fetch reviews for a specific product (?product_id=X) or all reviews
    POST: Submit a review/rating for a product
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        product_id = request.query_params.get('product_id')
        if product_id:
            reviews = Review.objects.filter(product_id=product_id)
        else:
            reviews = Review.objects.all()

        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']

            # Prevent duplicate review from same buyer for same product
            if Review.objects.filter(reviewer=request.user, product=product).exists():
                return Response(
                    {"error": "You have already submitted a review for this product."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save(reviewer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)