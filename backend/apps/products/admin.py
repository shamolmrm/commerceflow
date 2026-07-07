from django.contrib import admin
from .models import Product, ProductImage, ProductVariant


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'image_url', 'alt_text', 'is_primary', 'sort_order')


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ('name', 'value', 'price_modifier', 'stock')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'brand', 'price', 'is_active', 'is_featured', 'created_at')
    list_filter = ('is_active', 'is_featured', 'category', 'brand')
    search_fields = ('name', 'sku', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductVariantInline]
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active', 'is_featured')


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'is_primary', 'sort_order')
    list_filter = ('is_primary',)
    search_fields = ('product__name', 'alt_text')


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'value', 'price_modifier', 'stock')
    search_fields = ('product__name', 'name', 'value')
