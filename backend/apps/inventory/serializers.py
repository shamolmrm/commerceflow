from rest_framework import serializers
from .models import Inventory, InventoryLog, Supplier, PurchaseOrder, PurchaseOrderItem


class InventoryLogSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = InventoryLog
        fields = ('id', 'change_type', 'quantity_change', 'quantity_after',
                  'notes', 'created_by_name', 'created_at')


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    logs = InventoryLogSerializer(many=True, read_only=True)

    class Meta:
        model = Inventory
        fields = ('id', 'product', 'product_name', 'product_sku',
                  'warehouse', 'warehouse_name', 'quantity',
                  'low_stock_threshold', 'is_low_stock', 'is_out_of_stock',
                  'logs', 'updated_at')


class AdjustInventorySerializer(serializers.Serializer):
    change_type = serializers.ChoiceField(choices=InventoryLog.ChangeType.choices)
    quantity = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ('id', 'name', 'email', 'phone', 'address', 'contact_person', 'is_active', 'created_at')


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = PurchaseOrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price')


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ('id', 'supplier', 'supplier_name', 'warehouse', 'status',
                  'total_amount', 'expected_date', 'notes', 'items', 'created_at')
