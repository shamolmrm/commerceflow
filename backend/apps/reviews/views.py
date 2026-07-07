from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer
from apps.products.models import Product
from apps.users.permissions import IsAdminOrManager


class ProductReviewListCreateView(generics.ListCreateAPIView):
    filterset_fields = ['rating', 'is_approved']
    ordering_fields = ['created_at', 'rating', 'helpful_count']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateReviewSerializer
        return ReviewSerializer

    def get_queryset(self):
        slug = self.kwargs['slug']
        product = get_object_or_404(Product, slug=slug)
        qs = Review.objects.filter(product=product, is_approved=True).select_related('user')
        return qs

    @extend_schema(tags=['Reviews'])
    def post(self, request, slug):
        product = get_object_or_404(Product, slug=slug)
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response(
                {'detail': 'You have already reviewed this product.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = CreateReviewSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        review = serializer.save(product=product, user=request.user)
        return Response(ReviewSerializer(review, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=['Reviews'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class DeleteReviewView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(tags=['Reviews'])
    def delete(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
