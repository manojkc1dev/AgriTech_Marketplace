from django.contrib import admin
from .models import DocumentRecord, KYCApplication


class DocumentRecordInline(admin.TabularInline):
    model = DocumentRecord
    extra = 0
    readonly_fields = ('uploaded_at',)
    fields = ('document_type', 'document_number', 'file_url', 'uploaded_at')


@admin.register(KYCApplication)
class KYCApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'status',
        'submitted_at',
        'reviewed_at',
        'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = (
        'user__email',
        'user__username',
        'user__first_name',
        'user__last_name',
        'documents__document_number',
    )
    readonly_fields = ('created_at', 'updated_at')
    inlines = [DocumentRecordInline]


@admin.register(DocumentRecord)
class DocumentRecordAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'application',
        'document_type',
        'document_number',
        'uploaded_at',
    )
    list_filter = ('document_type', 'uploaded_at')
    search_fields = (
        'document_number',
        'application__user__email',
    )
    readonly_fields = ('uploaded_at',)