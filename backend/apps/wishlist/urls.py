from django.urls import path
from . import views

urlpatterns = [
    path('', views.WishlistView.as_view(), name='wishlist'),
    path('add/', views.AddToWishlistView.as_view(), name='wishlist-add'),
    path('remove/<int:pk>/', views.RemoveFromWishlistView.as_view(), name='wishlist-remove'),
]
