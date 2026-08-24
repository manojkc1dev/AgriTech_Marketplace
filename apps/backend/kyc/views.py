from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import KYCApplication, VerificationStatus
from .serializers import (
    DocumentRecordSerializer,
    KYCApplicationSerializer,
    KYCReviewSerializer,
)


class KYCApplicationView(generics.RetrieveUpdateDestroyAPIView, generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = KYCApplicationSerializer

    def get_object(self):
        return KYCApplication.objects.filter(user=self.request.user).first()

    @extend_schema(summary="Get current user KYC application status")
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "No KYC application found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @extend_schema(summary="Create a new KYC application", request=KYCApplicationSerializer)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class DocumentUploadView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DocumentRecordSerializer

    @extend_schema(summary="Upload KYC document attachment", request=DocumentRecordSerializer)
    def perform_create(self, serializer):
        application, _ = KYCApplication.objects.get_or_create(
            user=self.request.user,
            defaults={'status': VerificationStatus.DRAFT},
        )
        serializer.save(application=application)


class KYCAdminReviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(
        summary="Approve or reject a KYC application (Admin only)",
        request=KYCReviewSerializer,
        responses={200: KYCApplicationSerializer},
    )
    def post(self, request, pk):
        serializer = KYCReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        reason = serializer.validated_data.get('reason', '')

        try:
            application = KYCApplication.objects.select_related('user').get(pk=pk)
        except KYCApplication.DoesNotExist:
            return Response(
                {'error': 'Application not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            if action == 'approve':
                application.status = VerificationStatus.APPROVED
                application.rejection_reason = None
                application.user.is_kyc_verified = True
            elif action == 'reject':
                application.status = VerificationStatus.REJECTED
                application.rejection_reason = reason or 'KYC application rejected.'
                application.user.is_kyc_verified = False

            application.reviewed_at = timezone.now()
            application.user.save()
            application.save()

        return Response(KYCApplicationSerializer(application).data, status=status.HTTP_200_OK)