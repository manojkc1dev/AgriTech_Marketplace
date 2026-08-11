import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

phone_validator = RegexValidator(
    regex=r'^\+?[1-9]\d{1,14}$',
    message=_("Phone number must be entered in E.164 format (e.g. +9779800000000).")
)


class UserManager(BaseUserManager):
    """
    Custom user manager where email is the primary unique identifier for authentication.
    """
    def create_user(self, email: str, password: str = None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        
        if not extra_fields.get('username'):
            extra_fields['username'] = email.split('@')[0] + "_" + uuid.uuid4().hex[:6]
            
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str = None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('kyc_status', KycStatus.APPROVED)
        extra_fields.setdefault('is_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', _('Admin')
    FARMER = 'FARMER', _('Farmer')
    BUYER = 'BUYER', _('Buyer')
    COOPERATIVE = 'COOPERATIVE', _('Cooperative')


class KycStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending Approval')
    APPROVED = 'APPROVED', _('Approved')
    REJECTED = 'REJECTED', _('Rejected')


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True, db_index=True)
    
    role = models.CharField(
        max_length=30,
        choices=UserRole.choices,
        default=UserRole.BUYER,
        db_index=True
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        unique=True,
        validators=[phone_validator]
    )
    citizenship_number = models.CharField(max_length=50, blank=True, null=True)
    pan_number = models.CharField(max_length=50, blank=True, null=True)
    
    kyc_status = models.CharField(
        max_length=20,
        choices=KycStatus.choices,
        default=KycStatus.PENDING,
        db_index=True
    )
    kyc_verified_at = models.DateTimeField(blank=True, null=True)
    
    cooperative = models.ForeignKey(
        'cooperatives.Cooperative',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='members'
    )

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'app_users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        indexes = [
            models.Index(fields=['email', 'role']),
            models.Index(fields=['kyc_status', 'is_verified']),
        ]

    def __str__(self) -> str:
        return f"{self.email} ({self.get_role_display()})"