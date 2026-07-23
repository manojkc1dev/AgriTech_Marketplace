from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularRedocView, 
    SpectacularSwaggerView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # SimpleJWT Endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # OpenAPI Schema & Documentation Endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Application Endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/market-prices/', include('apps.market_prices.urls')),
    path('api/demands/', include('apps.demands.urls')),
    path('api/negotiations/', include('apps.negotiations.urls')),
    path('api/', include('apps.products.urls')),
    # path('api/products/', include('apps.products.urls')),
    
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/logistics/', include('apps.logistics.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/reports/', include('apps.reports.urls')),
]