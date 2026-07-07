"""
Local development settings using SQLite (no PostgreSQL/Redis required).
"""
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

# Override database to use SQLite — no PostgreSQL needed locally
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'database' / 'db.sqlite3',
    }
}

# Override cache to use local memory — no Redis needed
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Override Celery to run tasks synchronously (no Redis broker)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Use console email
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Remove apps that require Redis/Celery DB tables
INSTALLED_APPS = [app for app in INSTALLED_APPS if app not in [
    'django_celery_beat',
    'django_celery_results',
]]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': 'INFO', 'propagate': False},
    },
}
