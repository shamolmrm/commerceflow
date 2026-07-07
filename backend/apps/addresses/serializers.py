from rest_framework import serializers
from .models import Address


class AddressSerializer(serializers.ModelSerializer):
    # Expose frontend-expected field names as aliases
    address_line1 = serializers.CharField(source='address_line')
    address_line2 = serializers.SerializerMethodField()
    postal_code = serializers.CharField(source='zip_code')

    class Meta:
        model = Address
        fields = (
            'id', 'label', 'full_name', 'phone',
            'address_line1', 'address_line2', 'address_line',
            'city', 'state', 'country', 'postal_code', 'zip_code',
            'is_default', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

    def get_address_line2(self, obj):
        return ''

    def create(self, validated_data):
        # Accept address_line1 → address_line, postal_code → zip_code
        return super().create(validated_data)

    def to_internal_value(self, data):
        # Map frontend field names to model field names
        data = data.copy()
        if 'address_line1' in data and 'address_line' not in data:
            data['address_line'] = data.pop('address_line1')
        if 'postal_code' in data and 'zip_code' not in data:
            data['zip_code'] = data.pop('postal_code')
        return super().to_internal_value(data)
