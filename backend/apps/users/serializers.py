"""
User serializers for auth and profile management.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        first = validated_data.pop('first_name', '')
        last = validated_data.pop('last_name', '')
        validated_data['full_name'] = f'{first} {last}'.strip()
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'first_name', 'last_name',
            'phone', 'avatar', 'avatar_url', 'role', 'is_verified', 'created_at'
        )
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'created_at')

    def get_first_name(self, obj):
        parts = (obj.full_name or '').split(' ', 1)
        return parts[0] if parts else ''

    def get_last_name(self, obj):
        parts = (obj.full_name or '').split(' ', 1)
        return parts[1] if len(parts) > 1 else ''

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class UpdateProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('full_name', 'first_name', 'last_name', 'phone', 'avatar')

    def update(self, instance, validated_data):
        first = validated_data.pop('first_name', None)
        last = validated_data.pop('last_name', None)
        if first is not None or last is not None:
            current_parts = (instance.full_name or '').split(' ', 1)
            new_first = first if first is not None else current_parts[0]
            new_last = last if last is not None else (current_parts[1] if len(current_parts) > 1 else '')
            validated_data['full_name'] = f'{new_first} {new_last}'.strip()
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=False)

    def validate(self, attrs):
        if 'confirm_password' in attrs and attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'phone', 'role',
            'is_active', 'is_verified', 'created_at'
        )
        read_only_fields = ('id', 'email', 'created_at')


class UpdateUserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('role',)
