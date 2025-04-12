// Types


export interface Program {
  id: number
  name: string
  description: string
  university_id?: number
  university?: string | number
  university_name: string
  level?: string
  degree_level: string
  duration: string
  language: string
  admission_requirements: {
    requirements: string[]
    documents?: string[]
    deadline?: string
    process?: string
    debouches?: string[]
    secteurs_emploi?: string[]
    salaire_moyen_debutant?: string
  }
  tuition_fees?: number
  tuition_fee?: number
  start_date?: string
  application_deadline?: string
  credits?: number
  featured?: boolean
  courses?: {
    name: string
    credits: number
    description: string
  }[]
  // Champs supplémentaires pour compatibilité avec ProgramsPage
  title?: string
  field?: string
  studentCount?: number
  image?: string
}

// Adapter l'interface University pour mieux gérer les données de orientation_db
export interface University {
  id: number
  name: string
  location: string
  type?: string
  description: string
  image?: string
  image_url?: string
  website?: string
  rating?: number
  student_count?: string
  program_count?: number
  specialties?: string[]
  facilities?: string[]
  research_focus?: string[]
  international_partnerships?: string[]
  employment_rate?: number
  admission_requirements?: string[]
  academic_calendar?: {
    start_date: string
    end_date: string
    application_deadline: string
  }
  contact_info?: {
    address: string
    phone: string
    email: string
  }
  programs?: Program[]
}

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  profile?: {
    phone?: string
    address?: string
    bio?: string
    avatar_url?: string
    interests?: string[]
    education_level?: string
    current_university?: string
    academic_records?: {
      year: string
      semester: string
      gpa: number
      courses: {
        name: string
        grade: string
        credits: number
      }[]
    }[]
  }
  test_results?: {
    date: string
    recommended_fields: string[]
    recommended_programs: {
      id: number
      name: string
      university_name: string
      match_percentage: number
    }[]
  }[]
  saved_programs?: number[]
  saved_universities?: number[]
  interests?: string[]
  education_level?: string
  university?: string
  savedPrograms?: number[]
  savedUniversities?: number[]
}

export interface ProgramSearchParams {
  page?: number
  limit?: number
  university_id?: number
  level?: string
  featured?: boolean
  search?: string
  q?: string
  university?: string | number
  language?: string
  ordering?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Définir une interface pour les données de profil
export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  profile?: {
    phone?: string
    address?: string
    bio?: string
    interests?: string[]
    education_level?: string
    current_university?: string
    academic_records?: {
      year: string
      semester: string
      gpa: number
      courses: {
        name: string
        grade: string
        credits: number
      }[]
    }[]
  }
}

