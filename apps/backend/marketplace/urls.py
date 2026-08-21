from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProduceBatchViewSet, ListingViewSet, ProductViewSet

router = DefaultRouter()
router.register('batches', ProduceBatchViewSet, basename='batch')
router.register('listings', ListingViewSet, basename='listing')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]