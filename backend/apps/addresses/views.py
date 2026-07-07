from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Address
from .serializers import AddressSerializer


class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(tags=['Addresses'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=['Addresses'])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    @extend_schema(tags=['Addresses'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=['Addresses'])
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(tags=['Addresses'])
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)
