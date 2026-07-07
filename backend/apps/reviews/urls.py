from django.urls import path
from . import views

urlpatterns = [
    path('products/<slug:slug>/reviews/', views.ProductReviewListCreateView.as_view(), name='product-reviews'),
    path('<int:pk>/', views.DeleteReviewView.as_view(), name='review-delete'),
]
