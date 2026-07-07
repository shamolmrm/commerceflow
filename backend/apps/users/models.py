"""
User model with roles, OTP verification, and profile data.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'superadmin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        SUPERADMIN = 'superadmin', 'Super Admin'
        MANAGER = 'manager', 'Manager'
        STAFF = 'staff', 'Staff'
        CUSTOMER = 'customer', 'Customer'

    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # OTP fields
    otp_code = models.CharField(max_length=6, blank=True)
    otp_expiry = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f'{self.email} ({self.role})'

    @property
    def is_admin(self):
        return self.role in [self.Role.SUPERADMIN, self.Role.MANAGER]

    def generate_otp(self):
        import random
        self.otp_code = str(random.randint(100000, 999999))
        self.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        self.save(update_fields=['otp_code', 'otp_expiry'])
        return self.otp_code

    def verify_otp(self, code):
        if self.otp_code == code and timezone.now() < self.otp_expiry:
            self.is_verified = True
            self.otp_code = ''
            self.otp_expiry = None
            self.save(update_fields=['is_verified', 'otp_code', 'otp_expiry'])
            return True
        return False
