"""
Custom permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'superadmin'


class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['superadmin', 'manager']
        )


class IsStaffOrAbove(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['superadmin', 'manager', 'staff']
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow users to access their own resources; admins can access all."""
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['superadmin', 'manager']:
            return True
        # Check if the object has a user/customer field
        owner = getattr(obj, 'user', None) or getattr(obj, 'customer', None)
        return owner == request.user


class IsVerified(BasePermission):
    message = 'Please verify your email to access this resource.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified


class ReadOnlyOrAdmin(BasePermission):
    """Allow read for all; write only for admins."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated and
            request.user.role in ['superadmin', 'manager']
        )
