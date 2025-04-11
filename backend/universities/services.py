from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import F
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class UniversitySearchService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
    
    def search_universities(self, query=None, filters=None, user_preferences=None):
        from .models import University
        queryset = University.objects.all()
        
        if query:
            # Create search query
            search_query = SearchQuery(query, config='french')
            queryset = queryset.filter(search_vector=search_query)
            queryset = queryset.annotate(rank=SearchRank(F('search_vector'), search_query))
            queryset = queryset.order_by('-rank')
        
        if filters:
            if filters.get('type'):
                queryset = queryset.filter(type__in=filters['type'])
            if filters.get('location'):
                queryset = queryset.filter(location__icontains=filters['location'])
            if filters.get('min_rating'):
                queryset = queryset.filter(rating__gte=filters['min_rating'])
        
        # Apply AI-based recommendations if user preferences are provided
        if user_preferences:
            universities = list(queryset)
            scores = [uni.calculate_recommendation_score(user_preferences) for uni in universities]
            
            # Sort by recommendation score
            universities_with_scores = list(zip(universities, scores))
            universities_with_scores.sort(key=lambda x: x[1], reverse=True)
            
            return [uni for uni, score in universities_with_scores]
        
        return queryset
    
    def get_similar_universities(self, university_id):
        from .models import University
        
        # Get all universities
        universities = University.objects.all()
        
        # Create feature vectors from descriptions
        descriptions = [uni.description for uni in universities]
        tfidf_matrix = self.vectorizer.fit_transform(descriptions)
        
        # Calculate similarity scores
        cosine_similarities = cosine_similarity(tfidf_matrix)
        
        # Get index of target university
        target_idx = next(i for i, uni in enumerate(universities) if uni.id == university_id)
        
        # Get similar universities indices
        similar_indices = cosine_similarities[target_idx].argsort()[::-1][1:6]  # Top 5 similar
        
        return [universities[idx] for idx in similar_indices]
    
    def get_personalized_recommendations(self, user):
        """
        Get personalized university recommendations based on user profile and behavior
        """
        from .models import University
        
        # Extract user preferences
        user_preferences = {
            'interests': user.profile.interests,
            'preferred_location': user.profile.location,
            'international_focus': True if 'international' in user.profile.interests else False
        }
        
        # Get all universities and calculate recommendation scores
        universities = University.objects.all()
        recommendations = []
        
        for university in universities:
            score = university.calculate_recommendation_score(user_preferences)
            recommendations.append((university, score))
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return [uni for uni, score in recommendations[:10]]  # Return top 10