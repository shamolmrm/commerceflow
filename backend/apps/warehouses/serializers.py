from rest_framework import serializers
from .models import Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    inventory_count = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = ('id', 'name', 'location', 'manager', 'manager_name', 'is_active', 'inventory_count', 'created_at')

    def get_inventory_count(self, obj):
        return obj.inventory.count()
