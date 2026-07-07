"""
Product views with full CRUD, CSV bulk upload, and export.
"""
import csv
import io
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Product, ProductImage, ProductVariant
from .serializers import (
    ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer, ProductImageSerializer, ProductVariantSerializer
)
from .filters import ProductFilter
from apps.users.permissions import ReadOnlyOrAdmin, IsAdminOrManager


class ProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnlyOrAdmin]
    filterset_class = ProductFilter
    search_fields = ['name', 'sku', 'description', 'brand__name', 'category__name']
    ordering_fields = ['price', 'rating', 'created_at', 'name', 'review_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Product.objects.select_related('category', 'brand').prefetch_related('images', 'inventory', 'wishlisted_by')
        if not (user.is_authenticated and user.role in ['superadmin', 'manager', 'staff']):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    @extend_schema(tags=['Products'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=['Products'])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [ReadOnlyOrAdmin]
    queryset = Product.objects.select_related('category', 'brand').prefetch_related(
        'images', 'variants', 'inventory', 'wishlisted_by'
    )
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    @extend_schema(tags=['Products'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ProductDetailByIdView(generics.RetrieveUpdateDestroyAPIView):
    """Same as ProductDetailView but looked up by integer pk (for admin CRUD)."""
    permission_classes = [ReadOnlyOrAdmin]
    queryset = Product.objects.select_related('category', 'brand').prefetch_related(
        'images', 'variants', 'inventory', 'wishlisted_by'
    )

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class ProductImageUploadView(APIView):
    permission_classes = [IsAdminOrManager]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(tags=['Products'])
    def post(self, request, slug):
        try:
            product = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        images = request.FILES.getlist('images')
        created = []
        for idx, image in enumerate(images):
            img = ProductImage.objects.create(
                product=product,
                image=image,
                is_primary=(idx == 0 and not product.images.exists()),
                sort_order=product.images.count() + idx
            )
            created.append(ProductImageSerializer(img, context={'request': request}).data)

        return Response({'images': created}, status=status.HTTP_201_CREATED)


class ProductVariantView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(tags=['Products'])
    def post(self, request, slug):
        try:
            product = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductVariantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductBulkUploadView(APIView):
    permission_classes = [IsAdminOrManager]
    parser_classes = [MultiPartParser]

    @extend_schema(tags=['Products'])
    def post(self, request):
        file = request.FILES.get('file')
        if not file or not file.name.endswith('.csv'):
            return Response({'detail': 'Please upload a CSV file.'}, status=status.HTTP_400_BAD_REQUEST)

        decoded = file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))
        errors = []
        created = []

        for i, row in enumerate(reader, start=2):
            try:
                from apps.categories.models import Category
                from apps.brands.models import Brand
                from django.utils.text import slugify

                category = Category.objects.filter(slug=row.get('category_slug', '')).first()
                brand = Brand.objects.filter(slug=row.get('brand_slug', '')).first()

                product, was_created = Product.objects.update_or_create(
                    sku=row['sku'],
                    defaults={
                        'name': row['name'],
                        'slug': slugify(row['name']),
                        'description': row.get('description', ''),
                        'price': row['price'],
                        'sale_price': row.get('sale_price') or None,
                        'category': category,
                        'brand': brand,
                        'is_active': True,
                    }
                )
                created.append(product.sku)
            except Exception as e:
                errors.append({'row': i, 'error': str(e)})

        return Response({
            'created': len(created),
            'errors': errors
        })


class ProductExportView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(tags=['Products'])
    def get(self, request):
        products = Product.objects.select_related('category', 'brand').all()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products.csv"'

        writer = csv.writer(response)
        writer.writerow(['name', 'sku', 'price', 'sale_price', 'category_slug', 'brand_slug', 'is_active'])
        for p in products:
            writer.writerow([
                p.name, p.sku, p.price, p.sale_price or '',
                p.category.slug if p.category else '',
                p.brand.slug if p.brand else '',
                p.is_active
            ])
        return response
