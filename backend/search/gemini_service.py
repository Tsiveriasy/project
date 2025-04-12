import google.generativeai as genai
from django.conf import settings
from typing import List, Dict, Any
import json

class GeminiService:
    def __init__(self):
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
        except Exception as e:
            print(f"Erreur d'initialisation de Gemini: {str(e)}")
            self.model = None

    def enhance_search(self, query: str, universities: List[Dict], programs: List[Dict]) -> Dict[str, Any]:
        """
        Utilise Gemini pour améliorer la recherche et le classement des résultats
        """
        if not self.model:
            return self._get_default_response(universities, programs)

        try:
            # Préparer le contexte pour Gemini
            context = self._prepare_context(universities, programs)
            
            # Construire le prompt avec une meilleure analyse sémantique
            prompt = f"""
            En tant qu'assistant spécialisé dans l'orientation universitaire, analysez la requête suivante : "{query}"

            Voici les données disponibles :
            {context}

            Instructions détaillées :
            1. Analysez l'intention de recherche :
               - Identifiez les mots-clés importants et leurs synonymes
               - Déterminez les domaines d'études ou carrières possibles liés à la requête
               - Trouvez des connexions indirectes avec les programmes disponibles
               - Considérez le contexte culturel et professionnel

            2. Pour les universités :
               - Identifiez les universités qui offrent des formations pertinentes
               - Cherchez des liens entre la requête et les spécialités des universités
               - Considérez la réputation des universités dans les domaines connexes
               - Évaluez la pertinence géographique si mentionnée

            3. Pour les programmes :
               - Trouvez les programmes directement ou indirectement liés à la requête
               - Identifiez les compétences et débouchés associés
               - Considérez les passerelles possibles entre domaines
               - Évaluez la pertinence selon le niveau d'études et le budget

            4. Suggestions intelligentes :
               - Proposez des domaines d'études alternatifs mais pertinents
               - Suggérez des spécialisations connexes
               - Recommandez des combinaisons de formations complémentaires
               - Adaptez les filtres selon le contexte de la recherche

            Votre analyse doit être constructive et proposer des alternatives pertinentes même si la requête n'est pas directement liée aux études. Par exemple :
            - Pour une requête sur un métier : suggérer les formations qui y mènent
            - Pour un centre d'intérêt : proposer des domaines d'études connexes
            - Pour une compétence : identifier les programmes qui la développent
            - Pour un secteur d'activité : recommander les filières appropriées

            Répondez UNIQUEMENT avec un JSON ayant cette structure exacte :
            {{
                "analysis": "Analyse détaillée en français expliquant les liens entre la requête et les résultats proposés",
                "ranked_universities": [ids des universités par ordre de pertinence],
                "ranked_programs": [ids des programmes par ordre de pertinence],
                "suggested_filters": {{
                    "degree_levels": ["niveau1", "niveau2", ...],
                    "locations": ["ville1", "ville2", ...],
                    "tuition_range": {{
                        "min": nombre,
                        "max": nombre
                    }}
                }}
            }}

            Assurez-vous que :
            - L'analyse explique clairement les liens entre la requête et les résultats
            - Les résultats incluent toujours des suggestions pertinentes
            - Les filtres facilitent l'exploration des options proposées
            - La réponse aide l'utilisateur à découvrir des opportunités pertinentes
            """

            response = self.model.generate_content(prompt)
            if not response or not response.text:
                return self._get_default_response(universities, programs)

            # Nettoyer et valider la réponse JSON
            json_str = response.text.strip()
            if json_str.startswith('```json'):
                json_str = json_str[7:-3]
            elif json_str.startswith('```'):
                json_str = json_str[3:-3]

            enhanced_results = json.loads(json_str)
            
            # Valider la structure du JSON
            required_keys = ["analysis", "ranked_universities", "ranked_programs", "suggested_filters"]
            if not all(key in enhanced_results for key in required_keys):
                return self._get_default_response(universities, programs)

            # Valider et nettoyer les IDs
            enhanced_results["ranked_universities"] = [
                uid for uid in enhanced_results["ranked_universities"]
                if any(str(u["id"]) == str(uid) for u in universities)
            ]
            enhanced_results["ranked_programs"] = [
                pid for pid in enhanced_results["ranked_programs"]
                if any(str(p["id"]) == str(pid) for p in programs)
            ]

            # S'assurer que tous les résultats sont inclus
            all_uni_ids = {str(u["id"]) for u in universities}
            all_prog_ids = {str(p["id"]) for p in programs}
            
            # Ajouter les IDs manquants à la fin du classement
            missing_uni_ids = [uid for uid in all_uni_ids if str(uid) not in enhanced_results["ranked_universities"]]
            missing_prog_ids = [pid for pid in all_prog_ids if str(pid) not in enhanced_results["ranked_programs"]]
            
            enhanced_results["ranked_universities"].extend(missing_uni_ids)
            enhanced_results["ranked_programs"].extend(missing_prog_ids)

            return enhanced_results

        except Exception as e:
            print(f"Erreur lors de l'utilisation de Gemini: {str(e)}")
            return self._get_default_response(universities, programs)

    def _prepare_context(self, universities: List[Dict], programs: List[Dict]) -> str:
        """
        Prépare le contexte des données pour Gemini de manière plus détaillée
        """
        context = "Universités disponibles :\n"
        for uni in universities[:10]:
            context += (
                f"- ID: {uni['id']}\n"
                f"  Nom: {uni['name']}\n"
                f"  Location: {uni['location']}\n"
            )
        
        context += "\nProgrammes disponibles :\n"
        for prog in programs[:10]:
            context += (
                f"- ID: {prog['id']}\n"
                f"  Nom: {prog['name']}\n"
                f"  Niveau: {prog['degree_level']}\n"
                f"  Frais: {prog.get('tuition', 'N/A')}€\n"
            )
        
        return context

    def _get_default_response(self, universities: List[Dict], programs: List[Dict]) -> Dict[str, Any]:
        """
        Retourne une réponse par défaut en cas d'erreur
        """
        return {
            "analysis": "Voici les résultats correspondant à votre recherche. Utilisez les filtres pour affiner les résultats.",
            "ranked_universities": [u["id"] for u in universities],
            "ranked_programs": [p["id"] for p in programs],
            "suggested_filters": {
                "degree_levels": [],
                "locations": [],
                "tuition_range": {"min": None, "max": None}
            }
        }
