from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('read-all/', views.MarkAllReadView.as_view(), name='notification-read-all'),
    path('<int:pk>/', views.MarkNotificationReadView.as_view(), name='notification-patch'),
    path('<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='notification-read'),
    path('newsletter/subscribe/', views.NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
]
