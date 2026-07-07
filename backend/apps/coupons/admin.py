from django.contrib import admin
from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'type', 'value', 'is_active', 'expiry', 'used_count', 'max_uses')
    list_filter = ('type', 'is_active')
    search_fields = ('code', 'description')
    list_editable = ('is_active',)
    readonly_fields = ('used_count', 'created_at')
