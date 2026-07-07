from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.serializers import ProductListSerializer
from apps.products.models import ProductVariant


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    variant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    unit_price = serializers.ReadOnlyField()
    line_total = serializers.ReadOnlyField()
    variant_info = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'variant_id', 'variant_info',
                  'quantity', 'unit_price', 'line_total', 'added_at')

    def get_variant_info(self, obj):
        if obj.variant:
            return f'{obj.variant.name}: {obj.variant.value}'
        return None

    def validate_product_id(self, value):
        from apps.products.models import Product
        try:
            Product.objects.get(pk=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError('Product not found or inactive.')
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()
    discount = serializers.SerializerMethodField()
    coupon_code = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total', 'item_count', 'discount', 'coupon_code')

    def get_discount(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'session'):
            coupon_code = request.session.get('coupon_code')
            if coupon_code:
                from apps.coupons.models import Coupon
                try:
                    coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                    return float(coupon.calculate_discount(obj.total))
                except Coupon.DoesNotExist:
                    pass
        return 0

    def get_coupon_code(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'session'):
            return request.session.get('coupon_code')
        return None


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
