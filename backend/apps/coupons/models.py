"""
Coupon model.
"""
from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    class CouponType(models.TextChoices):
        PERCENTAGE = 'percentage', 'Percentage'
        FIXED = 'fixed', 'Fixed Amount'

    code = models.CharField(max_length=50, unique=True, db_index=True)
    type = models.CharField(max_length=20, choices=CouponType.choices)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    expiry = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    description = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coupons'
        verbose_name = 'Coupon'
        verbose_name_plural = 'Coupons'

    def __str__(self):
        return f'{self.code} ({self.type}: {self.value})'

    @property
    def is_valid(self):
        if not self.is_active:
            return False
        if timezone.now() > self.expiry:
            return False
        if self.max_uses and self.used_count >= self.max_uses:
            return False
        return True

    def calculate_discount(self, order_total):
        if not self.is_valid:
            return 0
        if order_total < self.min_order:
            return 0
        if self.type == self.CouponType.PERCENTAGE:
            return round(order_total * self.value / 100, 2)
        return min(self.value, order_total)
