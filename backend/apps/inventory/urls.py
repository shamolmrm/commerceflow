from django.urls import path
from . import views

urlpatterns = [
    path('', views.InventoryListView.as_view(), name='inventory-list'),
    path('low-stock/', views.LowStockView.as_view(), name='inventory-low-stock'),
    path('logs/', views.InventoryLogsView.as_view(), name='inventory-logs'),
    path('<int:pk>/adjust/', views.AdjustInventoryView.as_view(), name='inventory-adjust'),
]
