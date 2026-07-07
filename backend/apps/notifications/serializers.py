from rest_framework import serializers
from .models import Notification, Newsletter


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'type', 'title', 'message', 'is_read', 'link', 'created_at')
        read_only_fields = ('id', 'created_at')


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ('email',)

    def validate_email(self, value):
        if Newsletter.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError('This email is already subscribed.')
        return value
