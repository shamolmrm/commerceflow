"""
Cart model (session-based + user-linked).
"""
from django.db import models
from django.conf import settings
from apps.products.models import Product, ProductVariant


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        null=True, blank=True, related_name='cart'
    )
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carts'

    def __str__(self):
        return f'Cart for {self.user or self.session_key}'

    @property
    def total(self):
        return sum(item.line_total for item in self.items.all())

    @property
    def item_count(self):
        return self.items.count()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL,
        null=True, blank=True
    )
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart_items'
        unique_together = [['cart', 'product', 'variant']]

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'

    @property
    def unit_price(self):
        base = self.product.effective_price
        if self.variant:
            base += self.variant.price_modifier
        return base

    @property
    def line_total(self):
        return self.unit_price * self.quantity
