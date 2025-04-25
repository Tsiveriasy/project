from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Prefetch
from .models import University
from programs.models import Program
from .serializers import UniversitySerializer, UniversityListSerializer
from programs.serializers import ProgramSerializer
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

class GlobalSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({
                'universities': [],
                'programs': [],
                'metadata': {
                    'filters_available': {
                        'locations': [],
                        'degree_levels': {},
                        'tuition_range': {'min': None, 'max': None}
                    }
                }
            })

        try:
            # Recherche d'universités
            universities = University.objects.filter(
                Q(name__icontains=query) |
                Q(location__icontains=query) |
                Q(description__icontains=query)
            ).prefetch_related('programs')

            # Recherche de programmes
            programs = Program.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(degree_level__icontains=query)
            ).select_related('university')

            # Récupérer les filtres disponibles
            all_locations = set(University.objects.values_list('location', flat=True).distinct())
            all_degree_levels = {
                level: level for level in 
                Program.objects.values_list('degree_level', flat=True).distinct()
            }
            tuition_range = {
                'min': Program.objects.filter(tuition_fees__isnull=False).order_by('tuition_fees').values_list('tuition_fees', flat=True).first(),
                'max': Program.objects.filter(tuition_fees__isnull=False).order_by('-tuition_fees').values_list('tuition_fees', flat=True).first()
            }

            # Appliquer les filtres si présents
            location = request.query_params.get('location')
            if location:
                universities = universities.filter(location__icontains=location)
                programs = programs.filter(university__location__icontains=location)

            degree_level = request.query_params.get('degree_level')
            if degree_level:
                programs = programs.filter(degree_level=degree_level)

            min_tuition = request.query_params.get('min_tuition')
            if min_tuition:
                programs = programs.filter(tuition_fees__gte=float(min_tuition))

            max_tuition = request.query_params.get('max_tuition')
            if max_tuition:
                programs = programs.filter(tuition_fees__lte=float(max_tuition))

            response_data = {
                'universities': UniversityListSerializer(universities[:10], many=True).data,
                'programs': ProgramSerializer(programs[:10], many=True).data,
                'metadata': {
                    'filters_available': {
                        'locations': list(all_locations),
                        'degree_levels': all_degree_levels,
                        'tuition_range': tuition_range
                    }
                }
            }

            return Response(response_data)

        except Exception as e:
            logger.error(f"Erreur lors de la recherche globale: {str(e)}")
            return Response(
                {'error': 'Une erreur est survenue lors de la recherche.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )