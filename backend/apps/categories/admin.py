from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'sort_order', 'created_at')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'sort_order')
    readonly_fields = ('created_at', 'updated_at')
