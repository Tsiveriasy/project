from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from programs.models import Program
from universities.models import University

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not name:
            raise ValueError('Users must have a name')

        user = self.model(
            email=self.normalize_email(email),
            name=name,
            username=email  # Use email as username
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(
            email=email,
            name=name,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.save(using=self._db)
        return user

class User(AbstractUser):
    username = models.CharField(max_length=255, unique=True, default='')  # Add default value
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    saved_programs = models.ManyToManyField(Program, related_name='saved_by_users', blank=True)
    saved_universities = models.ManyToManyField(University, related_name='saved_by_users', blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)
    interests = models.JSONField(default=list, blank=True, null=True)
    education_level = models.CharField(max_length=100, blank=True, null=True)
    current_university = models.CharField(max_length=200, blank=True, null=True)
    academic_records = models.JSONField(default=list, blank=True, null=True)
    transcript_files = models.JSONField(default=list, blank=True, null=True)  # Pour stocker les métadonnées des fichiers

    def __str__(self):
        return f"Profile for {self.user.email}"