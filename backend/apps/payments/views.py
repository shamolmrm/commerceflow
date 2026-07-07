"""
Payment gateway views: Stripe, PayPal, SSLCommerz.
"""
import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Payment
from .serializers import (
    PaymentSerializer, StripeInitiateSerializer, StripeConfirmSerializer,
    PayPalInitiateSerializer, SSLCommerzInitiateSerializer
)
from apps.orders.models import Order

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=StripeInitiateSerializer, tags=['Payments'])
    def post(self, request):
        serializer = StripeInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = get_object_or_404(Order, order_number=serializer.validated_data['order_number'], customer=request.user)

        try:
            intent = stripe.PaymentIntent.create(
                amount=int(order.total * 100),  # cents
                currency='usd',
                metadata={'order_number': order.order_number},
            )
            Payment.objects.update_or_create(
                order=order, method='stripe',
                defaults={
                    'amount': order.total,
                    'transaction_id': intent['id'],
                    'status': Payment.Status.PENDING,
                    'gateway_response': {'client_secret': intent['client_secret']},
                }
            )
            return Response({
                'client_secret': intent['client_secret'],
                'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
            })
        except stripe.error.StripeError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripeConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=StripeConfirmSerializer, tags=['Payments'])
    def post(self, request):
        serializer = StripeConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = get_object_or_404(Order, order_number=serializer.validated_data['order_number'])
        payment_intent_id = serializer.validated_data['payment_intent_id']

        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            payment = Payment.objects.filter(order=order, transaction_id=payment_intent_id).first()

            if intent['status'] == 'succeeded':
                if payment:
                    payment.status = Payment.Status.SUCCESS
                    payment.save()
                order.payment_status = Order.PaymentStatus.PAID
                order.status = Order.Status.PROCESSING
                order.save()
                from apps.notifications.tasks import send_payment_notification
                send_payment_notification.delay(order.id, True)
                return Response({'message': 'Payment confirmed.', 'order_number': order.order_number})
            else:
                return Response({'detail': 'Payment not completed.'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @extend_schema(tags=['Payments'])
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'payment_intent.succeeded':
            pi = event['data']['object']
            order_number = pi['metadata'].get('order_number')
            if order_number:
                order = Order.objects.filter(order_number=order_number).first()
                if order:
                    order.payment_status = Order.PaymentStatus.PAID
                    order.status = Order.Status.PROCESSING
                    order.save()
                    Payment.objects.filter(order=order, transaction_id=pi['id']).update(
                        status=Payment.Status.SUCCESS
                    )

        return Response({'status': 'ok'})


class PayPalInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=PayPalInitiateSerializer, tags=['Payments'])
    def post(self, request):
        serializer = PayPalInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = get_object_or_404(
            Order, order_number=serializer.validated_data['order_number'], customer=request.user
        )

        # PayPal integration (simplified - use paypalrestsdk in production)
        payment = Payment.objects.create(
            order=order,
            method='paypal',
            amount=order.total,
            status=Payment.Status.PENDING,
        )
        # In production, create PayPal payment via SDK
        return Response({
            'message': 'PayPal payment initialized.',
            'amount': str(order.total),
            'order_number': order.order_number,
        })


@method_decorator(csrf_exempt, name='dispatch')
class PayPalWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @extend_schema(tags=['Payments'])
    def post(self, request):
        # Handle PayPal IPN/webhook
        return Response({'status': 'ok'})


class SSLCommerzInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=SSLCommerzInitiateSerializer, tags=['Payments'])
    def post(self, request):
        serializer = SSLCommerzInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = get_object_or_404(
            Order, order_number=serializer.validated_data['order_number'], customer=request.user
        )

        # SSLCommerz integration
        sslc_data = {
            'store_id': settings.SSLCOMMERZ_STORE_ID,
            'store_passwd': settings.SSLCOMMERZ_STORE_PASS,
            'total_amount': str(order.total),
            'currency': 'BDT',
            'tran_id': order.order_number,
            'success_url': f'{settings.FRONTEND_URL}/order-success/{order.order_number}',
            'fail_url': f'{settings.FRONTEND_URL}/checkout?error=payment_failed',
            'cancel_url': f'{settings.FRONTEND_URL}/checkout',
        }
        # In production, call SSLCommerz API
        Payment.objects.create(
            order=order,
            method='sslcommerz',
            amount=order.total,
            status=Payment.Status.PENDING,
            gateway_response=sslc_data,
        )
        return Response({
            'message': 'SSLCommerz payment initialized.',
            'redirect_url': 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
            'data': sslc_data,
        })
