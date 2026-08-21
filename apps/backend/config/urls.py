from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/identity/', include('identity.urls')),
    path('api/v1/kyc/', include('kyc.urls')),
    path('api/v1/marketplace/', include('marketplace.urls')),
    path('api/v1/orders/', include('orders.urls')),

    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]