import axios from "axios"
import { API_CONFIG } from "../config/api.config"

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
})

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
    config.headers['Content-Type'] = 'application/json'
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// Service d'authentification
export const authService = {
  async login(email: string, password: string) {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const response = await api.post(
        API_CONFIG.AUTH.LOGIN_ENDPOINT,
        {
          email: email,
          password: password
        }
      );

      console.log('Login response:', {
        status: response.status,
        data: response.data
      });

      if (!response.data || (!response.data.access_token && !response.data.token)) {
        throw new Error('Invalid response format')
      }

      const token = response.data.access_token || response.data.token
      localStorage.setItem('token', token)
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.get(API_CONFIG.AUTH.PROFILE_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(name: string, email: string, password: string, confirmPassword: string) {
    try {
      // Extraire le prénom et le nom
      const nameParts = name.split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

      const response = await api.post("/register", {
        email,
        password,
        confirmPassword,
        username: email.split("@")[0],
        firstName,
        lastName,
      })

      // Sauvegarder le token
      localStorage.setItem("token", response.data.accessToken)

      // Sauvegarder les informations utilisateur
      localStorage.setItem("user", JSON.stringify(response.data.user))

      return {
        token: response.data.accessToken,
        user: response.data.user,
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      throw error
    }
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },
}

// Service des universités
export const universityService = {
  async getAll(params?: any) {
    try {
      const response = await api.get(API_CONFIG.UNIVERSITIES.BASE, { params })
      return response.data.results || [];
    } catch (error: any) {
      console.error('Error fetching universities:', error)
      throw error;
    }
  },

  async getFeatured() {
    try {
      const response = await api.get(API_CONFIG.UNIVERSITIES.BASE, {
        params: { featured: true }
      })
      // Return just the results array from the paginated response
      return response.data.results || [];
    } catch (error: any) {
      console.error('Error fetching featured universities:', error)
      // Try regular endpoint if featured fails
      console.log('Featured universities endpoint not found, falling back to regular endpoint')
      const fallbackResponse = await this.getAll({ limit: 6 });
      return fallbackResponse.results || [];
    }
  },

  async getById(id: number) {
    try {
      const response = await api.get(`${API_CONFIG.UNIVERSITIES.BASE}${id}/`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching university ${id}:`, error)
      if (error.response?.status === 404) {
        throw new Error("Université non trouvée")
      }
      throw error
    }
  }
};

/*
// Service des programmes
export const programService = {
  async getAll(params?: ProgramSearchParams): Promise<PaginatedResponse<Program>> {
    try {
      const response = await api.get(API_CONFIG.UNIVERSITIES.PROGRAMS, { 
        params: {
          ...params,
          page: params?.page || 1,
          limit: params?.limit || 9
        }
      })
      return {
        data: response.data.results || [],
        total: response.data.count,
        page: params?.page || 1,
        limit: params?.limit || 9,
        total_pages: Math.ceil((response.data.count || 0) / (params?.limit || 9))
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes:", error)
      throw error
    }
  },

  async getById(id: number): Promise<Program> {
    try {
      const response = await api.get(`${API_CONFIG.UNIVERSITIES.PROGRAMS}${id}/`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération du programme ${id}:`, error)
      throw error
    }
  },

  async getFeatured(): Promise<Program[]> {
    try {
      const response = await api.get(`${API_CONFIG.UNIVERSITIES.PROGRAMS}featured/`)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes en vedette:", error)
      throw error
    }
  }
}
*/


// Service des programmes
export const programService = {
  async getAll(params?: ProgramSearchParams): Promise<PaginatedResponse<Program>> {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await api.get(API_CONFIG.UNIVERSITIES.PROGRAMS, { 
        params: {
          ...params,
          page: params?.page || 1,
          limit: params?.limit || 9
        },
        headers
      })
      
      return {
        data: response.data.results || [],
        total: response.data.count,
        page: params?.page || 1,
        limit: params?.limit || 9,
        total_pages: Math.ceil((response.data.count || 0) / (params?.limit || 9))
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes:", error)
      throw error
    }
  },

  async getById(id: number): Promise<Program> {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await api.get(`${API_CONFIG.UNIVERSITIES.PROGRAMS}${id}/`, { headers })
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération du programme ${id}:`, error)
      throw error
    }
  },

  async getFeatured(): Promise<Program[]> {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await api.get(`${API_CONFIG.UNIVERSITIES.PROGRAMS}featured/`, { headers })
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes en vedette:", error)
      throw error
    }
  }
}


// Service de recherche
export const searchService = {
  globalSearch: async (queryParams: string) => {
    try {
      const response = await api.get(`${API_CONFIG.SEARCH.GLOBAL}?${queryParams}`)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      throw error
    }
  }
}

// Service d'orientation
export const orientationService = {
  // Corriger la méthode submitAnswers pour utiliser le paramètre answers
  async submitAnswers(answers: { question_id: number; answer: string }[]) {
    try {
      // Simuler une réponse d'orientation basée sur les réponses
      // Dans un environnement réel, cela serait un appel API avec les réponses

      // Récupérer tous les programmes
      const programsResponse = await api.get("/programs")
      const allPrograms = programsResponse.data

      // Utiliser les réponses pour filtrer les programmes (simulation)
      // Dans un vrai système, les réponses seraient utilisées pour calculer la compatibilité
      console.log("Réponses soumises:", answers)

      // Sélectionner aléatoirement 3 programmes comme recommandations
      const recommendedPrograms = allPrograms
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((program: Program) => ({
          id: program.id,
          name: program.name,
          university_name: program.university_name || "Université",
          level: program.degree_level || "Master",
          field: program.degree_level || "Informatique",
          match_percentage: Math.floor(Math.random() * 30) + 70, // 70-99%
        }))

      // Extraire des domaines recommandés basés sur les réponses
      const recommendedFields = ["Informatique", "Sciences", "Ingénierie", "Gestion"]

      return {
        recommended_fields: recommendedFields,
        recommended_programs: recommendedPrograms,
      }
    } catch (error: any) {
      console.error("Error submitting orientation test answers:", error)
      throw error
    }
  },

  async getQuestions() {
    try {
      // Questions d'orientation simulées
      // Dans un environnement réel, cela serait un appel API
      return [
        {
          id: 1,
          question: "Quel domaine vous intéresse le plus ?",
          type: "single_choice",
          options: ["Sciences et technologies", "Commerce et gestion", "Arts et lettres", "Santé", "Sciences sociales"],
        },
        {
          id: 2,
          question: "Quelle est votre matière préférée ?",
          type: "single_choice",
          options: ["Mathématiques", "Langues", "Sciences naturelles", "Histoire/Géographie", "Économie"],
        },
        {
          id: 3,
          question: "Comment préférez-vous apprendre ?",
          type: "single_choice",
          options: [
            "Cours théoriques",
            "Travaux pratiques",
            "Projets de groupe",
            "Recherche individuelle",
            "Stage en entreprise",
          ],
        },
        {
          id: 4,
          question: "Quel environnement de travail préférez-vous ?",
          type: "single_choice",
          options: ["Bureau", "Laboratoire", "Extérieur", "Hôpital/Clinique", "Salle de classe"],
        },
        {
          id: 5,
          question: "Quelle compétence souhaitez-vous développer en priorité ?",
          type: "single_choice",
          options: [
            "Analyse et résolution de problèmes",
            "Communication",
            "Créativité",
            "Leadership",
            "Compétences techniques",
          ],
        },
      ]
    } catch (error: any) {
      console.error("Error fetching orientation questions:", error)
      throw error
    }
  },
}

// Service des utilisateurs
export const userService = {
  getCurrentUser: async () => {
    try {
      // Récupérer l'utilisateur depuis le localStorage
      const userStr = localStorage.getItem("user")
      if (userStr) {
        return JSON.parse(userStr)
      }

      // Si l'utilisateur est connecté mais pas stocké localement
      const token = localStorage.getItem("token")
      if (token) {
        // L'intercepteur ajoutera automatiquement le token
        const response = await api.get(API_CONFIG.AUTH.PROFILE_ENDPOINT)
        localStorage.setItem("user", JSON.stringify(response.data))
        return response.data
      }

      return null
    } catch (error: any) {
      console.error("Error fetching current user:", error)
      throw error
    }
  },

  updateProfile: async (profileData: ProfileUpdateData) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Utilisateur non connecté")
      }

      // L'intercepteur ajoutera automatiquement le token
      const response = await api.patch(API_CONFIG.AUTH.PROFILE_UPDATE_ENDPOINT, profileData)

      // Mettre à jour l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(response.data))
      return response.data
      
    } catch (error: any) {
      console.error("Error updating profile:", error)
      throw error
    }
  },

  saveProgram: async (programId: number) => {
    try {
      // Récupérer l'utilisateur actuel
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Utilisateur non connecté")
      }

      const currentUser = JSON.parse(userStr)

      // Vérifier si le programme est déjà sauvegardé
      const savedPrograms = currentUser.savedPrograms || []
      if (savedPrograms.includes(programId)) {
        return currentUser
      }

      // Ajouter le programme aux favoris
      const updatedUser = {
        ...currentUser,
        savedPrograms: [...savedPrograms, programId],
      }

      // Mettre à jour l'utilisateur
      const response = await api.patch(`/users/${currentUser.id}`, {
        savedPrograms: updatedUser.savedPrograms,
      })

      // Mettre à jour l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(response.data))

      return response.data
    } catch (error: any) {
      console.error("Error saving program:", error)
      throw error
    }
  },

  saveUniversity: async (universityId: number) => {
    try {
      // Récupérer l'utilisateur actuel
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Utilisateur non connecté")
      }

      const currentUser = JSON.parse(userStr)

      // Vérifier si l'université est déjà sauvegardée
      const savedUniversities = currentUser.savedUniversities || []
      if (savedUniversities.includes(universityId)) {
        return currentUser
      }

      // Ajouter l'université aux favoris
      const updatedUser = {
        ...currentUser,
        savedUniversities: [...savedUniversities, universityId],
      }

      // Mettre à jour l'utilisateur
      const response = await api.patch(`/users/${currentUser.id}`, {
        savedUniversities: updatedUser.savedUniversities,
      })

      // Mettre à jour l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(response.data))

      return response.data
    } catch (error: any) {
      console.error("Error saving university:", error)
      throw error
    }
  },

  removeSavedProgram: async (programId: number) => {
    try {
      // Récupérer l'utilisateur actuel
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Utilisateur non connecté")
      }

      const currentUser = JSON.parse(userStr)

      // Retirer le programme des favoris
      const savedPrograms = currentUser.savedPrograms || []
      const updatedUser = {
        ...currentUser,
        savedPrograms: savedPrograms.filter((id: number) => id !== programId),
      }

      // Mettre à jour l'utilisateur
      const response = await api.patch(`/users/${currentUser.id}`, {
        savedPrograms: updatedUser.savedPrograms,
      })

      // Mettre à jour l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(response.data))

      return response.data
    } catch (error: any) {
      console.error("Error removing saved program:", error)
      throw error
    }
  },

  removeSavedUniversity: async (universityId: number) => {
    try {
      // Récupérer l'utilisateur actuel
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Utilisateur non connecté")
      }

      const currentUser = JSON.parse(userStr)

      // Retirer l'université des favoris
      const savedUniversities = currentUser.savedUniversities || []
      const updatedUser = {
        ...currentUser,
        savedUniversities: savedUniversities.filter((id: number) => id !== universityId),
      }

      // Mettre à jour l'utilisateur
      const response = await api.patch(`/users/${currentUser.id}`, {
        savedUniversities: updatedUser.savedUniversities,
      })

      // Mettre à jour l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(response.data))

      return response.data
    } catch (error: any) {
      console.error("Error removing saved university:", error)
      throw error
    }
  },

  getSavedItems: async () => {
    try {
      // Récupérer l'utilisateur actuel
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Utilisateur non connecté")
      }

      const currentUser = JSON.parse(userStr)

      const savedPrograms = currentUser.savedPrograms || []
      const savedUniversities = currentUser.savedUniversities || []

      // Récupérer les programmes sauvegardés
      const programsPromises = savedPrograms.map((id: number) =>
        api
          .get(`/programs/${id}`)
          .then((res) => res.data)
          .catch(() => null),
      )

      // Récupérer les universités sauvegardées
      const universitiesPromises = savedUniversities.map((id: number) =>
        api
          .get(`/universities/${id}`)
          .then((res) => res.data)
          .catch(() => null),
      )

      const [programsResults, universitiesResults] = await Promise.all([
        Promise.all(programsPromises),
        Promise.all(universitiesPromises),
      ])

      return {
        programs: programsResults.filter(Boolean),
        universities: universitiesResults.filter(Boolean),
      }
    } catch (error: any) {
      console.error("Error fetching saved items:", error)
      return {
        programs: [],
        universities: [],
      }
    }
  },
}
