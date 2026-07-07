"""
Cart views.
"""
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer, ApplyCouponSerializer
from apps.products.models import Product, ProductVariant
from apps.coupons.models import Coupon


def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
    return cart


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['Cart'])
    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class CartAddView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=AddToCartSerializer, tags=['Cart'])
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart = get_or_create_cart(request)
        product = get_object_or_404(Product, pk=data['product_id'], is_active=True)
        variant = None
        if data.get('variant_id'):
            variant = get_object_or_404(ProductVariant, pk=data['variant_id'], product=product)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, variant=variant,
            defaults={'quantity': data['quantity']}
        )
        if not created:
            item.quantity += data['quantity']
            item.save()

        cart_data = CartSerializer(cart, context={'request': request}).data
        return Response(cart_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CartUpdateView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=UpdateCartItemSerializer, tags=['Cart'])
    def patch(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        qty = serializer.validated_data['quantity']
        if qty == 0:
            item.delete()
        else:
            item.quantity = qty
            item.save()
        cart_data = CartSerializer(cart, context={'request': request}).data
        return Response(cart_data)


class CartRemoveView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['Cart'])
    def delete(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        item.delete()
        cart_data = CartSerializer(cart, context={'request': request}).data
        return Response(cart_data)


class CartItemView(APIView):
    """Unified PATCH (update quantity) and DELETE (remove) for a cart item by ID."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=UpdateCartItemSerializer, tags=['Cart'])
    def patch(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        qty = serializer.validated_data['quantity']
        if qty == 0:
            item.delete()
        else:
            item.quantity = qty
            item.save()
        return Response(CartSerializer(cart, context={'request': request}).data)

    @extend_schema(tags=['Cart'])
    def delete(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        item.delete()
        return Response(CartSerializer(cart, context={'request': request}).data)


class ApplyCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=ApplyCouponSerializer, tags=['Cart'])
    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code'].upper()

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'detail': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

        if not coupon.is_valid:
            return Response({'detail': 'Coupon is expired or no longer valid.'}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_or_create_cart(request)
        if cart.total < coupon.min_order:
            return Response(
                {'detail': f'Minimum order amount is ${coupon.min_order}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.session['coupon_code'] = code
        discount = coupon.calculate_discount(cart.total)
        return Response({
            'message': 'Coupon applied successfully.',
            'coupon_code': code,
            'discount': float(discount),
            'new_total': float(cart.total - discount)
        })
