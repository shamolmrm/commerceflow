"""
Address model for shipping and billing.
"""
from django.db import models
from django.conf import settings


class Address(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='addresses'
    )
    label = models.CharField(max_length=50, default='Home')  # Home, Work, etc.
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address_line = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Bangladesh')
    zip_code = models.CharField(max_length=20)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'addresses'
        verbose_name = 'Address'
        verbose_name_plural = 'Addresses'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f'{self.full_name} — {self.city}, {self.country}'

    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
