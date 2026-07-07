from rest_framework import generics
from .models import Brand
from .serializers import BrandSerializer
from apps.users.permissions import ReadOnlyOrAdmin


class BrandListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnlyOrAdmin]
    serializer_class = BrandSerializer
    queryset = Brand.objects.filter(is_active=True)
    search_fields = ['name']
    ordering_fields = ['name']


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [ReadOnlyOrAdmin]
    serializer_class = BrandSerializer
    queryset = Brand.objects.all()
    lookup_field = 'slug'
