"""
Product models: Product, ProductImage, ProductVariant.
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.categories.models import Category
from apps.brands.models import Brand


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, db_index=True)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, related_name='products'
    )
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='products'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_digital = models.BooleanField(default=False)

    # Computed / denormalized
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)

    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['sku']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active', 'is_featured']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def effective_price(self):
        return self.sale_price if self.sale_price else self.price

    @property
    def discount_percentage(self):
        if self.sale_price and self.price > 0:
            return int((1 - self.sale_price / self.price) * 100)
        return 0

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first()


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', blank=True)
    image_url = models.URLField(blank=True)  # For external URLs (Unsplash seed data)
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'product_images'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.product.name} image {self.id}'

    @property
    def url(self):
        if self.image_url:
            return self.image_url
        if self.image:
            return self.image.url
        return ''


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=50)   # e.g. "Color", "Size"
    value = models.CharField(max_length=100)  # e.g. "Red", "XL"
    price_modifier = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    sku_suffix = models.CharField(max_length=50, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'product_variants'
        unique_together = [['product', 'name', 'value']]

    def __str__(self):
        return f'{self.product.name} - {self.name}: {self.value}'
