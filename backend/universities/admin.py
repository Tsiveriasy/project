from django.contrib import admin
from .models import University

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'type', 'rating')
    list_filter = ('type', 'location')
    search_fields = ('name', 'location')