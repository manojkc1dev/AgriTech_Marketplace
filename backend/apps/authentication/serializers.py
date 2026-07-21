from rest_framework import serializers
from apps.users.models import User, UserRole, District, VerificationStatus


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'phone', 'district', 
            'role', 'role_display', 'verification_status', 
            'verification_status_display', 'date_joined'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['full_name', 'username', 'phone', 'district', 'role', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', 'AgriTechPass123!')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user