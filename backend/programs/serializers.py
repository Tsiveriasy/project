from rest_framework import serializers
from .models import Program
import json

class ProgramListSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'university_name', 'degree_level',
            'duration', 'tuition_fees', 'language'
        ]

class ProgramSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'university', 'university_name', 'description',
            'duration', 'degree_level', 'admission_requirements',
            'tuition_fees', 'language', 'created_at', 'updated_at'
        ]

class ProgramDetailSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    admission_requirements = serializers.JSONField(required=False)
    degree_level_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'university', 'university_name', 'description',
            'duration', 'degree_level', 'degree_level_display', 'admission_requirements', 'objectives',
            'tuition_fees', 'language', 'career_opportunities', 'prerequisites',
            'teaching_methods', 'evaluation_methods', 'internship_opportunities',
            'research_opportunities', 'student_life', 'facilities',
            'created_at', 'updated_at'
        ]
        
    def to_representation(self, instance):
        """
        Personnaliser la représentation des données pour une meilleure structure
        """
        data = super().to_representation(instance)
        
        # Structurer les conditions d'admission
        if data.get('admission_requirements'):
            requirements = data['admission_requirements']
            if isinstance(requirements, str):
                try:
                    requirements = json.loads(requirements)
                except json.JSONDecodeError:
                    requirements = {'requirements': [requirements]}
            
            if not isinstance(requirements, dict):
                requirements = {'requirements': requirements if isinstance(requirements, list) else [requirements]}
            
            data['admission_requirements'] = requirements
        
        return data
    
    def get_degree_level_display(self, obj):
        return obj.get_degree_level_display()