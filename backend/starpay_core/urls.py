from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/athletes/', include('apps.athletes.urls')),
    path('api/competitions/', include('apps.competitions.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/staff/', include('apps.staff.urls')),
]
