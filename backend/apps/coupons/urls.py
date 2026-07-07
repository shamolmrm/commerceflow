from django.urls import path
from . import views

urlpatterns = [
    path('', views.CouponListCreateView.as_view(), name='coupon-list'),
    path('<int:pk>/', views.CouponDetailView.as_view(), name='coupon-detail'),
]
