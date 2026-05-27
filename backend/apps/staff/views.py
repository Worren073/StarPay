from rest_framework import viewsets, permissions, filters
from .models import StaffMember
from .serializers import StaffMemberSerializer


class StaffMemberViewSet(viewsets.ModelViewSet):
    queryset = StaffMember.objects.all()
    serializer_class = StaffMemberSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', 'specialty')
    ordering_fields = ('name', 'specialty', 'athletes_count', 'created_at')
    ordering = ('name',)

    def get_queryset(self):
        qs = StaffMember.objects.all()
        specialty = self.request.query_params.get('specialty')
        staff_status = self.request.query_params.get('status')
        if specialty:
            qs = qs.filter(specialty=specialty)
        if staff_status:
            qs = qs.filter(status=staff_status)
        return qs
