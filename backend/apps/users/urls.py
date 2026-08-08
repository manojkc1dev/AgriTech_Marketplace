from django.urls import path
from .views import pending_verification_view, verify_user_view, delete_user_view

urlpatterns = [
    path('admin/users/pending-verification/', pending_verification_view, name='admin-pending-users'),
    path('admin/users/<int:user_id>/verify/', verify_user_view, name='admin-verify-user'),
    path('admin/users/<int:user_id>/', delete_user_view, name='admin-delete-user'),
]