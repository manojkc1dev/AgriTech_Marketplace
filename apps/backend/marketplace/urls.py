from rest_framework.routers import DefaultRouter
from .views import ProduceBatchViewSet, ListingViewSet

router = DefaultRouter()
router.register('batches', ProduceBatchViewSet, basename='batch')
router.register('listings', ListingViewSet, basename='listing')

urlpatterns = router.urls