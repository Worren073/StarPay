from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Competition, Result
from .serializers import (
    CompetitionSerializer,
    CompetitionDetailSerializer,
    ResultSerializer,
)


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
        if comp_type:
            qs = qs.filter(type=comp_type)
        if comp_status:
            qs = qs.filter(status=comp_status)
        return qs

    @action(detail=True, methods=['get', 'post'], url_path='results')
    def results(self, request, pk=None):
        competition = self.get_object()
        
        if request.method == 'POST':
            serializer = ResultSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(competition=competition)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        results = competition.results.all()
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
