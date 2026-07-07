from django.contrib import admin
from apps.inventory.models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'email', 'phone')
    list_editable = ('is_active',)
    readonly_fields = ('created_at',)
