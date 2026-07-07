from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'order', 'method', 'transaction_id', 'amount',
                  'currency', 'status', 'created_at')
        read_only_fields = ('id', 'created_at')


class StripeInitiateSerializer(serializers.Serializer):
    order_number = serializers.CharField()


class StripeConfirmSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField()
    order_number = serializers.CharField()


class PayPalInitiateSerializer(serializers.Serializer):
    order_number = serializers.CharField()


class SSLCommerzInitiateSerializer(serializers.Serializer):
    order_number = serializers.CharField()
