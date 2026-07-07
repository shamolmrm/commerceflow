from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'product', 'user', 'user_name', 'user_avatar',
                  'rating', 'title', 'body', 'is_approved',
                  'is_verified_purchase', 'helpful_count', 'created_at')
        read_only_fields = ('id', 'user', 'is_approved', 'is_verified_purchase', 'helpful_count', 'created_at')

    def get_user_avatar(self, obj):
        if obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
        return None


class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('rating', 'title', 'body')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
