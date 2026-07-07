from rest_framework import generics
from .models import Coupon
from .serializers import CouponSerializer
from apps.users.permissions import IsAdminOrManager


class CouponListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrManager]
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all().order_by('-created_at')
    search_fields = ['code']
    filterset_fields = ['is_active', 'type']


class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrManager]
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
