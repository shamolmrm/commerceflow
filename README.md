# CommerceFlow — E-commerce + Inventory Management System

A production-ready full-stack e-commerce platform with inventory management, built with Django 5 + Next.js 15.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion |
| State | Redux Toolkit + redux-persist, React Query (TanStack) |
| Backend | Django 5, Django REST Framework, Celery + Redis |
| Database | PostgreSQL 16 |
| Auth | JWT (djangorestframework-simplejwt) with refresh + blacklist |
| Payments | Stripe, PayPal, SSLCommerz, Cash on Delivery |
| Deployment | Docker + docker-compose, Nginx, Gunicorn |

## Project Structure

```
CommerceFlow/
├── backend/
│   ├── apps/
│   │   ├── users/          # Auth, roles, OTP
│   │   ├── products/       # Product catalog
│   │   ├── categories/     # Category tree
│   │   ├── brands/         # Brands
│   │   ├── inventory/      # Stock, suppliers, purchase orders
│   │   ├── orders/         # Order management
│   │   ├── payments/       # Stripe, PayPal, SSLCommerz
│   │   ├── cart/           # Cart (auth + guest)
│   │   ├── reviews/        # Product reviews
│   │   ├── wishlist/       # Wishlists
│   │   ├── coupons/        # Discount codes
│   │   ├── addresses/      # Shipping addresses
│   │   ├── notifications/  # Push notifications + Celery tasks
│   │   ├── reports/        # Analytics + PDF invoices
│   │   └── warehouses/     # Warehouse management
│   ├── config/             # Django settings, URLs, Celery
│   ├── templates/          # Email HTML templates
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Login, Register, OTP, Forgot password
│   │   ├── account/        # Customer dashboard
│   │   ├── admin/          # Admin panel
│   │   ├── products/       # Product listing + detail
│   │   ├── cart/           # Cart page
│   │   └── checkout/       # 3-step checkout + success
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client, validators, utils
│   ├── store/              # Redux slices
│   └── types/              # TypeScript interfaces
├── nginx/nginx.conf
└── docker-compose.yml
```

## Quick Start (Development)

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16
- Redis 7

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your DB credentials, secret key, email, Stripe keys

python manage.py migrate
python manage.py seed_all      # Load 300+ demo products, 50 customers, coupons
python manage.py runserver
```

Backend runs at: http://localhost:8000  
API Docs (Swagger): http://localhost:8000/api/docs/  
Django Admin: http://localhost:8000/django-admin/

### Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

npm run dev
```

Frontend runs at: http://localhost:3000

## Docker Deployment

```bash
# 1. Copy and fill env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Build and start all 7 services
docker-compose up -d --build

# 3. Run migrations and seed
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_all

# 4. Visit http://localhost
```

Services started:
- `db` — PostgreSQL 16
- `redis` — Redis 7
- `backend` — Django + Gunicorn (port 8000 internal)
- `celery` — Celery worker
- `celery-beat` — Celery beat scheduler
- `frontend` — Next.js standalone (port 3000 internal)
- `nginx` — Reverse proxy (port 80 public)

## Demo Accounts (after seed_all)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@supersoft.com | Admin@1234 |
| Manager | manager@supersoft.com | Admin@1234 |
| Staff | staff@supersoft.com | Admin@1234 |
| Customer | customer@example.com | Admin@1234 |

## Demo Coupons

| Code | Type | Value |
|------|------|-------|
| WELCOME10 | Percentage | 10% off |
| SAVE20 | Percentage | 20% off |
| FLAT50 | Fixed | $50 off |
| FREESHIP | Fixed shipping | Free shipping |

## API Reference

All endpoints under `/api/v1/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/register/` | POST | Register + send OTP |
| `/users/login/` | POST | JWT login |
| `/users/me/` | GET/PATCH | Profile |
| `/products/` | GET | List with filters |
| `/products/{slug}/` | GET | Product detail |
| `/cart/` | GET | View cart |
| `/cart/add/` | POST | Add item |
| `/orders/` | GET/POST | Orders |
| `/payments/stripe/initiate/` | POST | Stripe PaymentIntent |
| `/admin/stats/overview/` | GET | Dashboard stats |
| `/inventory/` | GET | Stock levels |

Full Swagger docs at `/api/docs/`

## Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

DB_NAME=commerceflow
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=db
DB_PORT=5432

REDIS_URL=redis://redis:6379/0

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=CommerceFlow <noreply@commerceflow.com>

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...

SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASS=...
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Production Deployment (Ubuntu VPS)

```bash
# 1. Install Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone repository
git clone https://github.com/your-org/commerceflow.git
cd commerceflow

# 3. Configure env files
cp backend/.env.example backend/.env && nano backend/.env
cp frontend/.env.example frontend/.env.local && nano frontend/.env.local

# 4. Start services
docker-compose up -d --build

# 5. Initial setup
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py seed_all

# 6. Setup SSL (optional, with certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 7. Check logs
docker-compose logs -f
```

## Features

### Customer
- Browse 300+ products with advanced filtering (price, rating, category, brand, in-stock)
- Product detail with image gallery, variant selection (size/color), and reviews
- Shopping cart (persistent for logged-in users, session-based for guests)
- 3-step checkout with Stripe, PayPal, SSLCommerz, or Cash on Delivery
- Order tracking with status history and PDF invoice download
- Wishlist, saved addresses, and notification center

### Admin
- Dashboard with revenue charts (Recharts), top products, low-stock alerts
- Product management: add/edit/delete, CSV bulk import, export
- Inline inventory adjustment with audit log
- Order management: status updates, inline detail modal, invoice download
- Reports: date-range analytics, category breakdown, export to CSV/Excel

### Technical
- JWT authentication with 15-min access + 7-day refresh tokens with rotation
- Celery tasks: OTP emails, order notifications, low-stock alerts, coupon expiry warnings
- Redis caching with django-redis
- Auto-generated Swagger/OpenAPI docs
- Cursor-based + page-based pagination
- select_related + prefetch_related on all list queries for N+1 prevention
- ReportLab PDF invoices, openpyxl Excel exports
- Next.js 15 App Router with server/client component separation
- Framer Motion page transitions and stagger animations
