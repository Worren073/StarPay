from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from apps.athletes.views import PlanViewSet

plans_router = DefaultRouter()
plans_router.register(r'plans', PlanViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/athletes/', include('apps.athletes.urls')),
    path('api/competitions/', include('apps.competitions.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/', include(plans_router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# SPA catch-all: serve frontend index.html for any non-API route
urlpatterns += [
    re_path(r'^(?!api/|admin/|media/|static/).*$', TemplateView.as_view(template_name='index.html')),
]
