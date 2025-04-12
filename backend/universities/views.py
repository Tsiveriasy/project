from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q, Prefetch
from .models import University
from programs.models import Program
from .serializers import UniversitySerializer, UniversityListSerializer
from users.permissions import IsAdminUser
import logging

logger = logging.getLogger(__name__)

class UniversityListView(generics.ListAPIView):
    serializer_class = UniversityListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        try:
            queryset = University.objects.all().prefetch_related('programs')
            
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
            
        except Exception as e:
            logger.error(f"Error in UniversityListView.get_queryset: {e}")
            return University.objects.none()

class UniversityDetailView(generics.RetrieveAPIView):
    serializer_class = UniversitySerializer
    permission_classes = [permissions.AllowAny]
    queryset = University.objects.all()
    
    def get_object(self):
        try:
            instance = super().get_object()
            return instance
        except University.DoesNotExist:
            logger.warning(f"University not found with id: {self.kwargs.get('pk')}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving university: {e}")
            raise
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except University.DoesNotExist:
            return Response(
                {"error": "L'université demandée n'existe pas"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in UniversityDetailView.retrieve: {e}")
            return Response(
                {"error": "Une erreur s'est produite lors de la récupération des détails"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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