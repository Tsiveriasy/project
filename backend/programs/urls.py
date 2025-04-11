from django.urls import path
from .views import (
    ProgramListView,
    ProgramDetailView,
    ProgramCreateView,
    ProgramUpdateView,
    ProgramDeleteView,
)

urlpatterns = [
    path('', ProgramListView.as_view(), name='program-list'),
    path('<int:pk>/', ProgramDetailView.as_view(), name='program-detail'),
    path('create/', ProgramCreateView.as_view(), name='program-create'),
    path('<int:pk>/update/', ProgramUpdateView.as_view(), name='program-update'),
    path('<int:pk>/delete/', ProgramDeleteView.as_view(), name='program-delete'),
]