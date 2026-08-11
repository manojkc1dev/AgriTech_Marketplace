from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    
    # Fields to display in the user list view
    list_display = ('username', 'email', 'role', 'kyc_status', 'phone_number', 'is_staff')
    
    # Filters sidebar
    list_filter = ('role', 'kyc_status', 'is_staff', 'is_active')
    
    # Grouping fields inside the detail form page
    fieldsets = UserAdmin.fieldsets + (
        ('Enterprise & Role Settings', {
            'fields': ('role', 'phone_number', 'cooperative')
        }),
        ('KYC & Compliance Verification', {
            'fields': ('kyc_status', 'citizenship_number', 'pan_number', 'kyc_verified_at', 'is_verified')
        }),
    )
    
    # Fields available when creating a user from scratch in admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'role', 'phone_number')
        }),
    )