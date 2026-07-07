from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'variant', 'quantity', 'unit_price', 'total_price')


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('status', 'notes', 'created_at')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'status', 'subtotal', 'payment_method', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    list_editable = ('status',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'unit_price', 'total_price')
    search_fields = ('order__order_number', 'product__name')
    readonly_fields = ('total_price',)


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'status', 'created_at')
    list_filter = ('status',)
    readonly_fields = ('created_at',)
