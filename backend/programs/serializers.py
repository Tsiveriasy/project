from rest_framework import serializers
from .models import Program

class ProgramSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'university', 'university_name', 'description',
            'duration', 'degree_level', 'admission_requirements',
            'tuition_fees', 'language', 'created_at', 'updated_at'
        ]

class ProgramListSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'university_name', 'degree_level',
            'duration', 'tuition_fees', 'language'
        ]