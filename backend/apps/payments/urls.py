from django.urls import path
from . import views

urlpatterns = [
    path('stripe/initiate/', views.StripeInitiateView.as_view(), name='stripe-initiate'),
    path('stripe/confirm/', views.StripeConfirmView.as_view(), name='stripe-confirm'),
    path('paypal/initiate/', views.PayPalInitiateView.as_view(), name='paypal-initiate'),
    path('sslcommerz/initiate/', views.SSLCommerzInitiateView.as_view(), name='sslcommerz-initiate'),
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('webhook/paypal/', views.PayPalWebhookView.as_view(), name='paypal-webhook'),
]
