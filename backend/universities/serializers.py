from rest_framework import serializers
from .models import University
from programs.serializers import ProgramListSerializer

class UniversityListSerializer(serializers.ModelSerializer):
    program_count = serializers.IntegerField(read_only=True)
    rating = serializers.FloatField()
    
    class Meta:
        model = University
        fields = [
            'id', 'name', 'location', 'type', 'image', 
            'rating', 'student_count', 'program_count'
        ]

class UniversitySerializer(serializers.ModelSerializer):
    program_count = serializers.IntegerField(read_only=True)
    rating = serializers.FloatField()
    programs = ProgramListSerializer(many=True, read_only=True, source='program_set')
    
    class Meta:
        model = University
        fields = [
            'id', 'name', 'location', 'type', 'description', 
            'image', 'website', 'rating', 'student_count', 
            'specialties', 'facilities', 'research_focus',
            'international_partnerships', 'employment_rate',
            'program_count', 'created_at', 'updated_at',
            'admission_requirements', 'academic_calendar', 'contact_info',
            'programs'
        ]