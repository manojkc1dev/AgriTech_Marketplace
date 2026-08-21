from django.conf import settings
from django.db import models


class VerificationStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'


class DocumentType(models.TextChoices):
    CITIZENSHIP = 'CITIZENSHIP', 'Citizenship'
    PAN_CARD = 'PAN_CARD', 'PAN Card'
    BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION', 'Business Registration'


class KYCApplication(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kyc_application',
    )
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.DRAFT,
    )
    rejection_reason = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"KYC ({self.user.email}) - {self.status}"


class DocumentRecord(models.Model):
    application = models.ForeignKey(
        KYCApplication,
        on_delete=models.CASCADE,
        related_name='documents',
    )
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    document_number = models.CharField(max_length=100)
    file_url = models.CharField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type} - {self.application.user.email}"