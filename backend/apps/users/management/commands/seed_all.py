"""
Complete seed command: categories, brands, products, users, orders, reviews, coupons.
Run: python manage.py seed_all
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta
import random
import decimal


class Command(BaseCommand):
    help = 'Seed the database with complete demo data'

    CATEGORIES = [
        {'name': 'Electronics', 'sub': ['Smartphones', 'Laptops', 'Audio', 'Cameras']},
        {'name': 'Fashion', 'sub': ['Men\'s Clothing', 'Women\'s Clothing', 'Footwear', 'Accessories']},
        {'name': 'Home & Decor', 'sub': ['Furniture', 'Kitchen', 'Bedding', 'Lighting']},
        {'name': 'Sports', 'sub': ['Fitness', 'Outdoor', 'Team Sports', 'Yoga']},
        {'name': 'Beauty', 'sub': ['Skincare', 'Makeup', 'Haircare', 'Fragrance']},
        {'name': 'Books', 'sub': ['Fiction', 'Non-Fiction', 'Science', 'Self-Help']},
        {'name': 'Grocery', 'sub': ['Organic', 'Beverages', 'Snacks', 'Fresh Produce']},
        {'name': 'Toys', 'sub': ['Action Figures', 'Board Games', 'Educational', 'Outdoor Toys']},
        {'name': 'Automotive', 'sub': ['Car Accessories', 'Tools', 'Care Products']},
    ]

    BRANDS = [
        'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Zara', 'H&M',
        'Amazon Basics', 'Dell', 'HP', 'Lenovo', 'Canon', 'LG', 'Bose',
        'Under Armour', 'Puma', 'Reebok', 'New Balance', 'ASUS', 'Microsoft'
    ]

    PRODUCT_TEMPLATES = {
        'Electronics': [
            ('iPhone 15 Pro Max', 1199.99, 999.99),
            ('Samsung Galaxy S24 Ultra', 1099.99, 899.99),
            ('Sony WH-1000XM5 Headphones', 399.99, 279.99),
            ('MacBook Air M3', 1299.99, 1099.99),
            ('Dell XPS 15 Laptop', 1499.99, 1199.99),
            ('iPad Pro 12.9"', 1099.99, 899.99),
            ('Canon EOS R6 Camera', 2499.99, 1999.99),
            ('LG OLED 65" TV', 1999.99, 1599.99),
            ('Bose QuietComfort Earbuds', 279.99, 199.99),
            ('Apple Watch Series 9', 429.99, 349.99),
        ],
        'Fashion': [
            ('Premium Cotton Oxford Shirt', 89.99, 59.99),
            ('Slim Fit Chino Pants', 79.99, 49.99),
            ('Leather Chelsea Boots', 189.99, 129.99),
            ('Cashmere Turtleneck Sweater', 149.99, 99.99),
            ('Floral Maxi Dress', 119.99, 79.99),
            ('Athletic Joggers', 69.99, 44.99),
            ('Aviator Sunglasses', 159.99, 99.99),
            ('Genuine Leather Wallet', 79.99, 54.99),
            ('Silk Blouse', 129.99, 89.99),
            ('Denim Jacket', 99.99, 69.99),
        ],
        'Home & Decor': [
            ('Ergonomic Office Chair', 499.99, 349.99),
            ('Smart LED Floor Lamp', 149.99, 99.99),
            ('Egyptian Cotton Bedsheet Set', 129.99, 89.99),
            ('Bamboo Cutting Board Set', 49.99, 34.99),
            ('Ceramic Plant Pot Set', 39.99, 27.99),
            ('Stainless Steel Cookware Set', 299.99, 199.99),
            ('Memory Foam Pillow', 79.99, 54.99),
            ('Minimalist Wall Clock', 59.99, 39.99),
            ('Aromatherapy Diffuser', 49.99, 34.99),
            ('Blackout Curtains (Pair)', 89.99, 59.99),
        ],
        'Sports': [
            ('Yoga Mat Premium Cork', 79.99, 54.99),
            ('Adjustable Dumbbell Set', 299.99, 219.99),
            ('Running Shoes Pro', 149.99, 99.99),
            ('Resistance Bands Set', 34.99, 24.99),
            ('Hydration Running Vest', 89.99, 64.99),
            ('Jump Rope Speed Cable', 24.99, 17.99),
            ('Foam Roller Massage', 39.99, 27.99),
            ('Gym Gloves Weightlifting', 29.99, 19.99),
            ('Basketball Official Size', 59.99, 44.99),
            ('Bicycle Helmet Safety', 99.99, 69.99),
        ],
        'Beauty': [
            ('Vitamin C Serum 20%', 49.99, 34.99),
            ('Hyaluronic Acid Moisturizer', 39.99, 27.99),
            ('Retinol Night Cream', 59.99, 44.99),
            ('Natural Sunscreen SPF 50', 29.99, 21.99),
            ('Rose Water Toner', 24.99, 17.99),
            ('Keratin Hair Treatment', 69.99, 49.99),
            ('Argan Oil Hair Mask', 34.99, 24.99),
            ('Matte Lipstick Set', 44.99, 29.99),
            ('Eau de Parfum 100ml', 89.99, 64.99),
            ('Jade Facial Roller', 29.99, 19.99),
        ],
    }

    UNSPLASH_IMAGES = {
        'Electronics': [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
            'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600',
            'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',
        ],
        'Fashion': [
            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
            'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
            'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=600',
            'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600',
        ],
        'Home & Decor': [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
        ],
        'Sports': [
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
            'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
            'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',
        ],
        'Beauty': [
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
            'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600',
            'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600',
            'https://images.unsplash.com/photo-1567721913486-6585f069b3ca?w=600',
        ],
        'default': [
            'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600',
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600',
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
        ],
    }

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('🌱 Starting database seeding...'))
        self._create_admin_users()
        self._create_categories()
        self._create_brands()
        self._create_warehouses()
        self._create_products()
        self._create_customers()
        self._create_coupons()
        self.stdout.write(self.style.SUCCESS('✅ Database seeding complete!'))

    def _create_admin_users(self):
        from apps.users.models import User
        self.stdout.write('Creating admin users...')

        users_data = [
            {'email': settings.ADMIN_EMAIL, 'full_name': 'Super Admin', 'role': 'superadmin', 'password': settings.ADMIN_PASS},
            {'email': 'manager@supersoft.com', 'full_name': 'John Manager', 'role': 'manager', 'password': 'Manager@1234'},
            {'email': 'staff@supersoft.com', 'full_name': 'Jane Staff', 'role': 'staff', 'password': 'Staff@1234'},
            {'email': 'demo@supersoft.com', 'full_name': 'Demo Customer', 'role': 'customer', 'password': 'Demo@1234'},
        ]

        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'full_name': data['full_name'],
                    'role': data['role'],
                    'is_verified': True,
                    'is_staff': data['role'] in ['superadmin'],
                    'is_superuser': data['role'] == 'superadmin',
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(f'  Created: {user.email}')

    def _create_categories(self):
        from apps.categories.models import Category
        self.stdout.write('Creating categories...')

        for cat_data in self.CATEGORIES:
            parent, _ = Category.objects.get_or_create(
                slug=slugify(cat_data['name']),
                defaults={'name': cat_data['name'], 'is_active': True, 'sort_order': self.CATEGORIES.index(cat_data)}
            )
            for sub_name in cat_data.get('sub', []):
                Category.objects.get_or_create(
                    slug=slugify(sub_name),
                    defaults={'name': sub_name, 'parent': parent, 'is_active': True}
                )
        self.stdout.write(f'  {Category.objects.count()} categories created')

    def _create_brands(self):
        from apps.brands.models import Brand
        self.stdout.write('Creating brands...')

        for brand_name in self.BRANDS:
            Brand.objects.get_or_create(
                slug=slugify(brand_name),
                defaults={'name': brand_name, 'is_active': True}
            )
        self.stdout.write(f'  {Brand.objects.count()} brands created')

    def _create_warehouses(self):
        from apps.warehouses.models import Warehouse
        self.stdout.write('Creating warehouses...')

        warehouses = [
            {'name': 'Main Warehouse', 'location': '123 Commerce Street, Dhaka, Bangladesh'},
            {'name': 'Secondary Warehouse', 'location': '456 Trade Avenue, Chittagong, Bangladesh'},
        ]
        for wh_data in warehouses:
            Warehouse.objects.get_or_create(name=wh_data['name'], defaults={'location': wh_data['location']})
        self.stdout.write(f'  {Warehouse.objects.count()} warehouses created')

    def _create_products(self):
        from apps.products.models import Product, ProductImage, ProductVariant
        from apps.inventory.models import Inventory
        from apps.categories.models import Category
        from apps.brands.models import Brand
        from apps.warehouses.models import Warehouse

        self.stdout.write('Creating products...')
        warehouses = list(Warehouse.objects.all())
        brands = list(Brand.objects.all())

        product_count = 0
        for cat_name, templates in self.PRODUCT_TEMPLATES.items():
            cat = Category.objects.filter(name=cat_name).first()
            if not cat:
                continue
            images = self.UNSPLASH_IMAGES.get(cat_name, self.UNSPLASH_IMAGES['default'])

            for i, (name, price, sale_price) in enumerate(templates):
                sku = f'{cat_name[:3].upper()}-{str(i+1).zfill(4)}-{random.randint(100, 999)}'
                brand = random.choice(brands)
                slug_base = slugify(name)
                slug = slug_base
                counter = 1
                while Product.objects.filter(slug=slug).exists():
                    slug = f'{slug_base}-{counter}'
                    counter += 1

                product, created = Product.objects.get_or_create(
                    sku=sku,
                    defaults={
                        'name': name,
                        'slug': slug,
                        'description': f'Premium quality {name}. Designed for performance and durability. '
                                      f'This {cat_name.lower()} product features cutting-edge technology and '
                                      f'superior craftsmanship. Perfect for everyday use.',
                        'short_description': f'High-quality {name} from {brand.name}.',
                        'category': cat,
                        'brand': brand,
                        'price': decimal.Decimal(str(price)),
                        'sale_price': decimal.Decimal(str(sale_price)),
                        'tax_rate': decimal.Decimal('5.00'),
                        'is_featured': random.random() > 0.6,
                        'is_active': True,
                        'rating': decimal.Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                        'review_count': random.randint(10, 500),
                    }
                )

                if created:
                    # Add images
                    for j, img_url in enumerate(images[:3]):
                        ProductImage.objects.create(
                            product=product,
                            image_url=img_url,
                            alt_text=name,
                            is_primary=(j == 0),
                            sort_order=j
                        )

                    # Add variants (color + size)
                    colors = ['Black', 'White', 'Blue', 'Red', 'Gray']
                    sizes = ['S', 'M', 'L', 'XL'] if cat_name == 'Fashion' else []
                    for color in random.sample(colors, 2):
                        ProductVariant.objects.create(
                            product=product, name='Color', value=color,
                            price_modifier=decimal.Decimal('0.00'),
                            stock=random.randint(5, 50)
                        )
                    for size in sizes:
                        ProductVariant.objects.create(
                            product=product, name='Size', value=size,
                            price_modifier=decimal.Decimal('0.00'),
                            stock=random.randint(5, 30)
                        )

                    # Add inventory
                    for warehouse in warehouses:
                        Inventory.objects.get_or_create(
                            product=product, warehouse=warehouse,
                            defaults={
                                'quantity': random.randint(10, 200),
                                'low_stock_threshold': 10
                            }
                        )
                    product_count += 1

        # Create more generic products to reach ~300 total
        all_cats = list(Category.objects.all())
        generic_names = [
            'Premium Wireless Earbuds', 'Smart Home Speaker', 'Portable Charger 20000mAh',
            'Gaming Mouse RGB', 'Mechanical Keyboard', 'USB-C Hub 7-in-1',
            'Skincare Essentials Kit', 'Luxury Perfume Set', 'Organic Face Wash',
            'Training Shorts', 'Compression Socks', 'Sports Water Bottle',
            'Canvas Backpack', 'Leather Card Holder', 'Travel Toiletry Bag',
            'Ceramic Coffee Mug', 'Scented Candle Set', 'Plant Stand Metal',
            'Mystery Thriller Novel', 'Python Programming Guide', 'Self-Help Bestseller',
            'Organic Green Tea', 'Protein Bar Variety Pack', 'Dark Chocolate Collection',
        ]

        for i, pname in enumerate(generic_names):
            price = random.uniform(19.99, 299.99)
            sale_price = price * random.uniform(0.6, 0.85)
            sku = f'GEN-{str(i+1).zfill(4)}-{random.randint(100, 999)}'
            cat = random.choice(all_cats)
            brand = random.choice(brands)
            slug_base = slugify(pname)
            slug = slug_base
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{counter}'
                counter += 1

            product, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': pname,
                    'slug': slug,
                    'description': f'High-quality {pname}. {brand.name} quality you can trust.',
                    'short_description': f'Premium {pname} by {brand.name}.',
                    'category': cat,
                    'brand': brand,
                    'price': decimal.Decimal(str(round(price, 2))),
                    'sale_price': decimal.Decimal(str(round(sale_price, 2))),
                    'is_featured': random.random() > 0.7,
                    'is_active': True,
                    'rating': decimal.Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                    'review_count': random.randint(10, 300),
                }
            )
            if created:
                img_url = random.choice(self.UNSPLASH_IMAGES['default'])
                ProductImage.objects.create(product=product, image_url=img_url, is_primary=True, sort_order=0)
                for warehouse in warehouses:
                    Inventory.objects.get_or_create(
                        product=product, warehouse=warehouse,
                        defaults={'quantity': random.randint(5, 150), 'low_stock_threshold': 10}
                    )
                product_count += 1

        self.stdout.write(f'  {Product.objects.count()} products created/existing')

    def _create_customers(self):
        from apps.users.models import User
        from apps.orders.models import Order, OrderItem, OrderStatusHistory
        from apps.addresses.models import Address
        from apps.products.models import Product
        from apps.reviews.models import Review
        from apps.warehouses.models import Warehouse

        self.stdout.write('Creating customers, addresses, orders, and reviews...')
        warehouses = list(Warehouse.objects.all())
        products = list(Product.objects.filter(is_active=True)[:50])

        first_names = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'Oliver', 'Isabella',
                       'Benjamin', 'Mia', 'Elijah', 'Charlotte', 'Lucas', 'Amelia', 'Mason', 'Harper', 'Logan', 'Evelyn']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore']
        cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Comilla']
        status_options = ['delivered', 'processing', 'shipped', 'pending']

        for i in range(50):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            email = f'{fname.lower()}.{lname.lower()}{i}@example.com'

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': f'{fname} {lname}',
                    'phone': f'+8801{random.randint(100000000, 999999999)}',
                    'role': 'customer',
                    'is_verified': True,
                }
            )
            if created:
                user.set_password('Customer@1234')
                user.save()

            # Create address
            addr, _ = Address.objects.get_or_create(
                user=user,
                label='Home',
                defaults={
                    'full_name': user.full_name,
                    'phone': user.phone or '+8801700000000',
                    'address_line': f'{random.randint(1, 999)} Test Street',
                    'city': random.choice(cities),
                    'state': 'Dhaka Division',
                    'country': 'Bangladesh',
                    'zip_code': str(random.randint(1000, 9999)),
                    'is_default': True,
                }
            )

            # Create 1-3 orders per customer
            num_orders = random.randint(1, 3)
            for _ in range(num_orders):
                if not products:
                    break

                order_products = random.sample(products, random.randint(1, 3))
                subtotal = sum(p.effective_price * random.randint(1, 2) for p in order_products)
                tax = round(subtotal * decimal.Decimal('0.05'), 2)
                total = subtotal + tax

                order = Order.objects.create(
                    customer=user,
                    status=random.choice(status_options),
                    subtotal=decimal.Decimal(str(round(float(subtotal), 2))),
                    tax=decimal.Decimal(str(round(float(tax), 2))),
                    shipping_charge=decimal.Decimal('5.00'),
                    total=decimal.Decimal(str(round(float(total) + 5, 2))),
                    shipping_address=addr,
                    payment_method=random.choice(['stripe', 'paypal', 'cod']),
                    payment_status='paid' if random.random() > 0.2 else 'pending',
                    created_at=timezone.now() - timedelta(days=random.randint(1, 365))
                )

                for p in order_products:
                    qty = random.randint(1, 2)
                    OrderItem.objects.create(
                        order=order,
                        product=p,
                        product_name=p.name,
                        quantity=qty,
                        unit_price=p.effective_price,
                    )

                OrderStatusHistory.objects.create(
                    order=order, status=order.status, notes='Order created via seed.'
                )

                # Add reviews for delivered orders
                if order.status == 'delivered':
                    for p in order_products:
                        if not Review.objects.filter(product=p, user=user).exists():
                            Review.objects.create(
                                product=p,
                                user=user,
                                rating=random.randint(3, 5),
                                title=random.choice([
                                    'Great product!', 'Excellent quality', 'Very satisfied',
                                    'Highly recommended', 'Good value for money', 'Love it!'
                                ]),
                                body=random.choice([
                                    'This product exceeded my expectations. Would definitely buy again!',
                                    'Solid quality and fast delivery. Very happy with this purchase.',
                                    'Great value for money. Works exactly as described.',
                                    'My family loves this. Will definitely recommend to friends.',
                                    'Perfect gift! Beautiful packaging and great quality.',
                                ]),
                                is_approved=True,
                                is_verified_purchase=True,
                            )

        self.stdout.write(f'  {User.objects.filter(role="customer").count()} customers created')

    def _create_coupons(self):
        from apps.coupons.models import Coupon
        self.stdout.write('Creating coupons...')

        coupons_data = [
            {'code': 'WELCOME10', 'type': 'percentage', 'value': 10, 'min_order': 50, 'max_uses': 1000},
            {'code': 'SAVE20', 'type': 'percentage', 'value': 20, 'min_order': 100, 'max_uses': 500},
            {'code': 'FLAT50', 'type': 'fixed', 'value': 50, 'min_order': 200, 'max_uses': 200},
            {'code': 'FLAT25', 'type': 'fixed', 'value': 25, 'min_order': 100, 'max_uses': 300},
            {'code': 'SUMMER30', 'type': 'percentage', 'value': 30, 'min_order': 150, 'max_uses': 100},
            {'code': 'NEWUSER15', 'type': 'percentage', 'value': 15, 'min_order': 0, 'max_uses': None},
            {'code': 'FLASH40', 'type': 'percentage', 'value': 40, 'min_order': 200, 'max_uses': 50},
            {'code': 'VIP100', 'type': 'fixed', 'value': 100, 'min_order': 500, 'max_uses': 50},
            {'code': 'FREESHIP', 'type': 'fixed', 'value': 5, 'min_order': 0, 'max_uses': 1000},
            {'code': 'MEGA50', 'type': 'percentage', 'value': 50, 'min_order': 300, 'max_uses': 25},
        ]

        for data in coupons_data:
            Coupon.objects.get_or_create(
                code=data['code'],
                defaults={
                    'type': data['type'],
                    'value': decimal.Decimal(str(data['value'])),
                    'min_order': decimal.Decimal(str(data['min_order'])),
                    'max_uses': data['max_uses'],
                    'expiry': timezone.now() + timedelta(days=365),
                    'is_active': True,
                    'description': f'{data["value"]}{"%" if data["type"] == "percentage" else "$"} off',
                }
            )
        self.stdout.write(f'  {Coupon.objects.count()} coupons created')
