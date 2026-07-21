from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, CurrentUserView, PendingFarmerQueueView, ApproveFarmerView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
    path('admin/pending-farmers/', PendingFarmerQueueView.as_view(), name='admin_pending_farmers'),
    path('admin/approve-farmer/<int:farmer_id>/', ApproveFarmerView.as_view(), name='admin_approve_farmer'),
]