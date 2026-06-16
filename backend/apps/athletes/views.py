from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import date, timedelta
from .models import Athlete, AthleteProgress, Plan, AthletePlan
from .serializers import AthleteSerializer, AthleteProgressSerializer, AthleteProfileSerializer, PlanSerializer, AthletePlanSerializer
from apps.payments.models import Invoice
from apps.payments.serializers import InvoiceSerializer
from apps.competitions.models import CompetitionAthlete
from apps.competitions.serializers import CompetitionAthleteSerializer
from rest_framework.exceptions import PermissionDenied


class IsAdminOrCoach(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ('admin', 'coach')


class AthleteViewSet(viewsets.ModelViewSet):
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', 'category', 'level')
    ordering_fields = ('name', 'level', 'speed_score', 'technique_score', 'form_score', 'created_at')
    ordering = ('-created_at',)

    def get_permissions(self):
        if self.action in ('list', 'create', 'update', 'partial_update', 'destroy'):
            return (IsAdminOrCoach(),)
        return (permissions.IsAuthenticatedOrReadOnly(),)

    def get_queryset(self):
        qs = Athlete.objects.all()
        level = self.request.query_params.get('level')
        status = self.request.query_params.get('status')
        if level:
            qs = qs.filter(level=level)
        if status:
            qs = qs.filter(status=status)
        user = self.request.user
        if user.role == 'coach':
            staff_member = getattr(user, 'staffmember', None)
            if staff_member:
                qs = qs.filter(coaches=staff_member)
        return qs

    @action(detail=True, methods=['get'])
    def plan(self, request, pk=None):
        athlete = self.get_object()
        try:
            athlete_plan = AthletePlan.objects.get(athlete=athlete)
            serializer = AthletePlanSerializer(athlete_plan)
            return Response(serializer.data)
        except AthletePlan.DoesNotExist:
            return Response({}, status=200)

    @action(detail=True, methods=['post'])
    def generate_renewal_invoice(self, request, pk=None):
        athlete = self.get_object()
        if request.user.role != 'admin' and athlete.user != request.user:
            return Response({'error': 'No tienes permiso para generar facturas de este atleta'}, status=status.HTTP_403_FORBIDDEN)
        try:
            athlete_plan = AthletePlan.objects.get(athlete=athlete)
        except AthletePlan.DoesNotExist:
            return Response({'error': 'El atleta no tiene un plan asignado'}, status=status.HTTP_400_BAD_REQUEST)

        if athlete_plan.status not in ('expiring', 'expired'):
            return Response({'error': 'El plan aún no está por vencer'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.payments.models import Invoice
        if Invoice.objects.filter(
            athlete=athlete,
            invoice_type='plan_renewal',
            status='pending',
        ).exists():
            return Response({'error': 'Ya existe una factura de renovación pendiente'}, status=status.HTTP_400_BAD_REQUEST)

        plan = athlete_plan.plan
        if not plan:
            return Response({'error': 'El plan no tiene un precio configurado'}, status=status.HTTP_400_BAD_REQUEST)

        invoice = Invoice.objects.create(
            athlete=athlete,
            amount=plan.price,
            status='pending',
            invoice_type='plan_renewal',
            due_date=date.today() + timedelta(days=7),
            description=f'Renovación: {plan.name}',
        )
        from apps.payments.serializers import InvoiceSerializer
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def change_plan(self, request, pk=None):
        athlete = self.get_object()
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'plan_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        from .models import Plan
        plan = get_object_or_404(Plan, id=plan_id)
        try:
            athlete_plan = AthletePlan.objects.get(athlete=athlete)
        except AthletePlan.DoesNotExist:
            return Response({'error': 'El atleta no tiene un plan asignado'}, status=status.HTTP_400_BAD_REQUEST)
        athlete_plan.plan = plan
        athlete_plan.save(update_fields=['plan'])
        serializer = AthletePlanSerializer(athlete_plan)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def progress(self, request, pk=None):
        athlete = self.get_object()

        if request.method == 'GET':
            qs = athlete.progress.all()
            serializer = AthleteProgressSerializer(qs, many=True)
            return Response(serializer.data)

        user = request.user
        if user.role != 'admin':
            staff_member = getattr(user, 'staffmember', None)
            if not staff_member or not athlete.coaches.filter(id=staff_member.id).exists():
                return Response(
                    {'error': 'No tienes permiso para registrar progreso de este atleta'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = AthleteProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(athlete=athlete)

        athlete.speed_score = serializer.validated_data.get('speed_score', athlete.speed_score)
        athlete.technique_score = serializer.validated_data.get('technique_score', athlete.technique_score)
        athlete.form_score = serializer.validated_data.get('form_score', athlete.form_score)
        athlete.save(update_fields=['speed_score', 'technique_score', 'form_score'])

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = (permissions.IsAdminUser,)


class MeViewSet(viewsets.GenericViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def get_athlete(self, request):
        user = request.user
        if user.role != 'athlete':
            return None
        try:
            return Athlete.objects.get(user=user)
        except Athlete.DoesNotExist:
            return None

    @action(detail=False, methods=['get'])
    def profile(self, request):
        athlete = self.get_athlete(request)
        if not athlete:
            return Response({}, status=200)
        serializer = AthleteProfileSerializer(athlete)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def progress(self, request):
        athlete = self.get_athlete(request)
        if not athlete:
            return Response([], status=200)
        qs = athlete.progress.all()
        serializer = AthleteProgressSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def payments(self, request):
        athlete = self.get_athlete(request)
        if not athlete:
            return Response([], status=200)
        invoices = Invoice.objects.filter(athlete=athlete)
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def plan(self, request):
        athlete = self.get_athlete(request)
        if not athlete:
            return Response({}, status=200)
        try:
            athlete_plan = AthletePlan.objects.get(athlete=athlete)
            serializer = AthletePlanSerializer(athlete_plan)
            return Response(serializer.data)
        except AthletePlan.DoesNotExist:
            return Response({}, status=200)

    @action(detail=False, methods=['get'])
    def competitions(self, request):
        athlete = self.get_athlete(request)
        if not athlete:
            return Response([], status=200)
        assignments = CompetitionAthlete.objects.filter(athlete=athlete).select_related('competition')
        serializer = CompetitionAthleteSerializer(assignments, many=True)
        return Response(serializer.data)
