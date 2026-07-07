from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.CartAddView.as_view(), name='cart-add'),
    path('<int:item_id>/', views.CartItemView.as_view(), name='cart-item'),
    path('update/<int:item_id>/', views.CartUpdateView.as_view(), name='cart-update'),
    path('remove/<int:item_id>/', views.CartRemoveView.as_view(), name='cart-remove'),
    path('apply-coupon/', views.ApplyCouponView.as_view(), name='cart-apply-coupon'),
]
