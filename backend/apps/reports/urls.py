from django.urls import path
from . import views

urlpatterns = [
    path('stats/overview/', views.StatsOverviewView.as_view(), name='stats-overview'),
    path('reports/sales/', views.SalesReportView.as_view(), name='reports-sales'),
    path('reports/revenue/', views.RevenueReportView.as_view(), name='reports-revenue'),
    path('reports/top-products/', views.TopProductsReportView.as_view(), name='reports-top-products'),
    path('reports/customers/', views.CustomerReportView.as_view(), name='reports-customers'),
    path('reports/export/', views.ExportReportView.as_view(), name='reports-export'),
]
