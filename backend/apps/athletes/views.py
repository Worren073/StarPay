from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Athlete
from .serializers import AthleteSerializer


class AthleteViewSet(viewsets.ModelViewSet):
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', 'category', 'level')
    ordering_fields = ('name', 'level', 'speed_score', 'technique_score', 'form_score', 'created_at')
    ordering = ('-created_at',)

    def get_queryset(self):
        qs = Athlete.objects.all()
        level = self.request.query_params.get('level')
        status = self.request.query_params.get('status')
        if level:
            qs = qs.filter(level=level)
        if status:
            qs = qs.filter(status=status)
        return qs
