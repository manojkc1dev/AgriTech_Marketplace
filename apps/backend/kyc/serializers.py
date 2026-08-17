from rest_framework import serializers
from .models import KYCApplication, DocumentRecord


class DocumentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRecord
        fields = ['id', 'document_type', 'document_number', 'file_url', 'uploaded_at']


class KYCApplicationSerializer(serializers.ModelSerializer):
    documents = DocumentRecordSerializer(many=True, read_only=True)

    class Meta:
        model = KYCApplication
        fields = ['id', 'user', 'status', 'rejection_reason', 'submitted_at', 'reviewed_at', 'documents', 'created_at']
        read_only_fields = ['user', 'status', 'rejection_reason', 'submitted_at', 'reviewed_at']