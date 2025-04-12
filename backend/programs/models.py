from django.db import models
from universities.models import University

class Program(models.Model):
    LEVEL_CHOICES = (
        ('licence', 'Licence (Bac+3)'),
        ('master', 'Master (Bac+5)'),
        ('doctorat', 'Doctorat (Bac+8)'),
        ('bts', 'BTS'),
        ('dut', 'DUT'),
        ('ingenieur', 'Diplôme d\'Ingénieur'),
        ('other', 'Autre'),
    )
    
    FIELD_CHOICES = (
        ('science', 'Sciences'),
        ('engineering', 'Ingénierie'),
        ('business', 'Commerce'),
        ('law', 'Droit'),
        ('medicine', 'Médecine'),
        ('arts', 'Arts et Lettres'),
        ('social', 'Sciences Sociales'),
        ('education', 'Éducation'),
        ('other', 'Autre'),
    )
    
    name = models.CharField(max_length=255)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='programs')
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=50)
    degree_level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    admission_requirements = models.JSONField(default=list)
    tuition_fees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    language = models.CharField(max_length=50, default='Français')
    objectives = models.TextField(blank=True)
    prerequisites = models.TextField(blank=True)
    career_opportunities = models.TextField(blank=True)
    teaching_methods = models.TextField(blank=True)
    evaluation_methods = models.TextField(blank=True)
    internship_opportunities = models.TextField(blank=True)
    research_opportunities = models.TextField(blank=True)
    student_life = models.TextField(blank=True)
    facilities = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.university.name}"