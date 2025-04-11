from rest_framework import generics, permissions
from .models import Program
from .serializers import ProgramSerializer, ProgramListSerializer
from users.permissions import IsAdminUser

class ProgramListView(generics.ListAPIView):
    serializer_class = ProgramListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Program.objects.all()
        
        # Filter by university
        university_id = self.request.query_params.get('university', None)
        if university_id:
            queryset = queryset.filter(university_id=university_id)
        
        # Filter by level
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(degree_level=level)
        
        # Filter by language
        language = self.request.query_params.get('language', None)
        if language:
            queryset = queryset.filter(language=language)
        
        # Filter by duration
        duration = self.request.query_params.get('duration', None)
        if duration:
            queryset = queryset.filter(duration__icontains=duration)
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Sort
        sort_by = self.request.query_params.get('sort_by', None)
        if sort_by == 'name_asc':
            queryset = queryset.order_by('name')
        elif sort_by == 'name_desc':
            queryset = queryset.order_by('-name')
        elif sort_by == 'tuition_fees':
            queryset = queryset.order_by('tuition_fees')
        
        return queryset

class ProgramDetailView(generics.RetrieveAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProgramCreateView(generics.CreateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAdminUser]

class ProgramUpdateView(generics.UpdateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAdminUser]

class ProgramDeleteView(generics.DestroyAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAdminUser]