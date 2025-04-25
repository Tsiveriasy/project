from django.urls import path
from .views import (
    RegisterView, LoginView, UserProfileView, ProfileUpdateView,
    SavedProgramsView, SavedUniversitiesView, SavedItemsView,
    SavedProgramDetailView, SavedUniversityDetailView, TranscriptFileUploadView,
    TranscriptFileDeleteView
)

app_name = 'users'

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    # Saved items endpoints
    path('auth/profile/saved-items/', SavedItemsView.as_view(), name='saved-items'),
    path('auth/profile/saved-programs/', SavedProgramsView.as_view(), name='saved-programs'),
    path('auth/profile/saved-programs/<int:pk>/', SavedProgramDetailView.as_view(), name='saved-program-detail'),
    path('auth/profile/saved-universities/', SavedUniversitiesView.as_view(), name='saved-universities'),
    path('auth/profile/saved-universities/<int:pk>/', SavedUniversityDetailView.as_view(), name='saved-university-detail'),
    # Transcript file endpoints
    path('auth/profile/transcript-upload/', TranscriptFileUploadView.as_view(), name='transcript-upload'),
    path('auth/profile/transcript-delete/', TranscriptFileDeleteView.as_view(), name='transcript-delete'),
]