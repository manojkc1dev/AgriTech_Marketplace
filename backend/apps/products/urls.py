from django.urls import path
from .views import ProductListCreateView, ProductDetailView, CategoryListView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('', ProductListCreateView.as_view(), name='product_list_create'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
]