#!/usr/bin/env python
"""
Script to set up initial data for the orientation platform.
Run this after migrations to populate the database with sample data.
"""
import os
import django
import random
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'orientation_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from universities.models import University
from programs.models import Program
from orientation_tests.models import Question, Option

User = get_user_model()

def create_universities():
    """Create sample universities with rich data"""
    universities_data = [
        {
            'name': 'Université Paris-Sorbonne',
            'location': 'Paris, France',
            'type': 'public',
            'description': 'Une des plus anciennes et prestigieuses universités de France, spécialisée dans les lettres, langues, arts et sciences humaines. Reconnue mondialement pour son excellence académique et sa recherche innovante.',
            'website': 'http://www.sorbonne-universite.fr',
            'rating': 4.7,
            'student_count': '45,000+',
            'specialties': ['Lettres', 'Sciences humaines', 'Arts', 'Langues', 'Histoire'],
            'facilities': ['Bibliothèque historique', 'Laboratoires de recherche', 'Centre culturel', 'Salles de conférence'],
            'research_focus': ['Littérature comparée', 'Histoire médiévale', 'Linguistique', 'Philosophie'],
            'international_partnerships': ['Oxford University', 'Harvard University', 'Heidelberg University'],
            'employment_rate': 92.5,
            'image': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
            'name': 'École Polytechnique',
            'location': 'Palaiseau, France',
            'type': 'engineering',
            'description': 'Grande école d\'ingénieurs française de renommée internationale, formant des ingénieurs de haut niveau scientifique. Leader en recherche appliquée et innovation technologique.',
            'website': 'https://www.polytechnique.edu',
            'rating': 4.8,
            'student_count': '3,000+',
            'specialties': ['Mathématiques', 'Physique', 'Informatique', 'Mécanique', 'Robotique'],
            'facilities': ['Laboratoires high-tech', 'Centre de calcul', 'Incubateur de startups', 'Centre sportif'],
            'research_focus': ['Intelligence artificielle', 'Énergie durable', 'Nanotechnologies', 'Quantum computing'],
            'international_partnerships': ['MIT', 'Stanford University', 'ETH Zürich'],
            'employment_rate': 98.3,
            'image': 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
            'name': 'HEC Paris',
            'location': 'Jouy-en-Josas, France',
            'type': 'business',
            'description': 'École de commerce de renommée mondiale, formant les futurs leaders du monde des affaires. Excellence en management, entrepreneuriat et innovation.',
            'website': 'https://www.hec.edu',
            'rating': 4.9,
            'student_count': '4,500+',
            'specialties': ['Management', 'Finance', 'Marketing', 'Entrepreneuriat', 'Stratégie'],
            'facilities': ['Trading room', 'Innovation lab', 'Business incubator', 'Career center'],
            'research_focus': ['Digital transformation', 'Sustainable business', 'Leadership', 'Global markets'],
            'international_partnerships': ['London Business School', 'Yale School of Management', 'CEIBS'],
            'employment_rate': 98.9,
            'image': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
            'name': 'Sciences Po Paris',
            'location': 'Paris, France',
            'type': 'grande_ecole',
            'description': 'Institution spécialisée dans les sciences politiques, les relations internationales et les sciences sociales. Formation d\'excellence pour les futurs décideurs.',
            'website': 'https://www.sciencespo.fr',
            'rating': 4.6,
            'student_count': '14,000+',
            'specialties': ['Sciences politiques', 'Relations internationales', 'Économie', 'Droit public'],
            'facilities': ['Bibliothèque de recherche', 'Centre de débats', 'Salles de conférence', 'Espaces collaboratifs'],
            'research_focus': ['Politique internationale', 'Développement durable', 'Démocratie', 'Innovation sociale'],
            'international_partnerships': ['Columbia University', 'LSE', 'Freie Universität Berlin'],
            'employment_rate': 95.7,
            'image': 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
            'name': 'Université de Lyon',
            'location': 'Lyon, France',
            'type': 'public',
            'description': 'Pôle universitaire majeur en France, regroupant plusieurs établissements d\'enseignement supérieur. Excellence en recherche et innovation.',
            'website': 'https://www.universite-lyon.fr',
            'rating': 4.5,
            'student_count': '35,000+',
            'specialties': ['Sciences', 'Médecine', 'Ingénierie', 'Sciences humaines'],
            'facilities': ['Campus innovant', 'Centres de recherche', 'Bibliothèques modernes', 'Laboratoires'],
            'research_focus': ['Santé globale', 'Matériaux avancés', 'Humanités numériques', 'Environnement'],
            'international_partnerships': ['University of Tokyo', 'University of Montreal', 'TU Munich'],
            'employment_rate': 91.2,
            'image': 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
    ]
    
    for uni_data in universities_data:
        if not University.objects.filter(name=uni_data['name']).exists():
            University.objects.create(**uni_data)
            print(f"Created university: {uni_data['name']}")

if __name__ == '__main__':
    print("Setting up initial data...")
    create_universities()
    print("Setup complete!")