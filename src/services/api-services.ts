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
  first_name: string
  last_name: string
  email?: string
  profile: {
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

// Définir une nouvelle interface pour les mises à jour directes des champs du profil
export interface ProfileDirectUpdateData {
  first_name: string
  last_name: string
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
  [key: string]: any
}

import axios from "axios"

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
})

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
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
      const response = await api.post('/users/auth/login/', { email, password })
      
      // Stocker le token dans localStorage
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        console.log("Login successful, setting user:", response.data.user)
      }
      
      return response.data
    } catch (error) {
      console.error("Error during login:", error)
      throw error
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/users/auth/profile/')
      return response.data
    } catch (error) {
      console.error("Error fetching profile after login:", error)
      throw error
    }
  },

  async register(name: string, email: string, password: string, confirmPassword: string) {
    try {
      const response = await api.post('/users/auth/register/', {
        name,
        email,
        password,
        password_confirmation: confirmPassword
      })
      
      // Stocker le token dans localStorage
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      console.error('Error during registration:', error)
      throw error
    }
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userProfile")
  }
}

// Service des universités
export const universityService = {
  async getAll(params?: any): Promise<PaginatedResponse<University>> {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const queryParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || '',
        type: params?.type || '',
        ordering: params?.ordering || 'name'
      }

      const response = await api.get(`/universities/`, { 
        params: queryParams,
        headers 
      })

      return {
        data: response.data.results,
        total: response.data.count,
        page: queryParams.page,
        limit: queryParams.limit,
        total_pages: Math.ceil(response.data.count / queryParams.limit)
      }
    } catch (error: any) {
      console.error("Erreur lors de la récupération des universités:", error)
      throw error
    }
  },

  async getFeatured(): Promise<University[]> {
    try {
      const response = await api.get(`/universities/`, {
        params: { 
          featured: true,
          limit: 6
        }
      })
      return response.data.results
    } catch (error) {
      console.error("Erreur lors de la récupération des universités en vedette:", error)
      throw error
    }
  },

  async getRandomFeatured(limit: number = 3): Promise<University[]> {
    try {
      const response = await this.getAll({ page: 1, limit: 10 });
      // Mélanger les universités et en prendre 3 au hasard
      return response.data
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting random featured universities:', error);
      return [];
    }
  },

  async getById(id: number): Promise<University> {
    try {
      const response = await api.get(`/universities/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'université ${id}:`, error)
      throw error
    }
  },
}

// Service des programmes
export const programService = {
  async getAll(params?: ProgramSearchParams): Promise<PaginatedResponse<Program>> {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await api.get(`/programs/`, { 
        params: {
          ...params,
          page: params?.page || 1,
          limit: params?.limit || 50
        },
        headers
      })
      
      // S'assurer que nous avons tous les champs nécessaires
      const results = response.data.results || response.data || []
      const count = response.data.count || response.data.total || 0
      const currentPage = params?.page || 1
      const itemsPerPage = params?.limit || 50
      
      return {
        data: results,
        total: count,
        page: currentPage,
        limit: itemsPerPage,
        total_pages: Math.ceil(count / itemsPerPage)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes:", error)
      throw error
    }
  },

  async getById(id: number): Promise<Program> {
    try {
      const response = await api.get(`/programs/${id}/`)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération du programme:", error)
      throw error
    }
  },

  async getFeatured(): Promise<Program[]> {
    try {
      const response = await api.get(`/programs/`, {
        params: { 
          featured: true,
          limit: 6
        }
      })
      return response.data.results
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes en vedette:", error)
      throw error
    }
  }
}

// Service de recherche
export interface SearchResults {
  universities: University[]
  programs: Program[]
  metadata: {
    filters_available: {
      locations: string[]
      degree_levels: { [key: string]: string }
      tuition_range: {
        min: number | null
        max: number | null
      }
      languages: string[]
    }
  }
}

export const searchService = {
  async globalSearch(queryParams: string): Promise<SearchResults> {
    try {
      const response = await api.get(`/search/global/?${queryParams}`)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la recherche globale:", error)
      throw error
    }
  },
}

