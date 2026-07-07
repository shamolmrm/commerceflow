"""
Inventory models: stock levels, logs, purchase orders.
"""
from django.db import models
from django.conf import settings
from apps.products.models import Product
from apps.warehouses.models import Warehouse


class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory'
        unique_together = [['product', 'warehouse']]
        indexes = [models.Index(fields=['product', 'warehouse'])]

    def __str__(self):
        return f'{self.product.name} @ {self.warehouse.name}: {self.quantity}'

    @property
    def is_low_stock(self):
        return 0 < self.quantity <= self.low_stock_threshold

    @property
    def is_out_of_stock(self):
        return self.quantity <= 0


class InventoryLog(models.Model):
    class ChangeType(models.TextChoices):
        IN = 'in', 'Stock In'
        OUT = 'out', 'Stock Out'
        ADJUST = 'adjust', 'Adjustment'
        RETURN = 'return', 'Return'

    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='logs')
    change_type = models.CharField(max_length=10, choices=ChangeType.choices)
    quantity_change = models.IntegerField()
    quantity_after = models.IntegerField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='inventory_logs'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.change_type} {self.quantity_change} for {self.inventory}'


class Supplier(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    contact_person = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'suppliers'
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'

    def __str__(self):
        return self.name


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ORDERED = 'ordered', 'Ordered'
        RECEIVED = 'received', 'Received'
        CANCELLED = 'cancelled', 'Cancelled'

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='purchase_orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expected_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='purchase_orders'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_orders'

    def __str__(self):
        return f'PO-{self.id} ({self.supplier.name})'


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'purchase_order_items'

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'

    @property
    def total_price(self):
        return self.quantity * self.unit_price
