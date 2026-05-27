from django.contrib import admin
from .models import Athlete


@admin.register(Athlete)
class AthleteAdmin(admin.ModelAdmin):
    list_display = ('name', 'age', 'level', 'status', 'coach', 'created_at')
    list_filter = ('level', 'status')
    search_fields = ('name', 'category')
