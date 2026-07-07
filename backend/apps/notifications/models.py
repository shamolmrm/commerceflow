"""
Notification model (in-app + email tracking).
"""
from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        ORDER_PLACED = 'order_placed', 'Order Placed'
        ORDER_STATUS = 'order_status', 'Order Status Change'
        LOW_STOCK = 'low_stock', 'Low Stock Alert'
        NEW_USER = 'new_user', 'New User Registration'
        PAYMENT_SUCCESS = 'payment_success', 'Payment Success'
        PAYMENT_FAILED = 'payment_failed', 'Payment Failed'
        COUPON_EXPIRY = 'coupon_expiry', 'Coupon Expiry Warning'
        GENERAL = 'general', 'General'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=30, choices=NotificationType.choices, default=NotificationType.GENERAL)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=300, blank=True)  # Frontend URL to redirect to
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'is_read'])]

    def __str__(self):
        return f'{self.type}: {self.title} → {self.user.email}'


class Newsletter(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'newsletter'

    def __str__(self):
        return self.email
