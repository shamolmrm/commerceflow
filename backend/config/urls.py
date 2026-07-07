"""
Main URL configuration for CommerceFlow.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def api_root(request):
    return JsonResponse({
        'name': 'CommerceFlow API',
        'version': '1.0.0',
        'status': 'running',
        'docs': '/api/docs/',
        'admin': '/django-admin/',
        'api': '/api/v1/',
    })


urlpatterns = [
    # Root
    path('', api_root, name='api-root'),

    # Django Admin
    path('django-admin/', admin.site.urls),

    # API Schema (Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1 routes
    path('api/v1/', include([
        path('users/', include('apps.users.urls')),
        path('products/', include('apps.products.urls')),
        path('categories/', include('apps.categories.urls')),
        path('brands/', include('apps.brands.urls')),
        path('inventory/', include('apps.inventory.urls')),
        path('cart/', include('apps.cart.urls')),
        path('orders/', include('apps.orders.urls')),
        path('payments/', include('apps.payments.urls')),
        path('reviews/', include('apps.reviews.urls')),
        path('wishlist/', include('apps.wishlist.urls')),
        path('addresses/', include('apps.addresses.urls')),
        path('suppliers/', include('apps.suppliers.urls')),
        path('warehouses/', include('apps.warehouses.urls')),
        path('notifications/', include('apps.notifications.urls')),
        path('admin/', include('apps.reports.urls')),
        path('coupons/', include('apps.coupons.urls')),
    ])),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
