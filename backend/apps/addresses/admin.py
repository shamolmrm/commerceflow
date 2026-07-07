from django.contrib import admin
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'city', 'country', 'is_default', 'created_at')
    list_filter = ('country', 'is_default')
    search_fields = ('user__email', 'full_name', 'city', 'address_line')
    list_editable = ('is_default',)
    readonly_fields = ('created_at', 'updated_at')
