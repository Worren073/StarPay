from django.contrib import admin
from .models import Athlete, AthleteProgress, Plan, AthletePlan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration_days', 'price', 'created_at')


@admin.register(AthletePlan)
class AthletePlanAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'plan', 'start_date', 'end_date', 'status', 'auto_renew')


@admin.register(Athlete)
class AthleteAdmin(admin.ModelAdmin):
    list_display = ('name', 'age', 'level', 'status', 'coach_list', 'created_at')
    list_filter = ('level', 'status')
    search_fields = ('name', 'category')

    def coach_list(self, obj):
        return ', '.join(c.name for c in obj.coaches.all()) or '—'
    coach_list.short_description = 'Coaches'


@admin.register(AthleteProgress)
class AthleteProgressAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'speed_score', 'technique_score', 'form_score', 'recorded_at')
    list_filter = ('recorded_at',)
