"""
Auth URL configuration.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('register/', views.RegisterView.as_view(), name='auth-register'),
    path('login/', views.LoginView.as_view(), name='auth-login'),
    path('logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # Profile
    path('me/', views.MeView.as_view(), name='me'),
    path('me/update/', views.MeView.as_view(), name='me-update'),

    # Admin user management
    path('users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/role/', views.AdminUserRoleUpdateView.as_view(), name='admin-user-role'),
    path('users/<int:pk>/', views.AdminUserDeleteView.as_view(), name='admin-user-delete'),
]
