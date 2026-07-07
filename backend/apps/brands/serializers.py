from rest_framework import serializers
from .models import Brand


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ('id', 'name', 'slug', 'logo', 'website', 'description', 'is_active', 'product_count')
        read_only_fields = ('slug',)

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()
