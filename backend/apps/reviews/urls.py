from django.urls import path
from .views import ProductReviewListCreateView

urlpatterns = [
    path('', ProductReviewListCreateView.as_view(), name='review_list_create'),
]