from django.urls import path
from . import views

urlpatterns = [
    path('', views.CategoryListCreateView.as_view(), name='category-list'),
    path('<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
]
