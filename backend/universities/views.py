from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import University
from .serializers import UniversitySerializer, UniversityListSerializer
from users.permissions import IsAdminUser

class UniversityListView(generics.ListAPIView):
    serializer_class = UniversityListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = University.objects.all()
        
        # Search
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(location__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Filter by type
        uni_type = self.request.query_params.get('type')
        if uni_type:
            queryset = queryset.filter(type=uni_type)
        
        # Filter by location
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by rating
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))
        
        # Sort
        ordering = self.request.query_params.get('ordering', 'name')
        if ordering:
            if ordering.startswith('-'):
                field = ordering[1:]
                queryset = queryset.order_by(f'-{field}')
            else:
                queryset = queryset.order_by(ordering)
        
        return queryset

class UniversityDetailView(generics.RetrieveAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.AllowAny]

class UniversityCreateView(generics.CreateAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAdminUser]

class UniversityUpdateView(generics.UpdateAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAdminUser]

class UniversityDeleteView(generics.DestroyAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAdminUser]