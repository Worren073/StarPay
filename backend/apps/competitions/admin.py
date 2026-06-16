from django.contrib import admin
from .models import Competition, Result, CompetitionAthlete, CompetitionCoach


class ResultInline(admin.TabularInline):
    model = Result
    extra = 0


class CompetitionAthleteInline(admin.TabularInline):
    model = CompetitionAthlete
    extra = 0


class CompetitionCoachInline(admin.TabularInline):
    model = CompetitionCoach
    extra = 0


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'location', 'type', 'status')
    list_filter = ('type', 'status')
    search_fields = ('name', 'location')
    inlines = [ResultInline, CompetitionAthleteInline, CompetitionCoachInline]


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'competition', 'score', 'position')
    list_filter = ('competition',)


@admin.register(CompetitionAthlete)
class CompetitionAthleteAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'competition', 'status')
    list_filter = ('status',)


@admin.register(CompetitionCoach)
class CompetitionCoachAdmin(admin.ModelAdmin):
    list_display = ('staff_member', 'competition')
