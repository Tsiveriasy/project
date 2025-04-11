from django.db import models
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

class University(models.Model):
    UNIVERSITY_TYPES = (
        ('public', 'Université publique'),
        ('grande_ecole', 'Grande école'),
        ('engineering', 'École d\'ingénieur'),
        ('business', 'École de commerce'),
        ('other', 'Autre'),
    )
    
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=UNIVERSITY_TYPES)
    description = models.TextField(blank=True)
    image = models.URLField(max_length=500)
    website = models.URLField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    student_count = models.CharField(max_length=50, blank=True)
    specialties = models.JSONField(default=list)
    facilities = models.JSONField(default=list)
    research_focus = models.JSONField(default=list)
    international_partnerships = models.JSONField(default=list)
    employment_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    admission_requirements = models.JSONField(default=list)
    academic_calendar = models.JSONField(default=dict)
    contact_info = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Universities'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def program_count(self):
        return self.programs.count()
    
    def calculate_recommendation_score(self, user_preferences):
        """
        Calculate a recommendation score based on user preferences
        """
        score = 0
        
        # Base score from rating
        score += float(self.rating) * 10
        
        # Match specialties with user interests
        if user_preferences.get('interests'):
            matching_specialties = set(self.specialties) & set(user_preferences['interests'])
            score += len(matching_specialties) * 15
        
        # Location preference
        if user_preferences.get('preferred_location') and self.location.lower().find(user_preferences['preferred_location'].lower()) != -1:
            score += 20
        
        # Type preference
        if user_preferences.get('preferred_type') and self.type == user_preferences['preferred_type']:
            score += 25
        
        # Employment rate bonus
        if self.employment_rate:
            score += float(self.employment_rate)
        
        # International focus bonus
        if user_preferences.get('international_focus') and self.international_partnerships:
            score += len(self.international_partnerships) * 5
        
        return score