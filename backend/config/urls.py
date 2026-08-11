from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('dj-admin/', admin.site.urls),

    # 1. CLIENT ENDPOINTS (Includes user login, register, profile via apps.users.urls)
    path('api/v1/auth/', include(('apps.users.urls', 'users'), namespace='client_auth')),
    path('api/v1/products/', include(('apps.products.urls', 'products'), namespace='client_products')),
    path('api/v1/orders/', include(('apps.orders.urls', 'orders'), namespace='client_orders')),
    path('api/v1/marketplace/', include(('apps.marketplace.urls', 'marketplace'), namespace='client_marketplace')),
    path('api/v1/logistics/', include(('apps.logistics.urls', 'logistics'), namespace='client_logistics')),
    path('api/v1/cooperatives/', include(('apps.cooperatives.urls', 'cooperatives'), namespace='client_cooperatives')),

    # 2. ADMIN ENDPOINTS
    path('api/v1/admin/users/', include(('apps.users.urls', 'users'), namespace='admin_users')),
    path('api/v1/admin/marketplace/', include(('apps.marketplace.urls', 'marketplace'), namespace='admin_marketplace')),
    path('api/v1/admin/logistics/', include(('apps.logistics.urls', 'logistics'), namespace='admin_logistics')),
    path('api/v1/admin/analytics/', include(('apps.analytics.urls', 'analytics'), namespace='admin_analytics')),

    # 3. DIRECT MAPPINGS (Frontend legacy/direct compatibility)
    path('api/listings/', include(('apps.products.urls', 'listings'))),
    path('api/orders/', include(('apps.orders.urls', 'orders'))),
    path('api/prices/', include(('apps.marketplace.urls', 'prices'))),
    path('api/cooperatives/', include(('apps.cooperatives.urls', 'cooperatives'))),
]