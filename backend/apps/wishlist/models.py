"""
Wishlist model.
"""
from django.db import models
from django.conf import settings
from apps.products.models import Product


class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='wishlist'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wishlist'
        verbose_name = 'Wishlist Item'
        verbose_name_plural = 'Wishlist Items'
        unique_together = [['user', 'product']]
        ordering = ['-added_at']

    def __str__(self):
        return f'{self.user.email} → {self.product.name}'
