from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Competition, Result, CompetitionAthlete, CompetitionCoach
from .serializers import (
    CompetitionSerializer,
    CompetitionDetailSerializer,
    ResultSerializer,
    CompetitionAthleteSerializer,
    CompetitionCoachSerializer,
)


class IsAdminOrCoach(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ('admin', 'coach')


class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CompetitionDetailSerializer
        return CompetitionSerializer

    def get_queryset(self):
        qs = Competition.objects.all()
        comp_type = self.request.query_params.get('type')
        comp_status = self.request.query_params.get('status')
        coach_assigned = self.request.query_params.get('coach_assigned')
        if comp_type:
            qs = qs.filter(type=comp_type)
        if comp_status:
            qs = qs.filter(status=comp_status)
        if coach_assigned == 'true' and self.request.user.is_authenticated:
            staff_member = getattr(self.request.user, 'staffmember', None)
            if staff_member:
                qs = qs.filter(assigned_coaches__staff_member=staff_member)
        return qs

    @action(detail=True, methods=['get', 'post'], url_path='results')
    def results(self, request, pk=None):
        competition = self.get_object()

        if request.method == 'POST':
            user = request.user
            if user.role != 'admin':
                staff_member = getattr(user, 'staffmember', None)
                if not staff_member:
                    return Response(
                        {'error': 'No tienes permiso para registrar resultados'},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                if not CompetitionCoach.objects.filter(competition=competition, staff_member=staff_member).exists():
                    return Response(
                        {'error': 'No estás asignado a esta competición'},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                athlete_id = request.data.get('athlete')
                if athlete_id:
                    from apps.athletes.models import Athlete
                    try:
                        athlete = Athlete.objects.get(id=athlete_id)
                        if not athlete.coaches.filter(id=staff_member.id).exists():
                            return Response(
                                {'error': 'Solo puedes registrar resultados de tus atletas'},
                                status=status.HTTP_403_FORBIDDEN,
                            )
                    except Athlete.DoesNotExist:
                        pass

            serializer = ResultSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(competition=competition)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        results = competition.results.all()
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post', 'delete'], url_path='athletes')
    def athletes(self, request, pk=None):
        competition = self.get_object()

        if request.method == 'DELETE':
            if request.user.role not in ('admin', 'coach'):
                return Response({'error': 'No tienes permiso'}, status=status.HTTP_403_FORBIDDEN)
            athlete_id = request.data.get('athlete_id') or request.query_params.get('athlete_id')
            if not athlete_id:
                return Response({'athlete_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
            from apps.athletes.models import Athlete
            try:
                athlete = Athlete.objects.get(id=athlete_id)
            except Athlete.DoesNotExist:
                return Response({'error': 'Athlete not found'}, status=status.HTTP_404_NOT_FOUND)
            if request.user.role == 'coach':
                staff_member = getattr(request.user, 'staffmember', None)
                if not staff_member or not athlete.coaches.filter(id=staff_member.id).exists():
                    return Response({'error': 'Solo puedes retirar tus propios atletas'}, status=status.HTTP_403_FORBIDDEN)
            deleted, _ = CompetitionAthlete.objects.filter(competition=competition, athlete=athlete).delete()
            if deleted == 0:
                return Response({'error': 'Athlete not assigned to this competition'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'message': 'Atleta retirado de la competencia'}, status=status.HTTP_200_OK)

        if request.method == 'POST':
            if request.user.role not in ('admin', 'coach'):
                return Response({'error': 'No tienes permiso'}, status=status.HTTP_403_FORBIDDEN)
            athlete_id = request.data.get('athlete_id')
            status_val = request.data.get('status', 'invited')
            if not athlete_id:
                return Response({'athlete_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
            from apps.athletes.models import Athlete
            try:
                athlete = Athlete.objects.get(id=athlete_id)
            except Athlete.DoesNotExist:
                return Response({'athlete_id': ['Invalid athlete']}, status=status.HTTP_400_BAD_REQUEST)
            obj, created = CompetitionAthlete.objects.get_or_create(
                competition=competition,
                athlete=athlete,
                defaults={'status': status_val}
            )
            if not created:
                return Response({'error': 'Athlete already assigned'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = CompetitionAthleteSerializer(obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        if request.user.role not in ('admin', 'coach', 'athlete'):
            return Response({'error': 'No tienes permiso'}, status=status.HTTP_403_FORBIDDEN)

        qs = competition.assigned_athletes.all().select_related('athlete')
        serializer = CompetitionAthleteSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], url_path='coaches')
    def coaches(self, request, pk=None):
        competition = self.get_object()

        if request.method == 'POST':
            if request.user.role not in ('admin', 'coach'):
                return Response({'error': 'No tienes permiso'}, status=status.HTTP_403_FORBIDDEN)
            staff_member_id = request.data.get('staff_member_id')
            if not staff_member_id:
                return Response({'staff_member_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
            from apps.staff.models import StaffMember
            try:
                staff_member = StaffMember.objects.get(id=staff_member_id)
            except StaffMember.DoesNotExist:
                return Response({'staff_member_id': ['Invalid staff member']}, status=status.HTTP_400_BAD_REQUEST)
            obj, created = CompetitionCoach.objects.get_or_create(
                competition=competition,
                staff_member=staff_member,
            )
            if not created:
                return Response({'error': 'Coach already assigned'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = CompetitionCoachSerializer(obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        if request.user.role not in ('admin', 'coach', 'athlete'):
            return Response({'error': 'No tienes permiso'}, status=status.HTTP_403_FORBIDDEN)

        qs = competition.assigned_coaches.all().select_related('staff_member')
        serializer = CompetitionCoachSerializer(qs, many=True)
        return Response(serializer.data)


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = Result.objects.all()
        user = self.request.user
        if user.is_authenticated and user.role == 'coach':
            staff_member = getattr(user, 'staffmember', None)
            if staff_member:
                qs = qs.filter(athlete__coaches=staff_member)
        return qs
