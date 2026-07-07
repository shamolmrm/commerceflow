"""
Admin report views: stats, sales, revenue, top products, export.
"""
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone
from datetime import timedelta
import csv
import io
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.orders.models import Order, OrderItem
from apps.products.models import Product
from apps.users.models import User
from apps.inventory.models import Inventory
from apps.users.permissions import IsStaffOrAbove, IsAdminOrManager


def get_period_start(period):
    now = timezone.now()
    periods = {'7d': 7, '30d': 30, '90d': 90, '1y': 365}
    days = periods.get(period, 30)
    return now - timedelta(days=days)


class StatsOverviewView(APIView):
    permission_classes = [IsStaffOrAbove]

    @extend_schema(tags=['Admin Reports'])
    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_revenue = Order.objects.filter(
            payment_status='paid'
        ).aggregate(total=Sum('total'))['total'] or 0

        revenue_this_month = Order.objects.filter(
            created_at__gte=month_start, payment_status='paid'
        ).aggregate(total=Sum('total'))['total'] or 0

        orders_today = Order.objects.filter(created_at__gte=today_start).count()
        orders_this_month = Order.objects.filter(created_at__gte=month_start).count()
        total_orders = Order.objects.count()

        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()

        total_customers = User.objects.filter(role='customer').count()
        new_customers_this_month = User.objects.filter(
            role='customer', created_at__gte=month_start
        ).count()

        low_stock_count = Inventory.objects.filter(
            quantity__lte=F('low_stock_threshold'), quantity__gt=0
        ).count()
        out_of_stock_count = Inventory.objects.filter(quantity=0).count()

        return Response({
            'total_revenue': float(total_revenue),
            'revenue_this_month': float(revenue_this_month),
            'monthly_revenue': float(revenue_this_month),  # keep alias
            'orders_today': orders_today,
            'orders_this_month': orders_this_month,
            'total_orders': total_orders,
            'total_products': total_products,
            'active_products': active_products,
            'total_customers': total_customers,
            'new_customers_this_month': new_customers_this_month,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
        })


class SalesReportView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(
        parameters=[OpenApiParameter('period', str, description='7d, 30d, 90d, 1y')],
        tags=['Admin Reports']
    )
    def get(self, request):
        period = request.query_params.get('period', '30d')
        start = get_period_start(period)

        daily_qs = (
            Order.objects.filter(created_at__gte=start)
            .annotate(day=TruncDay('created_at'))
            .values('day')
            .annotate(orders=Count('id'), revenue=Sum('total'))
            .order_by('day')
        )

        daily = [
            {
                'date': item['day'].strftime('%Y-%m-%d'),
                'orders': item['orders'],
                'revenue': float(item['revenue'] or 0),
            }
            for item in daily_qs
        ]

        # Monthly breakdown for secondary chart
        monthly_qs = (
            Order.objects.filter(payment_status='paid', created_at__gte=start)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('month')
        )

        monthly = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'revenue': float(item['revenue'] or 0),
                'orders': item['orders'],
            }
            for item in monthly_qs
        ]

        period_orders = Order.objects.filter(created_at__gte=start)
        total_revenue = period_orders.filter(payment_status='paid').aggregate(t=Sum('total'))['t'] or 0
        total_orders = period_orders.count()
        avg_order_value = float(total_revenue) / total_orders if total_orders else 0

        return Response({
            'daily': daily,
            'monthly': monthly,
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'avg_order_value': round(avg_order_value, 2),
        })


class RevenueReportView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(tags=['Admin Reports'])
    def get(self, request):
        data = (
            Order.objects.filter(payment_status='paid')
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('month')
        )

        return Response([
            {
                'month': item['month'].strftime('%Y-%m'),
                'revenue': float(item['revenue'] or 0),
                'orders': item['orders'],
            }
            for item in data
        ])


class TopProductsReportView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(tags=['Admin Reports'])
    def get(self, request):
        period = request.query_params.get('period', '30d')
        start = get_period_start(period)
        limit = int(request.query_params.get('limit', 10))

        data = (
            OrderItem.objects.filter(order__created_at__gte=start)
            .values('product__name', 'product__sku', 'product__id')
            .annotate(
                total_sold=Sum('quantity'),
                total_revenue=Sum('total_price'),
            )
            .order_by('-total_sold')[:limit]
        )

        return Response([
            {
                'id': item['product__id'],
                'name': item['product__name'],
                'sku': item['product__sku'],
                'total_sold': item['total_sold'] or 0,
                'revenue': float(item['total_revenue'] or 0),
            }
            for item in data
        ])


class CustomerReportView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(tags=['Admin Reports'])
    def get(self, request):
        period = request.query_params.get('period', '30d')
        start = get_period_start(period)

        data = (
            User.objects.filter(role='customer', created_at__gte=start)
            .annotate(day=TruncDay('created_at'))
            .values('day')
            .annotate(new_customers=Count('id'))
            .order_by('day')
        )

        top_customers = (
            Order.objects.filter(payment_status='paid')
            .values('customer__id', 'customer__full_name', 'customer__email')
            .annotate(
                total_orders=Count('id'),
                total_spent=Sum('total'),
            )
            .order_by('-total_spent')[:10]
        )

        total_new_customers = User.objects.filter(role='customer', created_at__gte=start).count()

        return Response({
            'total_new_customers': total_new_customers,
            'new_customers': [
                {'date': item['day'].strftime('%Y-%m-%d'), 'count': item['new_customers']}
                for item in data
            ],
            'top_customers': [
                {
                    'customer_id': c['customer__id'],
                    'name': c['customer__full_name'],
                    'email': c['customer__email'],
                    'total_orders': c['total_orders'],
                    'total_spent': float(c['total_spent'] or 0),
                }
                for c in top_customers
            ],
        })


class ExportReportView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(
        parameters=[OpenApiParameter('format', str, description='csv, excel, pdf')],
        tags=['Admin Reports']
    )
    def get(self, request):
        fmt = request.query_params.get('format', 'csv')
        period = request.query_params.get('period', '30d')
        start = get_period_start(period)

        orders = Order.objects.filter(created_at__gte=start).select_related('customer', 'shipping_address')

        if fmt == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="sales_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Order Number', 'Customer', 'Date', 'Status', 'Payment', 'Total'])
            for order in orders:
                writer.writerow([
                    order.order_number,
                    order.customer.email if order.customer else '',
                    order.created_at.strftime('%Y-%m-%d'),
                    order.status,
                    order.payment_method,
                    str(order.total),
                ])
            return response

        elif fmt == 'excel':
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = 'Sales Report'
            ws.append(['Order Number', 'Customer', 'Date', 'Status', 'Payment', 'Total'])
            for order in orders:
                ws.append([
                    order.order_number,
                    order.customer.email if order.customer else '',
                    order.created_at.strftime('%Y-%m-%d'),
                    order.status,
                    order.payment_method,
                    float(order.total),
                ])
            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)
            response = HttpResponse(
                buffer.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="sales_report.xlsx"'
            return response

        return Response({'detail': 'Unsupported format.'}, status=400)
