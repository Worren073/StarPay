from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from .models import Invoice, Transaction
from .serializers import InvoiceSerializer, TransactionSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = Invoice.objects.select_related('athlete')
        invoice_status = self.request.query_params.get('status')
        if invoice_status:
            qs = qs.filter(status=invoice_status)
        return qs


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.select_related('invoice')
    serializer_class = TransactionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class PaymentSummaryView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        total_collected = Invoice.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
        outstanding = Invoice.objects.filter(status='pending').aggregate(total=Sum('amount'))['total'] or 0
        pending_count = Invoice.objects.filter(status='pending').count()
        overdue = Invoice.objects.filter(status='overdue').aggregate(total=Sum('amount'))['total'] or 0

        next_30 = timezone.now().date() + timedelta(days=30)
        upcoming_invoices = Invoice.objects.filter(
            status='pending',
            due_date__lte=next_30,
            due_date__gte=timezone.now().date()
        )
        next_billing_estimated = upcoming_invoices.aggregate(total=Sum('amount'))['total'] or 0

        next_invoice = Invoice.objects.filter(
            status='pending',
            due_date__gte=timezone.now().date()
        ).order_by('due_date').first()

        return Response({
            'total_collected': total_collected,
            'outstanding': outstanding,
            'pending_invoices_count': pending_count,
            'overdue_amount': overdue,
            'next_billing_date': next_invoice.due_date if next_invoice else None,
            'next_billing_estimated': next_billing_estimated,
        })
