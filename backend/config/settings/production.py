from .base import *

# Explicitly override DEBUG to False for production safety
DEBUG = False

# Add production domains here
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='example.com').split(',')