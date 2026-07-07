"""
Product serializers.
"""
from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant
from apps.categories.serializers import CategorySerializer
from apps.brands.serializers import BrandSerializer


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.ReadOnlyField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'image_url', 'url', 'alt_text', 'is_primary', 'sort_order')


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ('id', 'name', 'value', 'price_modifier', 'sku_suffix', 'stock', 'is_active')


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings."""
    primary_image = ProductImageSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    effective_price = serializers.ReadOnlyField()
    in_stock = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'price', 'sale_price',
            'effective_price', 'discount_percentage',
            'rating', 'review_count', 'is_featured', 'is_active',
            'primary_image', 'category', 'brand',
            'in_stock', 'total_stock', 'created_at'
        )

    def get_in_stock(self, obj):
        return obj.inventory.filter(quantity__gt=0).exists()

    def get_total_stock(self, obj):
        return sum(inv.quantity for inv in obj.inventory.all())


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail page."""
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = ProductImageSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    effective_price = serializers.ReadOnlyField()
    total_stock = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'description', 'short_description',
            'category', 'brand', 'price', 'sale_price', 'effective_price',
            'discount_percentage', 'tax_rate', 'weight',
            'is_featured', 'is_active', 'is_digital',
            'rating', 'review_count',
            'meta_title', 'meta_description',
            'primary_image', 'images', 'variants',
            'total_stock', 'in_stock', 'is_wishlisted',
            'created_at', 'updated_at'
        )

    def get_total_stock(self, obj):
        return sum(inv.quantity for inv in obj.inventory.all())

    def get_in_stock(self, obj):
        return obj.inventory.filter(quantity__gt=0).exists()

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.wishlisted_by.filter(user=request.user).exists()
        return False


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """For admin create/update."""
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'description', 'short_description',
            'category', 'brand', 'price', 'sale_price', 'tax_rate', 'weight',
            'is_featured', 'is_active', 'is_digital',
            'meta_title', 'meta_description',
            'images', 'variants'
        )
        read_only_fields = ('slug',)

    def validate_sku(self, value):
        request = self.context.get('request')
        qs = Product.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A product with this SKU already exists.')
        return value
