from rest_framework import serializers
from .models import Question, Option, TestResult, FieldRecommendation

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'options']

class FieldRecommendationSerializer(serializers.ModelSerializer):
    field_display = serializers.CharField(source='get_field_display', read_only=True)
    
    class Meta:
        model = FieldRecommendation
        fields = ['field', 'field_display', 'compatibility']

class TestResultSerializer(serializers.ModelSerializer):
    recommendations = FieldRecommendationSerializer(many=True, read_only=True)
    
    class Meta:
        model = TestResult
        fields = ['id', 'date_taken', 'answers', 'recommendations']

class TestSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['answers']
    
    def create(self, validated_data):
        user = self.context['request'].user
        answers = validated_data.get('answers', {})
        
        # Create the test result
        test_result = TestResult.objects.create(
            user=user,
            answers=answers
        )
        
        # Calculate field scores based on selected options
        field_scores = {
            'engineering': 0,
            'science': 0,
            'business': 0,
            'arts': 0,
            'social': 0,
            'law': 0,
            'medicine': 0,
            'education': 0,
        }
        
        # Process each answer
        for question_id, option_id in answers.items():
            try:
                option = Option.objects.get(id=option_id)
                field_scores['engineering'] += option.engineering_weight
                field_scores['science'] += option.science_weight
                field_scores['business'] += option.business_weight
                field_scores['arts'] += option.arts_weight
                field_scores['social'] += option.social_weight
            except Option.DoesNotExist:
                pass
        
        # Normalize scores to percentages (0-100)
        max_score = max(field_scores.values()) if max(field_scores.values()) > 0 else 1
        
        # Create recommendations for top fields
        for field, score in field_scores.items():
            if score > 0:
                compatibility = int((score / max_score) * 100)
                FieldRecommendation.objects.create(
                    test_result=test_result,
                    field=field,
                    compatibility=compatibility
                )
        
        return test_result