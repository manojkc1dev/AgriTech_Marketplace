from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CooperativeViewSet, AnnouncementViewSet, MessageViewSet

app_name = 'cooperatives'

# Initialize DRF Router
router = DefaultRouter()
router.register(r'cooperatives', CooperativeViewSet, basename='cooperative')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]