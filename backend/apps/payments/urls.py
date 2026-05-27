from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, TransactionViewSet, PaymentSummaryView

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet)
router.register(r'transactions', TransactionViewSet, basename='transactions')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', PaymentSummaryView.as_view(), name='payment-summary'),
]
