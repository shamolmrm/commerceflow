from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from apps.addresses.models import Address
from apps.addresses.serializers import AddressSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'variant', 'product_name', 'variant_info',
                  'quantity', 'unit_price', 'total_price')
        read_only_fields = ('total_price',)


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='')

    class Meta:
        model = OrderStatusHistory
        fields = ('id', 'status', 'notes', 'changed_by_name', 'created_at')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True, default='')
    customer_email = serializers.CharField(source='customer.email', read_only=True, default='')
    shipping_address = AddressSerializer(read_only=True)

    # Frontend-compatible aliases
    tax_amount = serializers.DecimalField(source='tax', max_digits=10, decimal_places=2, read_only=True)
    shipping_cost = serializers.DecimalField(source='shipping_charge', max_digits=8, decimal_places=2, read_only=True)
    discount_amount = serializers.DecimalField(source='discount', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'customer', 'customer_name', 'customer_email',
            'status', 'subtotal',
            'tax', 'tax_amount',
            'shipping_charge', 'shipping_cost',
            'discount', 'discount_amount',
            'total', 'coupon', 'shipping_address', 'billing_address',
            'payment_method', 'payment_status', 'notes',
            'tracking_number', 'estimated_delivery',
            'items', 'status_history', 'created_at', 'updated_at'
        )
        read_only_fields = ('order_number', 'created_at', 'updated_at')


class CreateOrderSerializer(serializers.Serializer):
    shipping_address_id = serializers.IntegerField(required=False, allow_null=True)
    shipping_address = serializers.DictField(required=False, allow_null=True)
    billing_address_id = serializers.IntegerField(required=False, allow_null=True)
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('shipping_address_id') and not attrs.get('shipping_address'):
            raise serializers.ValidationError({'shipping_address': 'Shipping address is required.'})
        return attrs

    def validate_shipping_address_id(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if not Address.objects.filter(pk=value, user=request.user).exists():
            raise serializers.ValidationError('Address not found.')
        return value


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    tracking_number = serializers.CharField(required=False, allow_blank=True)
    estimated_delivery = serializers.DateField(required=False, allow_null=True)
