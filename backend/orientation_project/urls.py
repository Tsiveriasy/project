"""
URL configuration for orientation_project project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.auth_urls')),
    path('api/users/', include('users.urls')),
    path('api/universities/', include('universities.urls')),
    path('api/programs/', include('programs.urls')),
    path('api/orientation-tests/', include('orientation_tests.urls')),
    path('api/search/', include('search.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)