"""
Order views — customer and admin.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer
from apps.users.permissions import IsStaffOrAbove, IsOwnerOrAdmin
from apps.cart.models import Cart, CartItem
from apps.coupons.models import Coupon
from apps.addresses.models import Address


class OrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    filterset_fields = ['status', 'payment_status', 'payment_method']
    search_fields = ['order_number']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.select_related(
            'customer', 'shipping_address', 'coupon'
        ).prefetch_related('items', 'status_history')
        if user.role in ['superadmin', 'manager', 'staff']:
            return qs.all()
        return qs.filter(customer=user)

    @extend_schema(tags=['Orders'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=CreateOrderSerializer, tags=['Orders'])
    @transaction.atomic
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Get cart
        try:
            cart = Cart.objects.prefetch_related('items__product', 'items__variant').get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate totals
        subtotal = cart.total
        coupon = None
        discount = 0

        coupon_code = data.get('coupon_code') or request.session.get('coupon_code')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code.upper())
                if coupon.is_valid and subtotal >= coupon.min_order:
                    discount = coupon.calculate_discount(subtotal)
                    coupon.used_count += 1
                    coupon.save(update_fields=['used_count'])
            except Coupon.DoesNotExist:
                pass

        import decimal
        tax = round(subtotal * decimal.Decimal('0.05'), 2)
        shipping = decimal.Decimal('0') if subtotal >= 50 else decimal.Decimal('5')
        total = subtotal + tax + shipping - discount

        # Resolve shipping address — accept either an ID or a full address dict
        if data.get('shipping_address_id'):
            shipping_address = Address.objects.get(pk=data['shipping_address_id'])
        else:
            addr_data = data['shipping_address']
            shipping_address = Address.objects.create(
                user=request.user,
                full_name=addr_data.get('full_name', ''),
                phone=addr_data.get('phone', ''),
                address_line=addr_data.get('address_line1', addr_data.get('address_line', '')),
                city=addr_data.get('city', ''),
                state=addr_data.get('state', ''),
                country=addr_data.get('country', 'US'),
                zip_code=addr_data.get('postal_code', addr_data.get('zip_code', '')),
            )
        billing_address = None
        if data.get('billing_address_id'):
            billing_address = Address.objects.get(pk=data['billing_address_id'])

        order = Order.objects.create(
            customer=request.user,
            subtotal=subtotal,
            tax=tax,
            shipping_charge=shipping,
            discount=discount,
            total=total,
            coupon=coupon,
            shipping_address=shipping_address,
            billing_address=billing_address,
            payment_method=data['payment_method'],
            notes=data.get('notes', ''),
            estimated_delivery=timezone.now().date() + timezone.timedelta(days=7)
        )

        # Create order items & reduce inventory
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                variant=cart_item.variant,
                product_name=cart_item.product.name,
                variant_info=f'{cart_item.variant.name}: {cart_item.variant.value}' if cart_item.variant else '',
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price,
            )
            # Reduce inventory
            for inv in cart_item.product.inventory.all():
                inv.quantity = max(0, inv.quantity - cart_item.quantity)
                inv.save(update_fields=['quantity'])

        OrderStatusHistory.objects.create(
            order=order, status=Order.Status.PENDING, notes='Order placed.', changed_by=request.user
        )

        # Clear cart
        cart.items.all().delete()
        if 'coupon_code' in request.session:
            del request.session['coupon_code']

        try:
            from apps.notifications.tasks import send_order_placed_notification
            send_order_placed_notification.delay(order.id)
        except Exception:
            pass

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Orders'])
    def get(self, request, order_number):
        qs = Order.objects.select_related(
            'customer', 'shipping_address', 'billing_address'
        ).prefetch_related('items', 'status_history__changed_by', 'payments')

        lookup = {'pk': int(order_number)} if order_number.isdigit() else {'order_number': order_number}
        if request.user.role in ['superadmin', 'manager', 'staff']:
            order = get_object_or_404(qs, **lookup)
        else:
            order = get_object_or_404(qs, **lookup, customer=request.user)

        return Response(OrderSerializer(order).data)


class UpdateOrderStatusView(APIView):
    permission_classes = [IsStaffOrAbove]

    @extend_schema(request=UpdateOrderStatusSerializer, tags=['Orders'])
    def patch(self, request, order_number):
        lookup = {'pk': int(order_number)} if order_number.isdigit() else {'order_number': order_number}
        order = get_object_or_404(Order, **lookup)
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        old_status = order.status
        order.status = data['status']
        if data.get('tracking_number'):
            order.tracking_number = data['tracking_number']
        if data.get('estimated_delivery'):
            order.estimated_delivery = data['estimated_delivery']
        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            status=data['status'],
            notes=data.get('notes', ''),
            changed_by=request.user
        )

        if old_status != data['status']:
            try:
                from apps.notifications.tasks import send_order_status_notification
                send_order_status_notification.delay(order.id, data['status'])
            except Exception:
                pass

        return Response(OrderSerializer(order).data)


class OrderInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Orders'])
    def get(self, request, order_number):
        lookup = {'pk': int(order_number)} if order_number.isdigit() else {'order_number': order_number}
        if request.user.role in ['superadmin', 'manager', 'staff']:
            order = get_object_or_404(Order, **lookup)
        else:
            order = get_object_or_404(Order, **lookup, customer=request.user)

        from apps.reports.utils import generate_invoice_pdf
        pdf = generate_invoice_pdf(order)
        from django.http import HttpResponse
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice-{order_number}.pdf"'
        return response
