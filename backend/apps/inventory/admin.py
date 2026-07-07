from django.contrib import admin
from .models import Inventory, InventoryLog, PurchaseOrder, PurchaseOrderItem


class InventoryLogInline(admin.TabularInline):
    model = InventoryLog
    extra = 0
    readonly_fields = ('change_type', 'quantity_change', 'quantity_after', 'notes', 'created_at')


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'quantity', 'low_stock_threshold', 'updated_at')
    search_fields = ('product__name', 'product__sku')
    list_filter = ('warehouse',)
    inlines = [InventoryLogInline]


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ('inventory', 'change_type', 'quantity_change', 'quantity_after', 'created_at')
    list_filter = ('change_type', 'created_at')
    readonly_fields = ('created_at',)


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [PurchaseOrderItemInline]
    readonly_fields = ('created_at', 'updated_at')
