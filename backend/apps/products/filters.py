"""
Product filters using django-filter.
"""
import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    category = django_filters.CharFilter(field_name='category__slug')
    brand = django_filters.CharFilter(field_name='brand__slug')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    is_featured = django_filters.BooleanFilter()
    is_on_sale = django_filters.BooleanFilter(method='filter_on_sale')

    class Meta:
        model = Product
        fields = ['category', 'brand', 'is_featured', 'min_price', 'max_price']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(inventory__quantity__gt=0).distinct()
        return queryset.filter(inventory__quantity=0).distinct()

    def filter_on_sale(self, queryset, name, value):
        if value:
            return queryset.filter(sale_price__isnull=False)
        return queryset
