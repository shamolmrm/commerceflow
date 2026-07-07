from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListCreateView.as_view(), name='product-list'),
    path('bulk-upload/', views.ProductBulkUploadView.as_view(), name='product-bulk-upload'),
    path('export/', views.ProductExportView.as_view(), name='product-export'),
    path('<int:pk>/', views.ProductDetailByIdView.as_view(), name='product-detail-by-id'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<slug:slug>/images/', views.ProductImageUploadView.as_view(), name='product-images'),
    path('<slug:slug>/variants/', views.ProductVariantView.as_view(), name='product-variants'),
]
