from django.contrib.auth.models import AbstractUser
from django.db import models


class PlatformRole(models.TextChoices):
    NONE = 'NONE', 'None'
    FARMER = 'FARMER', 'Farmer'
    BUYER = 'BUYER', 'Buyer'
    COOPERATIVE_MANAGER = 'COOPERATIVE_MANAGER', 'Cooperative Manager'
    LOGISTICS_MANAGER = 'LOGISTICS_MANAGER', 'Logistics Manager'
    DELIVERY_AGENT = 'DELIVERY_AGENT', 'Delivery Agent'


class AdminRole(models.TextChoices):
    NONE = 'NONE', 'None'
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
    ADMIN = 'ADMIN', 'Admin'
    KYC_ADMIN = 'KYC_ADMIN', 'KYC Admin'
    OPERATIONS_ADMIN = 'OPERATIONS_ADMIN', 'Operations Admin'
    LOGISTICS_ADMIN = 'LOGISTICS_ADMIN', 'Logistics Admin'
    FINANCE_ADMIN = 'FINANCE_ADMIN', 'Finance Admin'
    SUPPORT_ADMIN = 'SUPPORT_ADMIN', 'Support Admin'


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    platform_role = models.CharField(
        max_length=30,
        choices=PlatformRole.choices,
        default=PlatformRole.NONE,
    )
    admin_role = models.CharField(
        max_length=30,
        choices=AdminRole.choices,
        default=AdminRole.NONE,
    )
    is_mfa_enabled = models.BooleanField(default=False)
    is_kyc_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.email} ({self.platform_role} / {self.admin_role})"