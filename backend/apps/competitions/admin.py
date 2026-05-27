from django.contrib import admin
from .models import Competition, Result


class ResultInline(admin.TabularInline):
    model = Result
    extra = 0


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'location', 'type', 'status')
    list_filter = ('type', 'status')
    search_fields = ('name', 'location')
    inlines = [ResultInline]


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'competition', 'score', 'position')
    list_filter = ('competition',)
