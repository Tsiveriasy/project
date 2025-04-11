from rest_framework import generics, permissions
from .models import Question, TestResult
from .serializers import QuestionSerializer, TestResultSerializer, TestSubmitSerializer
from users.permissions import IsOwnerOrAdmin

class QuestionListView(generics.ListAPIView):
    queryset = Question.objects.all().prefetch_related('options')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class TestResultCreateView(generics.CreateAPIView):
    queryset = TestResult.objects.all()
    serializer_class = TestSubmitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TestResultDetailView(generics.RetrieveAPIView):
    queryset = TestResult.objects.all().prefetch_related('recommendations')
    serializer_class = TestResultSerializer
    permission_classes = [IsOwnerOrAdmin]

class UserTestResultsView(generics.ListAPIView):
    serializer_class = TestResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TestResult.objects.filter(user=self.request.user).prefetch_related('recommendations')