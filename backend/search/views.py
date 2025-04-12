from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from universities.models import University
from programs.models import Program
from universities.serializers import UniversityListSerializer
from programs.serializers import ProgramListSerializer
from .gemini_service import GeminiService
import logging
import json

logger = logging.getLogger(__name__)

class GlobalSearchView(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.gemini_service = GeminiService()

    def get(self, request):
        try:
            # Récupérer les paramètres de recherche
            query = request.query_params.get('q', '')
            min_tuition = request.query_params.get('min_tuition')
            max_tuition = request.query_params.get('max_tuition')
            degree_level = request.query_params.get('degree_level')
            location = request.query_params.get('location')

            logger.info(f"Recherche reçue - Query: {query}")

            # Recherche initiale large
            universities = self._search_universities(query, location)
            programs = self._search_programs(query, min_tuition, max_tuition, degree_level, location)

            logger.info(f"Résultats initiaux - Universités: {universities.count()}, Programmes: {programs.count()}")

            # Si aucun résultat direct n'est trouvé, effectuer une recherche élargie
            if not universities.exists() and not programs.exists():
                logger.info("Aucun résultat direct trouvé, passage à la recherche élargie")
                universities = self._expanded_university_search(query)
                programs = self._expanded_program_search(query)
                logger.info(f"Résultats élargis - Universités: {universities.count()}, Programmes: {programs.count()}")

            # Préparation des données pour Gemini
            universities_data = [
                {
                    "id": u.id,
                    "name": u.name,
                    "location": u.location,
                    "description": u.description if hasattr(u, 'description') else ''
                } for u in universities
            ]
            programs_data = [
                {
                    "id": p.id,
                    "name": p.name,
                    "degree_level": p.degree_level,
                    "tuition": getattr(p, 'tuition_fees', None) or getattr(p, 'tuition_fee', 0),
                    "description": p.description if hasattr(p, 'description') else ''
                } for p in programs
            ]

            logger.info(f"Données préparées pour Gemini - Universités: {len(universities_data)}, Programmes: {len(programs_data)}")

            # Amélioration avec Gemini
            try:
                enhanced_results = self.gemini_service.enhance_search(
                    query,
                    universities_data,
                    programs_data
                )
                logger.info(f"Réponse Gemini reçue: {json.dumps(enhanced_results, indent=2)}")
            except Exception as e:
                logger.error(f"Erreur Gemini: {str(e)}")
                enhanced_results = {
                    "analysis": "Voici les résultats qui pourraient vous intéresser.",
                    "ranked_universities": [u.id for u in universities],
                    "ranked_programs": [p.id for p in programs],
                    "suggested_filters": {
                        "degree_levels": [],
                        "locations": [],
                        "tuition_range": {"min": None, "max": None}
                    }
                }

            # Réorganiser les résultats selon le classement de Gemini
            ranked_universities = self._rank_results(universities, enhanced_results.get("ranked_universities", []))
            ranked_programs = self._rank_results(programs, enhanced_results.get("ranked_programs", []))

            logger.info(f"Résultats classés - Universités: {len(ranked_universities)}, Programmes: {len(ranked_programs)}")

            # Collecter les filtres disponibles
            filters_available = self._get_available_filters(ranked_universities, ranked_programs)
            
            # Mettre à jour les filtres suggérés
            filters_available.update({
                "suggested_filters": enhanced_results.get("suggested_filters", {
                    "degree_levels": [],
                    "locations": [],
                    "tuition_range": {"min": None, "max": None}
                })
            })

            response_data = {
                "universities": UniversityListSerializer(ranked_universities, many=True).data,
                "programs": ProgramListSerializer(ranked_programs, many=True).data,
                "metadata": {
                    "filters_available": filters_available,
                    "analysis": enhanced_results.get("analysis", "")
                }
            }

            logger.info("Réponse finale préparée avec succès")
            return Response(response_data)

        except Exception as e:
            logger.error(f"Erreur lors de la recherche: {str(e)}", exc_info=True)
            return Response(
                {"error": "Une erreur est survenue lors de la recherche."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _expanded_university_search(self, query):
        """
        Recherche élargie pour les universités en utilisant des mots-clés connexes
        """
        try:
            words = query.lower().split()
            q_objects = Q()

            # Domaines d'études courants
            domains = {
                'informatique': ['programmation', 'développement', 'logiciel', 'web', 'données', 'cybersécurité', 'jeu', 'gaming', 'intelligence artificielle', 'ia', 'ordinateur'],
                'business': ['commerce', 'gestion', 'marketing', 'finance', 'économie', 'entrepreneuriat', 'business', 'management', 'vente', 'startup'],
                'ingénierie': ['mécanique', 'électrique', 'civil', 'industriel', 'robotique', 'construction', 'automobile', 'aéronautique', 'énergie'],
                'santé': ['médecine', 'pharmacie', 'infirmier', 'biologie', 'psychologie', 'sport', 'nutrition', 'santé', 'médical'],
                'arts': ['design', 'musique', 'théâtre', 'cinéma', 'communication', 'art', 'mode', 'création', 'audiovisuel', 'média'],
                'sciences': ['mathématiques', 'physique', 'chimie', 'biologie', 'environnement', 'recherche', 'laboratoire', 'expérimentation'],
                'social': ['droit', 'sociologie', 'psychologie', 'éducation', 'enseignement', 'social', 'humanitaire', 'politique'],
                'langues': ['anglais', 'français', 'espagnol', 'allemand', 'chinois', 'japonais', 'traduction', 'interprétation'],
                'agriculture': ['agriculture', 'agronomie', 'environnement', 'écologie', 'développement durable', 'nature']
            }

            logger.info(f"Recherche élargie pour les universités - Mots: {words}")

            # Rechercher des correspondances dans les domaines
            for word in words:
                for domain, keywords in domains.items():
                    if word in keywords or any(keyword in word for keyword in keywords):
                        q_objects |= (
                            Q(name__icontains=domain) |
                            Q(description__icontains=domain) |
                            Q(specialties__icontains=domain)
                        )
                        logger.info(f"Correspondance trouvée - Mot: {word}, Domaine: {domain}")

            # Recherche générale
            q_objects |= (
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(specialties__icontains=query)
            )

            results = University.objects.filter(q_objects).distinct()
            logger.info(f"Résultats de la recherche élargie pour les universités: {results.count()}")
            return results

        except Exception as e:
            logger.error(f"Erreur dans la recherche élargie des universités: {str(e)}")
            return University.objects.none()

    def _expanded_program_search(self, query):
        """
        Recherche élargie pour les programmes en utilisant des mots-clés connexes
        """
        try:
            words = query.lower().split()
            q_objects = Q()

            # Correspondances de carrières et domaines d'études
            career_mappings = {
                'développeur': ['informatique', 'programmation', 'développement web', 'logiciel', 'application', 'jeu vidéo'],
                'médecin': ['médecine', 'santé', 'biologie', 'anatomie', 'clinique'],
                'avocat': ['droit', 'juridique', 'justice', 'légal', 'criminologie'],
                'ingénieur': ['ingénierie', 'mécanique', 'électrique', 'civil', 'robotique'],
                'artiste': ['art', 'design', 'création', 'musique', 'théâtre', 'cinéma'],
                'entrepreneur': ['business', 'gestion', 'commerce', 'startup', 'innovation'],
                'chercheur': ['sciences', 'recherche', 'laboratoire', 'innovation', 'développement'],
                'professeur': ['éducation', 'enseignement', 'pédagogie', 'formation'],
                'manager': ['management', 'gestion', 'leadership', 'administration'],
                'designer': ['design', 'création', 'ux', 'ui', 'graphisme'],
                'data scientist': ['données', 'statistiques', 'analyse', 'big data', 'machine learning'],
                'architecte': ['architecture', 'construction', 'design', 'urbanisme'],
                'journaliste': ['communication', 'média', 'journalisme', 'rédaction'],
                'marketeur': ['marketing', 'communication', 'digital', 'e-commerce'],
                'psychologue': ['psychologie', 'santé', 'thérapie', 'comportement']
            }

            logger.info(f"Recherche élargie pour les programmes - Mots: {words}")

            # Rechercher des correspondances dans les carrières
            for word in words:
                for career, fields in career_mappings.items():
                    if word in career.lower() or any(field in word for field in fields):
                        for field in fields:
                            q_objects |= (
                                Q(name__icontains=field) |
                                Q(description__icontains=field)
                            )
                        logger.info(f"Correspondance trouvée - Mot: {word}, Carrière: {career}")

            # Recherche générale
            q_objects |= (
                Q(name__icontains=query) |
                Q(description__icontains=query)
            )

            results = Program.objects.filter(q_objects).distinct()
            logger.info(f"Résultats de la recherche élargie pour les programmes: {results.count()}")
            return results

        except Exception as e:
            logger.error(f"Erreur dans la recherche élargie des programmes: {str(e)}")
            return Program.objects.none()

    def _search_universities(self, query, location=None):
        try:
            q_filter = Q(name__icontains=query) | Q(description__icontains=query)
            if location:
                q_filter &= Q(location__icontains=location)
            return University.objects.filter(q_filter)
        except Exception as e:
            logger.error(f"Erreur lors de la recherche d'universités: {str(e)}")
            return University.objects.none()

    def _search_programs(self, query, min_tuition=None, max_tuition=None, degree_level=None, location=None):
        try:
            q_filter = Q(name__icontains=query) | Q(description__icontains=query)
            
            if min_tuition:
                try:
                    q_filter &= Q(tuition_fees__gte=float(min_tuition))
                except ValueError:
                    logger.warning(f"min_tuition invalide: {min_tuition}")

            if max_tuition:
                try:
                    q_filter &= Q(tuition_fees__lte=float(max_tuition))
                except ValueError:
                    logger.warning(f"max_tuition invalide: {max_tuition}")

            if degree_level:
                q_filter &= Q(degree_level=degree_level)

            if location:
                q_filter &= Q(university__location__icontains=location)
                
            return Program.objects.filter(q_filter)
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de programmes: {str(e)}")
            return Program.objects.none()

    def _rank_results(self, queryset, ranked_ids):
        try:
            id_to_obj = {str(obj.id): obj for obj in queryset}
            ranked_results = []
            
            # D'abord ajouter les résultats classés
            for id_str in ranked_ids:
                if str(id_str) in id_to_obj:
                    ranked_results.append(id_to_obj[str(id_str)])
                    del id_to_obj[str(id_str)]
            
            # Ajouter les résultats restants à la fin
            ranked_results.extend(id_to_obj.values())
            return ranked_results
        except Exception as e:
            logger.error(f"Erreur lors du classement des résultats: {str(e)}")
            return list(queryset)

    def _get_available_filters(self, universities, programs):
        try:
            locations = set()
            degree_levels = {}
            tuition_range = {"min": None, "max": None}

            for uni in universities:
                if uni.location:
                    locations.add(uni.location)

            for prog in programs:
                if prog.degree_level:
                    degree_levels[prog.degree_level] = prog.get_degree_level_display()
                if hasattr(prog, 'tuition_fees') and prog.tuition_fees:
                    if tuition_range["min"] is None or prog.tuition_fees < tuition_range["min"]:
                        tuition_range["min"] = prog.tuition_fees
                    if tuition_range["max"] is None or prog.tuition_fees > tuition_range["max"]:
                        tuition_range["max"] = prog.tuition_fees

            return {
                "locations": sorted(list(locations)),
                "degree_levels": degree_levels,
                "tuition_range": tuition_range
            }
        except Exception as e:
            logger.error(f"Erreur lors de la collecte des filtres: {str(e)}")
            return {
                "locations": [],
                "degree_levels": {},
                "tuition_range": {"min": None, "max": None}
            }