// Service d'orientation
export const orientationService = {
  // Corriger la méthode submitAnswers pour utiliser le paramètre answers
  async submitAnswers(answers: { question_id: number; answer: string }[]) {
    try {
      // Simuler une réponse d'orientation basée sur les réponses
      // Dans un environnement réel, cela serait un appel API avec les réponses

      // Récupérer tous les programmes
      const programsResponse = await api.get("/programs/")
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
  getCurrentUser: async (forceRefresh = false) => {
    console.log(`Getting current user ${forceRefresh ? '(force refresh)' : ''}`);
    try {
      // Si forceRefresh est vrai, on interroge directement l'API
      // sinon on utilise le localStorage s'il est disponible
      if (!forceRefresh) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log("User data loaded from localStorage:", userData);
          return userData;
        }
      }
      
      // Toujours interroger l'API si forceRefresh=true ou si pas de données en cache
      const response = await api.get('/users/auth/profile/');
      console.log("GET profile response:", response.data);
      
      // Mise à jour du localStorage avec les données fraîches
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  updateProfile: async (profileData: ProfileDirectUpdateData) => {
    console.log("Making profile update request with data:", profileData);
    
    // Restructurer les données pour qu'elles soient conformes au format attendu par le backend
    const restructuredData: {
      first_name: string;
      last_name: string;
      profile: Record<string, any>;
    } = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      profile: {}
    };
    
    // Extraire les champs qui appartiennent au profile
    const profileFields = [
      'phone', 'address', 'bio', 'interests', 
      'education_level', 'current_university', 'academic_records'
    ];
    
    // Ajouter ces champs à l'objet profile
    profileFields.forEach(field => {
      if (profileData[field] !== undefined) {
        restructuredData.profile[field] = profileData[field];
      }
    });
    
    console.log("Restructured data for API:", restructuredData);
    
    try {
      // First, try to update with PATCH
      const response = await api.patch('/users/auth/profile/update/', restructuredData)
      console.log("PATCH update response:", response.data);
      
      if (!response.data) {
        throw new Error('No data received from profile update')
      }
      
      // Mettre à jour le localStorage avec les nouvelles données
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        ...response.data,
        profile: {
          ...(storedUser.profile || {}),
          ...(response.data.profile || {})
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data
      
    } catch (patchError: any) {
      console.error("PATCH request failed:", patchError.response?.data || patchError);
      
      // If PATCH fails, try with PUT
      try {
        console.log("Attempting PUT request instead...");
        const putResponse = await api.put('/users/auth/profile/update/', restructuredData)
        console.log("PUT update response:", putResponse.data);
        
        if (!putResponse.data) {
          throw new Error('No data received from profile update')
        }
        
        // Mettre à jour le localStorage avec les nouvelles données
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...storedUser,
          ...putResponse.data,
          profile: {
            ...(storedUser.profile || {}),
            ...(putResponse.data.profile || {})
          }
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return putResponse.data
        
      } catch (putError: any) {
        console.error("PUT request also failed:", putError.response?.data || putError);
        throw putError
      }
    }
  },

  updateAcademicRecords: async (records: any) => {
    try {
      const response = await api.post('/users/auth/profile/academic-records/', { academic_records: records })
      return response.data
    } catch (error: any) {
      console.error('Error updating academic records:', error.response?.data || error)
      throw error
    }
  },

  uploadTranscriptFile: async (file: File) => {
    try {
      console.log("Uploading transcript file:", file.name);
      
      // Création d'un formulaire pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Configuration spéciale pour les requêtes multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      // Envoi du fichier au serveur
      const response = await api.post('/users/auth/profile/transcript-upload/', formData, config);
      console.log("File upload response:", response.data);
      
      // Mettre à jour le localStorage avec les nouvelles données
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (!userData.profile.transcript_files) {
            userData.profile.transcript_files = [];
          }
          userData.profile.transcript_files.push(response.data.file);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (e) {
        console.error("Error updating localStorage after file upload:", e);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error uploading transcript file:', error.response?.data || error);
      throw error;
    }
  },

  deleteTranscriptFile: async (fileUrl: string) => {
    try {
      console.log("Deleting transcript file with URL:", fileUrl);
      
      // Appel à l'API pour supprimer le fichier
      const response = await api.delete('/users/auth/profile/transcript-delete/', {
        data: { file_url: fileUrl }
      });
      
      console.log("File deletion response:", response.data);
      
      // Mettre à jour le localStorage si la suppression a réussi
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.profile.transcript_files) {
            // Filtrer les fichiers pour enlever celui qui a été supprimé
            userData.profile.transcript_files = userData.profile.transcript_files.filter(
              (file: any) => file.url !== fileUrl
            );
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (e) {
        console.error("Error updating localStorage after file deletion:", e);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error deleting transcript file:', error.response?.data || error);
      throw error;
    }
  },

  saveProgram: async (programId: number) => {
    return api.post('/users/auth/profile/saved-programs/', { program_id: programId })
      .then(response => response.data)
      .catch(error => {
        console.error('Error saving program:', error)
        throw error
      })
  },

  removeSavedProgram: async (programId: number) => {
    return api.delete(`/users/auth/profile/saved-programs/${programId}/`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error removing saved program:', error)
        throw error
      })
  },

  saveUniversity: async (universityId: number) => {
    return api.post('/users/auth/profile/saved-universities/', { university_id: universityId })
      .then(response => response.data)
      .catch(error => {
        console.error('Error saving university:', error)
        throw error
      })
  },

  removeSavedUniversity: async (universityId: number) => {
    return api.delete(`/users/auth/profile/saved-universities/${universityId}/`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error removing saved university:', error)
        throw error
      })
  },

  getSavedItems: async () => {
    return api.get('/users/auth/profile/saved-items/')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching saved items:', error)
        throw error
      })
  }
}
