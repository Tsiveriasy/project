from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ProfileSerializer
)
from .models import Profile
from programs.models import Program
from universities.models import University
from programs.serializers import ProgramSerializer
from universities.serializers import UniversitySerializer
import traceback
import json
from django.http import JsonResponse
import os
import uuid
import base64
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from django.conf import settings

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        try:
            print("Données reçues:", request.data)
            # Convertir les données en dict si ce n'est pas déjà le cas
            data = request.data
            if hasattr(data, '_mutable'):
                data = data.dict()
            
            serializer = self.serializer_class(data=data)
            if not serializer.is_valid():
                print("Erreurs de validation:", serializer.errors)
                return Response({
                    'detail': 'Erreur de validation',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            print("Données validées:", serializer.validated_data)
            
            # Transaction atomique pour créer l'utilisateur et son profil
            try:
                # Créer l'utilisateur
                user = serializer.save()
                print("Utilisateur créé:", user)
                
                # Vérifier si le profil existe, sinon le créer
                try:
                    profile = user.profile
                    print("Profil existant:", profile)
                except Profile.DoesNotExist:
                    profile = Profile.objects.create(user=user)
                    print("Profil créé:", profile)
                
                # Créer le token manuellement
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                print("Erreur lors de la création de l'utilisateur ou du profil:", str(e))
                print("Traceback:", traceback.format_exc())
                return Response({
                    'detail': 'Une erreur est survenue lors de la création du compte',
                    'errors': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except ValidationError as e:
            print("Erreur de validation:", e.detail)
            return Response({
                'detail': 'Erreur de validation',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print("Erreur inattendue:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({
                'detail': 'Une erreur est survenue lors de l\'inscription',
                'errors': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            if not serializer.is_valid():
                print("Erreurs de validation:", serializer.errors)
                return Response({
                    'detail': 'Erreur de validation',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            
            if not user:
                return Response({
                    'detail': 'Email ou mot de passe incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except ValidationError as e:
            print("Erreur de validation:", e.detail)
            return Response({
                'detail': 'Erreur de validation',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print("Erreur inattendue:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({
                'detail': 'Une erreur est survenue lors de la connexion',
                'errors': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'put']

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            print("ProfileUpdateView - Données reçues:", request.data)
            
            # Traitement direct du profil si nécessaire
            profile_data = request.data.get('profile', {})
            print("ProfileUpdateView - Données de profil extraites:", profile_data)
            
            # Mise à jour directe du profil avant la sérialisation
            if profile_data:
                profile = instance.profile
                print("ProfileUpdateView - Profil actuel:", {
                    'phone': profile.phone,
                    'address': profile.address,
                    'bio': profile.bio,
                    'interests': profile.interests,
                    'education_level': profile.education_level,
                    'current_university': profile.current_university,
                    'academic_records': profile.academic_records
                })
                
                # Mettre à jour chaque champ du profil s'il est présent dans les données reçues
                if 'phone' in profile_data:
                    profile.phone = profile_data['phone']
                if 'address' in profile_data:
                    profile.address = profile_data['address']
                if 'bio' in profile_data:
                    profile.bio = profile_data['bio']
                if 'interests' in profile_data:
                    profile.interests = profile_data['interests']
                if 'education_level' in profile_data:
                    profile.education_level = profile_data['education_level']
                if 'current_university' in profile_data:
                    profile.current_university = profile_data['current_university']
                if 'academic_records' in profile_data:
                    profile.academic_records = profile_data['academic_records']
                
                # Sauvegarder le profil
                profile.save()
                print("ProfileUpdateView - Profil mis à jour:", {
                    'phone': profile.phone,
                    'address': profile.address,
                    'bio': profile.bio,
                    'interests': profile.interests,
                    'education_level': profile.education_level,
                    'current_university': profile.current_university,
                    'academic_records': profile.academic_records
                })
            
            # Procéder à la mise à jour normale de l'utilisateur
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            # Actualiser le sérialiseur avec les données mises à jour
            updated_instance = self.get_object()
            updated_serializer = self.get_serializer(updated_instance)
            
            print("ProfileUpdateView - Données de retour:", updated_serializer.data)
            return Response(updated_serializer.data)
        except Exception as e:
            print("Error updating profile:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"detail": "Une erreur est survenue lors de la mise à jour du profil."},
                status=status.HTTP_400_BAD_REQUEST
            )

class SavedItemsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        saved_programs = user.saved_programs.all() if hasattr(user, 'saved_programs') else []
        saved_universities = user.saved_universities.all() if hasattr(user, 'saved_universities') else []
        
        return Response({
            'saved_programs': ProgramSerializer(saved_programs, many=True).data,
            'saved_universities': UniversitySerializer(saved_universities, many=True).data
        })

class SavedProgramsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        saved_programs = user.saved_programs.all()
        return Response(ProgramSerializer(saved_programs, many=True).data)

    def post(self, request):
        user = request.user
        program_id = request.data.get('program_id')
        if not program_id:
            return Response({'error': 'program_id is required'}, status=400)
        
        try:
            program = Program.objects.get(id=program_id)
            user.saved_programs.add(program)
            return Response({'message': 'Program saved successfully'})
        except Program.DoesNotExist:
            return Response({'error': 'Program not found'}, status=404)

class SavedProgramDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        user = request.user
        try:
            program = Program.objects.get(id=pk)
            user.saved_programs.remove(program)
            return Response({'message': 'Program removed from saved items'})
        except Program.DoesNotExist:
            return Response({'error': 'Program not found'}, status=404)

class SavedUniversitiesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        saved_universities = user.saved_universities.all()
        return Response(UniversitySerializer(saved_universities, many=True).data)

    def post(self, request):
        user = request.user
        university_id = request.data.get('university_id')
        if not university_id:
            return Response({'error': 'university_id is required'}, status=400)
        
        try:
            university = University.objects.get(id=university_id)
            user.saved_universities.add(university)
            return Response({'message': 'University saved successfully'})
        except University.DoesNotExist:
            return Response({'error': 'University not found'}, status=404)

class SavedUniversityDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        user = request.user
        try:
            university = University.objects.get(id=pk)
            user.saved_universities.remove(university)
            return Response({'message': 'University removed from saved items'})
        except University.DoesNotExist:
            return Response({'error': 'University not found'}, status=404)

class TranscriptFileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Vérifier si un fichier est présent dans la requête
            if 'file' not in request.data:
                return Response({'error': 'Aucun fichier n\'a été fourni'}, status=400)
            
            # Récupérer le fichier
            file = request.data['file']
            file_name = file.name
            file_type = file.content_type
            file_size = file.size
            
            # Générer un nom unique pour le fichier
            unique_filename = f"{uuid.uuid4().hex}_{file_name}"
            
            # Définir le chemin de sauvegarde relatif
            relative_save_path = f'transcripts/{request.user.id}/{unique_filename}'
            
            # Chemin complet pour la sauvegarde
            save_path = os.path.join(settings.MEDIA_ROOT, relative_save_path)
            
            # Créer le dossier s'il n'existe pas
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            # Sauvegarder le fichier manuellement
            with open(save_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            # Construire l'URL complète accessible depuis le frontend
            # Utilisez le protocole et le domaine de la requête
            protocol = 'https' if request.is_secure() else 'http'
            host = request.get_host()
            file_url = f"{protocol}://{host}{settings.MEDIA_URL}{relative_save_path}"
            
            print(f"Fichier sauvegardé: {save_path}")
            print(f"URL du fichier: {file_url}")
            
            # Créer une entrée pour le fichier
            file_entry = {
                'name': file_name,
                'type': file_type,
                'size': file_size,
                'url': file_url,
                'uploaded_at': timezone.now().isoformat(),
            }
            
            # Récupérer le profil de l'utilisateur
            profile = request.user.profile
            
            # Ajouter le fichier à la liste des fichiers de relevé de notes
            if not profile.transcript_files:
                profile.transcript_files = []
            
            profile.transcript_files.append(file_entry)
            profile.save()
            
            return Response({
                'message': 'Fichier téléchargé avec succès',
                'file': file_entry
            })
            
        except Exception as e:
            print("Error uploading transcript file:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({
                'error': 'Une erreur est survenue lors du téléchargement du fichier',
                'detail': str(e)
            }, status=500)

class TranscriptFileDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        try:
            # Vérifier si un file_url est fourni
            file_url = request.data.get('file_url')
            if not file_url:
                return Response({'error': 'URL du fichier requise'}, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"Demande de suppression du fichier: {file_url}")
            
            # Récupérer le profil de l'utilisateur
            profile = request.user.profile
            
            # Vérifier si le profil a des fichiers de relevés
            if not profile.transcript_files:
                return Response({'error': 'Aucun fichier de relevé trouvé'}, status=status.HTTP_404_NOT_FOUND)
            
            # Trouver le fichier dans la liste
            file_found = False
            updated_files = []
            file_to_delete = None
            
            for file_entry in profile.transcript_files:
                if file_entry.get('url') == file_url:
                    file_found = True
                    file_to_delete = file_entry
                else:
                    updated_files.append(file_entry)
            
            if not file_found:
                return Response({'error': 'Fichier non trouvé dans les relevés'}, status=status.HTTP_404_NOT_FOUND)
            
            # Extraire le chemin relatif du fichier depuis l'URL
            # L'URL est de la forme: http://host/media/transcripts/user_id/filename
            try:
                media_url = settings.MEDIA_URL
                if media_url.endswith('/'):
                    media_url = media_url[:-1]
                
                # Trouver la position de MEDIA_URL dans l'URL
                media_pos = file_url.find(media_url)
                if media_pos >= 0:
                    relative_path = file_url[media_pos + len(media_url):]
                    if relative_path.startswith('/'):
                        relative_path = relative_path[1:]
                    
                    # Chemin complet du fichier
                    file_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                    
                    print(f"Tentative de suppression du fichier: {file_path}")
                    
                    # Supprimer le fichier du système de fichiers s'il existe
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        print(f"Fichier supprimé: {file_path}")
                    else:
                        print(f"Le fichier n'existe pas sur le disque: {file_path}")
            except Exception as e:
                print(f"Erreur lors de la suppression du fichier: {str(e)}")
                # Continuer même si la suppression physique échoue
            
            # Mettre à jour la liste des fichiers dans le profil
            profile.transcript_files = updated_files
            profile.save()
            
            return Response({
                'message': 'Fichier supprimé avec succès',
                'deleted_file': file_to_delete,
                'remaining_files': updated_files
            })
            
        except Exception as e:
            print("Error deleting transcript file:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({
                'error': 'Une erreur est survenue lors de la suppression du fichier',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    # Données de test pour les relevés de notes
    academic_records = [
        {
            "year": "2024-2025",
            "semester": "Semestre 1",
            "gpa": 15.5,
            "courses": [
                {"name": "Mathématiques", "grade": "16", "credits": 6},
                {"name": "Physique", "grade": "15", "credits": 4},
                {"name": "Informatique", "grade": "17", "credits": 6},
                {"name": "Anglais", "grade": "14", "credits": 2},
                {"name": "Communication", "grade": "15", "credits": 2},
            ]
        },
        {
            "year": "2024-2025",
            "semester": "Semestre 2",
            "gpa": 16.0,
            "courses": [
                {"name": "Algorithmique", "grade": "17", "credits": 6},
                {"name": "Base de données", "grade": "16", "credits": 4},
                {"name": "Réseaux", "grade": "15", "credits": 4},
                {"name": "Programmation Web", "grade": "16", "credits": 4},
                {"name": "Projet", "grade": "16", "credits": 2},
            ]
        }
    ]

    # Récupérer ou créer le profil utilisateur
    profile, created = Profile.objects.get_or_create(user=request.user)
    
    # Mettre à jour les relevés de notes dans le profil
    profile.academic_records = academic_records
    profile.save()

    # Construire la réponse
    response_data = {
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "firstName": request.user.first_name,
        "lastName": request.user.last_name,
        "role": "admin" if request.user.is_staff else "student",
        "profile": {
            "phone": profile.phone,
            "address": profile.address,
            "bio": profile.bio,
            "interests": profile.interests,
            "education_level": profile.education_level,
            "current_university": profile.current_university,
            "academic_records": profile.academic_records,
        },
        "saved_programs": [program.id for program in profile.saved_programs.all()],
        "saved_universities": [univ.id for univ in profile.saved_universities.all()],
    }

    return JsonResponse(response_data)