from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'full_name', 'phone', 'district', 'role', 'verification_status', 'is_staff')
    list_filter = ('role', 'verification_status', 'district', 'is_staff')
    search_fields = ('username', 'full_name', 'phone')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AgriTech Profile Identity', {
            'fields': ('full_name', 'phone', 'district', 'role', 'verification_status')
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('AgriTech Profile Identity', {
            'fields': ('full_name', 'phone', 'district', 'role', 'verification_status')
        }),
    )