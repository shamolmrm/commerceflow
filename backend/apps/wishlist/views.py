from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Wishlist
from .serializers import WishlistSerializer, AddToWishlistSerializer
from apps.products.models import Product


class WishlistView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product__category', 'product__brand').prefetch_related('product__images')

    @extend_schema(tags=['Wishlist'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AddToWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=AddToWishlistSerializer, tags=['Wishlist'])
    def post(self, request):
        serializer = AddToWishlistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(Product, pk=serializer.validated_data['product_id'], is_active=True)

        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        if not created:
            return Response({'detail': 'Product already in wishlist.'}, status=status.HTTP_200_OK)
        return Response(WishlistSerializer(wishlist_item).data, status=status.HTTP_201_CREATED)


class RemoveFromWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Wishlist'])
    def delete(self, request, pk):
        wishlist_item = get_object_or_404(Wishlist, product_id=pk, user=request.user)
        wishlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
