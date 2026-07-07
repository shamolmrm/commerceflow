from rest_framework import serializers
from .models import Wishlist
from apps.products.serializers import ProductListSerializer


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'product_id', 'added_at')
        read_only_fields = ('id', 'added_at')


class AddToWishlistSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
