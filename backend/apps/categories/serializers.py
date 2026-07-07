from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'parent', 'image', 'description',
                  'is_active', 'sort_order', 'children', 'product_count')
        read_only_fields = ('slug',)

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class CategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('name', 'slug', 'parent', 'image', 'description', 'is_active', 'sort_order')

    def validate_slug(self, value):
        from django.utils.text import slugify
        return slugify(value) if value else value
