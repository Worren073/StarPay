from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AthleteViewSet, MeViewSet, PlanViewSet

router = DefaultRouter()
router.register(r'', AthleteViewSet)

urlpatterns = [
    path('me/profile/', MeViewSet.as_view({'get': 'profile'}), name='me-profile'),
    path('me/progress/', MeViewSet.as_view({'get': 'progress'}), name='me-progress'),
    path('me/payments/', MeViewSet.as_view({'get': 'payments'}), name='me-payments'),
    path('me/plan/', MeViewSet.as_view({'get': 'plan'}), name='me-plan'),
    path('me/competitions/', MeViewSet.as_view({'get': 'competitions'}), name='me-competitions'),
    path('', include(router.urls)),
]
