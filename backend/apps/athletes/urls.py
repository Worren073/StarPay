from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AthleteViewSet

router = DefaultRouter()
router.register(r'', AthleteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
