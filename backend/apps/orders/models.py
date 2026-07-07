"""
Order models: Order, OrderItem.
"""
from django.db import models
from django.conf import settings
import uuid
from apps.products.models import Product, ProductVariant
from apps.addresses.models import Address
from apps.coupons.models import Coupon


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'
        RETURNED = 'returned', 'Returned'
        REFUNDED = 'refunded', 'Refunded'

    class PaymentMethod(models.TextChoices):
        STRIPE = 'stripe', 'Stripe'
        PAYPAL = 'paypal', 'PayPal'
        SSLCOMMERZ = 'sslcommerz', 'SSLCommerz'
        COD = 'cod', 'Cash on Delivery'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='orders'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_charge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    coupon = models.ForeignKey(
        Coupon, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='orders'
    )
    shipping_address = models.ForeignKey(
        Address, on_delete=models.SET_NULL,
        null=True, related_name='shipping_orders'
    )
    billing_address = models.ForeignKey(
        Address, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='billing_orders'
    )
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'ORD-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)  # Snapshot at time of order
    variant_info = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Order.Status.choices)
    notes = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='order_status_changes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_status_history'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.order.order_number}: {self.status}'
