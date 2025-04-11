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
import traceback
import json

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
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            print("Error updating profile:", str(e))
            return Response(
                {"detail": "Une erreur est survenue lors de la mise à jour du profil."},
                status=status.HTTP_400_BAD_REQUEST
            )