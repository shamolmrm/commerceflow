from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order-list'),
    path('create/', views.CreateOrderView.as_view(), name='order-create'),
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_number>/status/', views.UpdateOrderStatusView.as_view(), name='order-status-update'),
    path('<str:order_number>/update-status/', views.UpdateOrderStatusView.as_view(), name='order-status-update-alt'),
    path('<str:order_number>/invoice/', views.OrderInvoiceView.as_view(), name='order-invoice'),
]
