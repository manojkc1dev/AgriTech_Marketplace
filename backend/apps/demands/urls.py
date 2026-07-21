from django.urls import path
from .views import DemandPostListCreateView, MyDemandPostsView

urlpatterns = [
    path('', DemandPostListCreateView.as_view(), name='demand_list_create'),
    path('my-posts/', MyDemandPostsView.as_view(), name='my_demand_posts'),
]