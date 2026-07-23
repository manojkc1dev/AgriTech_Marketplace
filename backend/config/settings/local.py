from .base import *

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '*']

# Use SQLite for fast local development & testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Print emails to terminal during dev
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'