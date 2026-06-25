import base64
from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import date, timedelta
from .models import Invoice, Transaction, PaymentProof
from .serializers import InvoiceSerializer, TransactionSerializer, PaymentProofSerializer
from apps.athletes.models import AthletePlan, Plan
from apps.notifications.views import send_notification


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = Invoice.objects.select_related('athlete')
        user = self.request.user
        if user.is_authenticated and user.role == 'coach':
            staff = getattr(user, 'staffmember', None)
            if staff:
                qs = qs.filter(athlete__coaches=staff)
        invoice_status = self.request.query_params.get('status')
        if invoice_status:
            qs = qs.filter(status=invoice_status)
        return qs

    def _renew_plan(self, invoice):
        try:
            athlete_plan = AthletePlan.objects.get(athlete=invoice.athlete)
            plan = athlete_plan.plan or Plan.objects.first()
            athlete_plan.start_date = date.today()
            athlete_plan.end_date = date.today() + timedelta(days=plan.duration_days)
            athlete_plan.save(update_fields=['start_date', 'end_date'])
            if invoice.athlete.user:
                send_notification(
                    user=invoice.athlete.user,
                    notification_type='plan_renewed',
                    title='Plan renovado',
                    message=f'Tu plan {plan.name} ha sido renovado hasta el {athlete_plan.end_date}',
                    link='/athlete/payments',
                )
        except AthletePlan.DoesNotExist:
            pass

    @action(detail=True, methods=['post'])
    def submit_payment(self, request, pk=None):
        invoice = self.get_object()
        if invoice.athlete.user != request.user and request.user.role not in ('admin',):
            return Response({'error': 'No tienes permiso para pagar esta factura'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        is_cash = data.get('method') == 'cash' and request.user.role == 'admin'
        if is_cash:
            data['status'] = 'paid'

        image_file = request.FILES.get('image')
        if image_file:
            content_type = image_file.content_type or 'image/jpeg'
            data['image'] = f'data:{content_type};base64,{base64.b64encode(image_file.read()).decode("utf-8")}'

        serializer = PaymentProofSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        proof = serializer.save(invoice=invoice)

        if is_cash:
            invoice.status = 'paid'
            invoice.save(update_fields=['status'])
            Transaction.objects.create(
                invoice=invoice,
                reference=proof.reference or f"CASH-{proof.id}",
                amount=invoice.amount,
                method='Efectivo',
                status='paid',
            )
            if invoice.invoice_type == 'plan_renewal':
                self._renew_plan(invoice)

            if invoice.athlete.user:
                send_notification(
                    user=invoice.athlete.user,
                    notification_type='payment_verified',
                    title='Pago en efectivo recibido',
                    message=f'Pago de ${invoice.amount} recibido en efectivo por {invoice.description}',
                )

        return Response(PaymentProofSerializer(proof).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def proofs(self, request, pk=None):
        invoice = self.get_object()
        proofs = PaymentProof.objects.filter(invoice=invoice)
        serializer = PaymentProofSerializer(proofs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def verify_proof(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Solo administradores pueden verificar pagos'}, status=status.HTTP_403_FORBIDDEN)

        invoice = self.get_object()
        proof_id = request.data.get('proof_id')
        new_status = request.data.get('status')

        if not proof_id or not new_status:
            return Response({'error': 'proof_id y status son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            proof = PaymentProof.objects.get(id=proof_id, invoice=invoice)
        except PaymentProof.DoesNotExist:
            return Response({'error': 'Comprobante no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        proof.status = new_status
        proof.save(update_fields=['status'])

        if new_status == 'paid':
            invoice.status = 'paid'
            invoice.save(update_fields=['status'])
            Transaction.objects.create(
                invoice=invoice,
                reference=proof.reference or f"PROOF-{proof.id}",
                amount=invoice.amount,
                method=proof.get_method_display(),
                status='paid',
            )
            if invoice.invoice_type == 'plan_renewal':
                self._renew_plan(invoice)

        return Response(PaymentProofSerializer(proof).data)

    def destroy(self, request, *args, **kwargs):
        invoice = self.get_object()
        if invoice.athlete.user:
            send_notification(
                user=invoice.athlete.user,
                notification_type='payment_rejected',
                title='Factura eliminada',
                message=f'Tu factura #{invoice.id} por ${invoice.amount} ha sido eliminada por el administrador',
                link='/athlete/payments',
            )
        return super().destroy(request, *args, **kwargs)


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
