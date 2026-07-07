"""
Product review model.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.products.models import Product


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    is_approved = models.BooleanField(default=True)
    is_verified_purchase = models.BooleanField(default=False)
    helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        unique_together = [['product', 'user']]
        ordering = ['-created_at']
        indexes = [models.Index(fields=['product', 'is_approved'])]

    def __str__(self):
        return f'{self.product.name} — {self.rating}★ by {self.user.email}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._update_product_rating()

    def delete(self, *args, **kwargs):
        product = self.product
        super().delete(*args, **kwargs)
        self._update_product_rating_for(product)

    def _update_product_rating(self):
        self._update_product_rating_for(self.product)

    @staticmethod
    def _update_product_rating_for(product):
        from django.db.models import Avg, Count
        result = Review.objects.filter(
            product=product, is_approved=True
        ).aggregate(avg=Avg('rating'), count=Count('id'))
        product.rating = result['avg'] or 0
        product.review_count = result['count']
        product.save(update_fields=['rating', 'review_count'])
