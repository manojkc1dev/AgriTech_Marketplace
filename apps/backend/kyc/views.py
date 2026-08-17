from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DocumentRecord, KYCApplication, VerificationStatus
from .serializers import DocumentRecordSerializer, KYCApplicationSerializer


class KYCApplicationView(APIView):
    def get(self, request):
        application, _ = KYCApplication.objects.get_or_create(user=request.user)
        serializer = KYCApplicationSerializer(application)
        return Response(serializer.data)

    def post(self, request):
        application, _ = KYCApplication.objects.get_or_create(user=request.user)
        if application.status in [VerificationStatus.SUBMITTED, VerificationStatus.APPROVED]:
            return Response({'error': 'Application already submitted or approved.'}, status=status.HTTP_400_BAD_REQUEST)

        application.status = VerificationStatus.SUBMITTED
        application.submitted_at = timezone.now()
        application.save()
        return Response(KYCApplicationSerializer(application).data)


class DocumentUploadView(APIView):
    def post(self, request):
        application, _ = KYCApplication.objects.get_or_create(user=request.user)
        serializer = DocumentRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(application=application)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class KYCAdminReviewView(APIView):
    def post(self, request, pk):
        if request.user.admin_role not in ['KYC_ADMIN', 'SUPER_ADMIN']:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            application = KYCApplication.objects.get(pk=pk)
        except KYCApplication.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            application.status = VerificationStatus.APPROVED
            application.user.is_kyc_verified = True
            application.user.save()
        elif action == 'reject':
            application.status = VerificationStatus.REJECTED
            application.rejection_reason = request.data.get('reason', 'Requirements not met.')
        else:
            return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

        application.reviewed_at = timezone.now()
        application.save()
        return Response(KYCApplicationSerializer(application).data)