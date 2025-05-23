from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class CourseSerializer(serializers.Serializer):
    name = serializers.CharField()
    grade = serializers.CharField()
    credits = serializers.IntegerField()

class AcademicRecordSerializer(serializers.Serializer):
    year = serializers.CharField()
    semester = serializers.CharField()
    gpa = serializers.FloatField()
    courses = CourseSerializer(many=True)

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class ProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    academic_records = AcademicRecordSerializer(many=True, required=False)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'phone', 'address', 'bio', 'interests', 
                 'education_level', 'current_university', 'academic_records', 'transcript_files')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get('academic_records'):
            ret['academic_records'] = []
        if not ret.get('transcript_files'):
            ret['transcript_files'] = []
        return ret

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    saved_programs = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    saved_universities = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_admin', 'date_joined', 'profile', 'saved_universities', 'saved_programs']
        read_only_fields = ['is_admin']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Séparer le nom complet en prénom et nom
        name_parts = instance.name.split(' ', 1) if instance.name else ['', '']
        ret['first_name'] = name_parts[0]
        ret['last_name'] = name_parts[1] if len(name_parts) > 1 else ''
        return ret

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Récupérer first_name et last_name des données validées
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        
        # Si l'un des deux est fourni, mettre à jour le nom complet
        if first_name is not None or last_name is not None:
            current_name_parts = instance.name.split(' ', 1) if instance.name else ['', '']
            new_first_name = first_name if first_name is not None else current_name_parts[0]
            new_last_name = last_name if last_name is not None else (current_name_parts[1] if len(current_name_parts) > 1 else '')
            instance.name = f"{new_first_name} {new_last_name}".strip()
            
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create profile
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    def validate_email(self, value):
        print(f"Validation de l'email: {value}")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Cette adresse email est déjà utilisée.')
        return value

    def validate(self, data):
        print(f"Validation des données: {data}")
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError({
                'password_confirmation': ['Les mots de passe ne correspondent pas.']
            })
        return data

    def create(self, validated_data):
        try:
            print(f"Création de l'utilisateur avec les données: {validated_data}")
            # Supprimer password_confirmation
            validated_data.pop('password_confirmation')
            
            # Créer l'utilisateur sans créer de profil
            user = User.objects.create_user(
                email=validated_data['email'],
                name=validated_data['name'],
                password=validated_data['password']
            )
            print(f"Utilisateur créé avec succès: {user}")
            return user
        except Exception as e:
            print("Erreur lors de la création de l'utilisateur:", str(e))
            print("Traceback:", traceback.format_exc())
            raise

    def to_representation(self, instance):
        try:
            print(f"Sérialisation de l'utilisateur: {instance}")
            # Ne pas utiliser RefreshToken ici, laissons la vue s'en charger
            return UserSerializer(instance).data
        except Exception as e:
            print("Erreur lors de la sérialisation:", str(e))
            print("Traceback:", traceback.format_exc())
            raise

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError('Ce compte a été désactivé.')
                return data
            raise serializers.ValidationError('Email ou mot de passe incorrect.')
        raise serializers.ValidationError('Email et mot de passe requis.')