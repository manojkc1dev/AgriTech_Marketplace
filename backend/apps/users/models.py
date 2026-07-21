from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    FARMER = 'FARMER', 'Farmer (किसान)'
    BUYER = 'BUYER', 'B2B Buyer'
    COOPERATIVE = 'COOPERATIVE', 'Cooperative Lead'
    ADMIN = 'ADMIN', 'System Admin'


class VerificationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Verification'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'


class District(models.TextChoices):
    DHADING = 'DHADING', 'Dhading'
    KATHMANDU = 'KATHMANDU', 'Kathmandu'
    MAKWANPUR = 'MAKWANPUR', 'Makwanpur'
    KAVRE = 'KAVRE', 'Kavre'
    CHITWAN = 'CHITWAN', 'Chitwan'
    TERAI = 'TERAI', 'Terai Region'
    OTHER = 'OTHER', 'Other Region'


class User(AbstractUser):
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True)
    district = models.CharField(
        max_length=50, 
        choices=District.choices, 
        default=District.KATHMANDU
    )
    role = models.CharField(
        max_length=20, 
        choices=UserRole.choices, 
        default=UserRole.FARMER
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )

    def save(self, *args, **kwargs):
        # Auto-approve Buyers and Admins; Farmers require explicit admin review
        if not self.pk:
            if self.role in [UserRole.BUYER, UserRole.ADMIN]:
                self.verification_status = VerificationStatus.APPROVED
            elif self.role == UserRole.FARMER:
                self.verification_status = VerificationStatus.PENDING
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} (@{self.username}) - {self.get_role_display()}"