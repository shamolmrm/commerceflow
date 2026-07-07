"""
Auth and user management views.
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    UpdateProfileSerializer, ForgotPasswordSerializer,
    VerifyOTPSerializer, ResetPasswordSerializer, ChangePasswordSerializer,
    AdminUserSerializer, UpdateUserRoleSerializer
)
from .permissions import IsSuperAdmin, IsStaffOrAbove

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=RegisterSerializer, tags=['Auth'])
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send OTP for email verification (non-fatal if broker unavailable)
        try:
            otp = user.generate_otp()
            from apps.notifications.tasks import send_otp_email
            send_otp_email.delay(user.id, otp)
        except Exception:
            pass

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Registration successful. Please verify your email.',
            'user': UserSerializer(user).data,
            **tokens
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=LoginSerializer, tags=['Auth'])
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if not user.is_active:
            return Response(
                {'detail': 'Account has been deactivated.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful.',
            'user': UserSerializer(user, context={'request': request}).data,
            **tokens
        })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Auth'])
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except TokenError:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateProfileSerializer
        return UserSerializer

    @extend_schema(tags=['Auth'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=['Auth'])
    def patch(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=ForgotPasswordSerializer, tags=['Auth'])
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            otp = user.generate_otp()
            from apps.notifications.tasks import send_otp_email
            send_otp_email.delay(user.id, otp, purpose='reset')
        except User.DoesNotExist:
            pass  # Don't reveal whether email exists

        return Response({'message': 'If an account exists, an OTP has been sent.'})


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=VerifyOTPSerializer, tags=['Auth'])
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            if user.verify_otp(serializer.validated_data['otp_code']):
                tokens = get_tokens_for_user(user)
                return Response({
                    'message': 'OTP verified successfully.',
                    'user': UserSerializer(user).data,
                    **tokens
                })
            return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=ResetPasswordSerializer, tags=['Auth'])
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            if user.otp_code != serializer.validated_data['otp_code']:
                return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            if timezone.now() > user.otp_expiry:
                return Response({'detail': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.otp_code = ''
            user.otp_expiry = None
            user.save()
            return Response({'message': 'Password reset successfully.'})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=ChangePasswordSerializer, tags=['Auth'])
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'detail': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})


# ── Admin user management ──────────────────────────────────────────────
class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all().order_by('-created_at')
    search_fields = ['email', 'full_name', 'phone']
    filterset_fields = ['role', 'is_active', 'is_verified']

    @extend_schema(tags=['Admin'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AdminUserRoleUpdateView(APIView):
    permission_classes = [IsSuperAdmin]

    @extend_schema(request=UpdateUserRoleSerializer, tags=['Admin'])
    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateUserRoleSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminUserSerializer(user).data)


class AdminUserDeleteView(APIView):
    permission_classes = [IsSuperAdmin]

    @extend_schema(tags=['Admin'])
    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
