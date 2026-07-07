"""
Celery async tasks for all notification types.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def _send_email(to_email, subject, template_name, context):
    """Helper to render and send an HTML email."""
    try:
        html_message = render_to_string(f'emails/{template_name}', context)
        send_mail(
            subject=subject,
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f'Email send failed: {e}')


def _create_notification(user_id, n_type, title, message, link=''):
    from .models import Notification
    from apps.users.models import User
    try:
        user = User.objects.get(pk=user_id)
        Notification.objects.create(
            user=user, type=n_type, title=title, message=message, link=link
        )
    except User.DoesNotExist:
        pass


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, user_id, otp_code, purpose='verify'):
    from apps.users.models import User
    try:
        user = User.objects.get(pk=user_id)
        subject = 'Verify your CommerceFlow account' if purpose == 'verify' else 'Reset your password'
        _send_email(user.email, subject, 'otp.html', {
            'user': user,
            'otp_code': otp_code,
            'purpose': purpose,
        })
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_order_placed_notification(self, order_id):
    from apps.orders.models import Order
    try:
        order = Order.objects.select_related('customer').prefetch_related('items__product').get(pk=order_id)
        user = order.customer
        if not user:
            return

        # Email
        _send_email(user.email, f'Order Confirmed: {order.order_number}', 'order_placed.html', {
            'user': user,
            'order': order,
        })

        # In-app notification
        _create_notification(
            user.id,
            'order_placed',
            f'Order #{order.order_number} Confirmed!',
            f'Your order has been received and is being processed.',
            f'/dashboard/orders/{order.order_number}'
        )

        # Alert admins
        from apps.users.models import User as UserModel
        admin_users = UserModel.objects.filter(role__in=['superadmin', 'manager'])
        for admin in admin_users:
            _create_notification(
                admin.id,
                'order_placed',
                f'New Order: {order.order_number}',
                f'New order placed by {user.email} — ${order.total}',
                f'/admin/orders/{order.order_number}'
            )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_order_status_notification(self, order_id, new_status):
    from apps.orders.models import Order
    try:
        order = Order.objects.select_related('customer').get(pk=order_id)
        user = order.customer
        if not user:
            return

        status_messages = {
            'processing': 'Your order is being processed.',
            'shipped': f'Your order has been shipped! Tracking: {order.tracking_number or "N/A"}',
            'delivered': 'Your order has been delivered. Enjoy!',
            'cancelled': 'Your order has been cancelled.',
            'returned': 'Your return has been initiated.',
            'refunded': 'Your refund has been processed.',
        }
        message = status_messages.get(new_status, f'Order status updated to {new_status}.')

        _send_email(user.email, f'Order #{order.order_number} — Status Update', 'order_status.html', {
            'user': user, 'order': order, 'new_status': new_status, 'message': message
        })

        _create_notification(
            user.id, 'order_status',
            f'Order #{order.order_number} — {new_status.capitalize()}',
            message,
            f'/dashboard/orders/{order.order_number}'
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_payment_notification(self, order_id, success=True):
    from apps.orders.models import Order
    try:
        order = Order.objects.select_related('customer').get(pk=order_id)
        user = order.customer
        if not user:
            return

        n_type = 'payment_success' if success else 'payment_failed'
        title = 'Payment Successful' if success else 'Payment Failed'
        message = (
            f'Payment of ${order.total} for order #{order.order_number} was successful.'
            if success else
            f'Payment for order #{order.order_number} failed. Please retry.'
        )

        _send_email(user.email, title, 'payment_notification.html', {
            'user': user, 'order': order, 'success': success
        })
        _create_notification(user.id, n_type, title, message, f'/dashboard/orders/{order.order_number}')
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_low_stock_alert(self, inventory_id):
    from apps.inventory.models import Inventory
    from apps.users.models import User as UserModel
    try:
        inventory = Inventory.objects.select_related('product', 'warehouse').get(pk=inventory_id)
        admin_users = UserModel.objects.filter(role__in=['superadmin', 'manager'])

        for admin in admin_users:
            status_text = 'Out of Stock' if inventory.is_out_of_stock else 'Low Stock'
            _create_notification(
                admin.id, 'low_stock',
                f'{status_text}: {inventory.product.name}',
                f'{inventory.product.name} at {inventory.warehouse.name} has {inventory.quantity} units remaining.',
                '/admin/inventory'
            )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task
def send_coupon_expiry_warnings():
    """Check coupons expiring in 24 hours and notify admins."""
    from apps.coupons.models import Coupon
    from apps.users.models import User as UserModel
    from django.utils import timezone
    from datetime import timedelta

    expiring_soon = Coupon.objects.filter(
        is_active=True,
        expiry__lte=timezone.now() + timedelta(hours=24),
        expiry__gte=timezone.now()
    )
    if not expiring_soon.exists():
        return

    admin_users = UserModel.objects.filter(role__in=['superadmin', 'manager'])
    for coupon in expiring_soon:
        for admin in admin_users:
            _create_notification(
                admin.id, 'coupon_expiry',
                f'Coupon Expiring: {coupon.code}',
                f'Coupon {coupon.code} expires in less than 24 hours.',
                '/admin/coupons'
            )
