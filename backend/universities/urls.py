from django.urls import path
from .views import (
    UniversityListView,
    UniversityDetailView,
    UniversityCreateView,
    UniversityUpdateView,
    UniversityDeleteView,
    GlobalSearchView,
)

urlpatterns = [
    path('', UniversityListView.as_view(), name='university-list'),
    path('<int:pk>/', UniversityDetailView.as_view(), name='university-detail'),
    path('create/', UniversityCreateView.as_view(), name='university-create'),
    path('<int:pk>/update/', UniversityUpdateView.as_view(), name='university-update'),
    path('<int:pk>/delete/', UniversityDeleteView.as_view(), name='university-delete'),
    path('search/global/', GlobalSearchView.as_view(), name='global-search'),
]