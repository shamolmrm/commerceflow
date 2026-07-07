"""
Brand model.
"""
from django.db import models
from django.utils.text import slugify


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'brands'
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
