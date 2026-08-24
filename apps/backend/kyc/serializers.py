from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import DocumentRecord, KYCApplication, VerificationStatus


class DocumentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRecord
        fields = ['id', 'document_type', 'document_number', 'file_url', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class KYCApplicationSerializer(serializers.ModelSerializer):
    documents = DocumentRecordSerializer(many=True, required=False)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = KYCApplication
        fields = [
            'id',
            'user_email',
            'status',
            'rejection_reason',
            'submitted_at',
            'reviewed_at',
            'created_at',
            'updated_at',
            'documents',
        ]
        read_only_fields = [
            'id',
            'user_email',
            'status',
            'rejection_reason',
            'submitted_at',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]

    def _save_documents(self, application, documents_data):
        """Helper to clear existing documents and replace them with new data."""
        if documents_data:
            application.documents.all().delete()
            for doc_data in documents_data:
                DocumentRecord.objects.create(application=application, **doc_data)

    def create(self, validated_data):
        documents_data = validated_data.pop('documents', [])
        user = self.context['request'].user

        with transaction.atomic():
            application, created = KYCApplication.objects.get_or_create(
                user=user,
                defaults={
                    'status': VerificationStatus.SUBMITTED,
                    'submitted_at': timezone.now(),
                },
            )

            if not created:
                application.status = VerificationStatus.SUBMITTED
                application.submitted_at = timezone.now()
                application.rejection_reason = None
                application.save()

            self._save_documents(application, documents_data)

        return application

    def update(self, instance, validated_data):
        documents_data = validated_data.pop('documents', [])

        with transaction.atomic():
            instance.status = VerificationStatus.SUBMITTED
            instance.submitted_at = timezone.now()
            instance.rejection_reason = None
            instance.save()

            self._save_documents(instance, documents_data)

        return instance


class KYCReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    reason = serializers.CharField(required=False, allow_blank=True, default='')