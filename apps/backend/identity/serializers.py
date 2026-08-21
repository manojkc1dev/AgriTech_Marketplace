from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PlatformRole, AdminRole

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'username', 
            'first_name', 
            'last_name', 
            'phone_number', 
            'password', 
            'password_confirm', 
            'platform_role'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields do not match."})
        
        # Prevent self-assignment of admin or none platform roles via public registration
        requested_role = attrs.get('platform_role', PlatformRole.BUYER)
        if requested_role == PlatformRole.NONE:
            attrs['platform_role'] = PlatformRole.BUYER

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', None),
            password=validated_data['password'],
            platform_role=validated_data.get('platform_role', PlatformRole.BUYER),
            admin_role=AdminRole.NONE,  # Strict server-side override to prevent privilege escalation
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'username', 
            'first_name', 
            'last_name', 
            'phone_number', 
            'platform_role', 
            'admin_role', 
            'is_kyc_verified', 
            'is_mfa_enabled'
        ]
        read_only_fields = fields