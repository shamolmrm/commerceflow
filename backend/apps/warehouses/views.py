from rest_framework import generics
from .models import Warehouse
from .serializers import WarehouseSerializer
from apps.users.permissions import IsAdminOrManager


class WarehouseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrManager]
    serializer_class = WarehouseSerializer
    queryset = Warehouse.objects.all()


class WarehouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrManager]
    serializer_class = WarehouseSerializer
    queryset = Warehouse.objects.all()
