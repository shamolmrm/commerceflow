"""
Warehouse model.
"""
from django.db import models
from django.conf import settings


class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    location = models.TextField()
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='managed_warehouses'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'warehouses'
        verbose_name = 'Warehouse'
        verbose_name_plural = 'Warehouses'

    def __str__(self):
        return self.name
