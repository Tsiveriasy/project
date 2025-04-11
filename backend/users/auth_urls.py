from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, ProfileUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
]
