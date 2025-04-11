from django.contrib import admin
from .models import Program

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'degree_level', 'duration', 'language')
    list_filter = ('degree_level', 'university', 'language')
    search_fields = ('name', 'university__name', 'description')