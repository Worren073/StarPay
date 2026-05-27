from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CompetitionViewSet, ResultViewSet

router = DefaultRouter()
router.register(r'', CompetitionViewSet, basename='competition')
router.register(r'results', ResultViewSet, basename='result')

urlpatterns = router.urls
