from django.db import models
from users.models import User

class Question(models.Model):
    text = models.CharField(max_length=500)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.text

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    
    # Fields that this option contributes to
    engineering_weight = models.IntegerField(default=0)
    science_weight = models.IntegerField(default=0)
    business_weight = models.IntegerField(default=0)
    arts_weight = models.IntegerField(default=0)
    social_weight = models.IntegerField(default=0)
    
    def __str__(self):
        return self.text

class TestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_results')
    date_taken = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField(default=dict)
    
    def __str__(self):
        return f"Test result for {self.user.name} on {self.date_taken.strftime('%Y-%m-%d')}"

class FieldRecommendation(models.Model):
    FIELD_CHOICES = (
        ('engineering', 'Ingénierie'),
        ('science', 'Sciences'),
        ('business', 'Commerce'),
        ('arts', 'Arts et Lettres'),
        ('social', 'Sciences Sociales'),
        ('law', 'Droit'),
        ('medicine', 'Médecine'),
        ('education', 'Éducation'),
    )
    
    test_result = models.ForeignKey(TestResult, on_delete=models.CASCADE, related_name='recommendations')
    field = models.CharField(max_length=20, choices=FIELD_CHOICES)
    compatibility = models.IntegerField()  # Percentage of compatibility
    
    class Meta:
        ordering = ['-compatibility']
    
    def __str__(self):
        return f"{self.field} - {self.compatibility}%"