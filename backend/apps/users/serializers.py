from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer to inject enterprise claims (role, kyc_status, cooperative)
    into token payload and login response body.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Claims stored directly inside the JWT signature
        token['username'] = user.username or user.email
        token['email'] = user.email
        token['role'] = user.role
        token['kyc_status'] = user.kyc_status
        token['is_verified'] = user.is_verified
        token['cooperative_id'] = user.cooperative_id
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Detailed user profile returned in response body upon successful authentication
        data['user'] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "role": self.user.role,
            "kyc_status": self.user.kyc_status,
            "phone_number": self.user.phone_number,
            "cooperative_id": self.user.cooperative_id,
            "is_verified": self.user.is_verified,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'username', 
            'password', 
            'role', 
            'phone_number', 
            'citizenship_number', 
            'pan_number',
            'cooperative'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'role', 
            'phone_number', 
            'citizenship_number', 
            'pan_number', 
            'kyc_status', 
            'kyc_verified_at', 
            'cooperative', 
            'is_verified'
        ]
        read_only_fields = ['email', 'role', 'kyc_status', 'kyc_verified_at', 'is_verified']