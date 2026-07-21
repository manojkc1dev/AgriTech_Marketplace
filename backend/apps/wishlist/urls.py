from django.urls import path
from .views import WishlistListToggleView

urlpatterns = [
    path('', WishlistListToggleView.as_view(), name='wishlist_list_toggle'),
]