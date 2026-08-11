from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import LoginView, RegisterView, UserProfileView

app_name = 'users'

urlpatterns = [
    # Authentication routes
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Profile & Account Management
    path('profile/', UserProfileView.as_view(), name='profile'),
]