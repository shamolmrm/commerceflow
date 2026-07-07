from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.ReadOnlyField()
    min_order_amount = serializers.DecimalField(
        source='min_order', max_digits=10, decimal_places=2, required=False, default=0
    )
    expiry = serializers.DateTimeField(
        input_formats=['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', 'iso-8601'],
        allow_null=True, required=False,
    )

    class Meta:
        model = Coupon
        fields = ('id', 'code', 'type', 'value', 'min_order_amount', 'max_uses',
                  'used_count', 'expiry', 'is_active', 'description', 'is_valid', 'created_at')
        read_only_fields = ('used_count', 'created_at')
