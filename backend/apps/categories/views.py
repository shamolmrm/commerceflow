from rest_framework import generics, permissions
from .models import Category
from .serializers import CategorySerializer, CategoryCreateSerializer
from apps.users.permissions import ReadOnlyOrAdmin


class CategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnlyOrAdmin]
    queryset = Category.objects.filter(parent=None, is_active=True).prefetch_related('children')
    search_fields = ['name']
    ordering_fields = ['name', 'sort_order']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategoryCreateSerializer
        return CategorySerializer


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [ReadOnlyOrAdmin]
    queryset = Category.objects.all()
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CategoryCreateSerializer
        return CategorySerializer
