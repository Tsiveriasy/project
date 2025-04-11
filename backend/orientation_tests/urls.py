from django.urls import path
from .views import (
    QuestionListView,
    TestResultCreateView,
    TestResultDetailView,
    UserTestResultsView,
)

urlpatterns = [
    path('questions/', QuestionListView.as_view(), name='question-list'),
    path('submit/', TestResultCreateView.as_view(), name='submit-test'),
    path('results/<int:pk>/', TestResultDetailView.as_view(), name='test-result-detail'),
    path('my-results/', UserTestResultsView.as_view(), name='user-test-results'),
]