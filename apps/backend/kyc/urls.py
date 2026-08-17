from django.urls import path
from .views import KYCApplicationView, DocumentUploadView, KYCAdminReviewView

urlpatterns = [
    path('me/', KYCApplicationView.as_view(), name='kyc-me'),
    path('documents/', DocumentUploadView.as_view(), name='kyc-document-upload'),
    path('review/<int:pk>/', KYCAdminReviewView.as_view(), name='kyc-admin-review'),
]