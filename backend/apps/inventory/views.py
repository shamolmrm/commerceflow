"""
Inventory management views.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Inventory, InventoryLog, Supplier, PurchaseOrder
from .serializers import (
    InventorySerializer, AdjustInventorySerializer, InventoryLogSerializer,
    SupplierSerializer, PurchaseOrderSerializer
)
from apps.users.permissions import IsAdminOrManager, IsStaffOrAbove


class InventoryListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAbove]
    serializer_class = InventorySerializer
    queryset = Inventory.objects.select_related('product', 'warehouse').prefetch_related('logs')
    search_fields = ['product__name', 'product__sku', 'warehouse__name']
    filterset_fields = ['warehouse']
    ordering_fields = ['quantity', 'updated_at']

    @extend_schema(tags=['Inventory'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class LowStockView(generics.ListAPIView):
    permission_classes = [IsStaffOrAbove]
    serializer_class = InventorySerializer

    def get_queryset(self):
        from django.db.models import F
        return Inventory.objects.filter(
            quantity__lte=F('low_stock_threshold')
        ).select_related('product', 'warehouse')

    @extend_schema(tags=['Inventory'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AdjustInventoryView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(request=AdjustInventorySerializer, tags=['Inventory'])
    def post(self, request, pk):
        return self.patch(request, pk)

    @extend_schema(request=AdjustInventorySerializer, tags=['Inventory'])
    def patch(self, request, pk):
        inventory = get_object_or_404(Inventory, pk=pk)
        serializer = AdjustInventorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        change = data['quantity']
        if data['change_type'] == InventoryLog.ChangeType.OUT:
            change = -abs(change)
        elif data['change_type'] == InventoryLog.ChangeType.IN:
            change = abs(change)
        else:
            # ADJUST: can be positive or negative
            change = data['quantity']

        inventory.quantity += change
        if inventory.quantity < 0:
            inventory.quantity = 0
        inventory.save()

        InventoryLog.objects.create(
            inventory=inventory,
            change_type=data['change_type'],
            quantity_change=change,
            quantity_after=inventory.quantity,
            notes=data.get('notes', ''),
            created_by=request.user
        )

        # Trigger low stock alert if needed (non-blocking)
        if inventory.is_low_stock or inventory.is_out_of_stock:
            try:
                from apps.notifications.tasks import send_low_stock_alert
                send_low_stock_alert.delay(inventory.id)
            except Exception:
                pass

        return Response(InventorySerializer(inventory).data)


class InventoryLogsView(generics.ListAPIView):
    permission_classes = [IsStaffOrAbove]
    serializer_class = InventoryLogSerializer

    def get_queryset(self):
        return InventoryLog.objects.select_related('created_by').all()

    @extend_schema(tags=['Inventory'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# Suppliers
class SupplierListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrManager]
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.filter(is_active=True)
    search_fields = ['name', 'email']

    @extend_schema(tags=['Suppliers'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=['Suppliers'])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrManager]
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.all()

    @extend_schema(tags=['Suppliers'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
