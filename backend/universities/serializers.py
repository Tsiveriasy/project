from rest_framework import serializers
from .models import University
from programs.serializers import ProgramDetailSerializer
import logging

logger = logging.getLogger(__name__)

class UniversityListSerializer(serializers.ModelSerializer):
    program_count = serializers.SerializerMethodField()
    rating = serializers.FloatField(default=0.0)
    
    class Meta:
        model = University
        fields = [
            'id', 'name', 'location', 'type', 'image', 
            'rating', 'student_count', 'program_count'
        ]
    
    def get_program_count(self, obj):
        try:
            return obj.programs.count()
        except Exception as e:
            logger.error(f"Error getting program count: {e}")
            return 0
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # S'assurer que rating est un nombre
        try:
            data['rating'] = float(data['rating']) if data['rating'] is not None else 0.0
        except (TypeError, ValueError):
            data['rating'] = 0.0
        return data

class UniversitySerializer(serializers.ModelSerializer):
    program_count = serializers.SerializerMethodField()
    programs = ProgramDetailSerializer(many=True, read_only=True)
    programs_by_level = serializers.SerializerMethodField()
    rating = serializers.FloatField(default=0.0)
    
    class Meta:
        model = University
        fields = [
            'id', 'name', 'location', 'type', 'description', 
            'image', 'website', 'rating', 'student_count', 
            'specialties', 'facilities', 'research_focus',
            'international_partnerships', 'employment_rate',
            'program_count', 'admission_requirements', 
            'academic_calendar', 'contact_info',
            'programs', 'programs_by_level'
        ]
    
    def get_program_count(self, obj):
        try:
            return obj.programs.count()
        except Exception as e:
            logger.error(f"Error getting program count: {e}")
            return 0
    
    def get_programs_by_level(self, obj):
        try:
            programs = obj.programs.all()
            result = {}
            
            for program in programs:
                level = program.degree_level or 'other'
                if level not in result:
                    result[level] = []
                
                serializer = ProgramDetailSerializer(program)
                result[level].append(serializer.data)
            
            return result
        except Exception as e:
            logger.error(f"Error grouping programs by level: {e}")
            return {}
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # S'assurer que rating est un nombre
        try:
            data['rating'] = float(data['rating']) if data['rating'] is not None else 0.0
        except (TypeError, ValueError):
            data['rating'] = 0.0
        return data