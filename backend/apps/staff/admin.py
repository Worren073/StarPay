from django.contrib import admin
from .models import StaffMember


@admin.register(StaffMember)
class StaffMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty', 'status', 'athletes_count', 'next_session_time')
    list_filter = ('specialty', 'status')
    search_fields = ('name',)
