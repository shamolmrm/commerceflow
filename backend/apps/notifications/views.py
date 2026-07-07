from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Notification, Newsletter
from .serializers import NotificationSerializer, NewsletterSerializer


class NotificationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @extend_schema(tags=['Notifications'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Notifications'])
    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)


class MarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _mark_all(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})

    @extend_schema(tags=['Notifications'])
    def patch(self, request):
        return self._mark_all(request)

    @extend_schema(tags=['Notifications'])
    def post(self, request):
        return self._mark_all(request)


class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=NewsletterSerializer, tags=['Newsletter'])
    def post(self, request):
        serializer = NewsletterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        newsletter, created = Newsletter.objects.get_or_create(
            email=serializer.validated_data['email'],
            defaults={'is_active': True}
        )
        if not created:
            newsletter.is_active = True
            newsletter.save()
        return Response({'message': 'Successfully subscribed to newsletter!'})
