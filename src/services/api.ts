import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios"
import { API_CONFIG } from "../config/api.config"

// Types pour la pagination
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Création de l'instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: true, // Permet d'envoyer les cookies avec les requêtes cross-origin
})

// Instance publique sans authentification
const publicApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; // Utiliser Bearer pour JWT
    }
    
    console.log('Request Config:', {
      method: config.method,
      url: config.url,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Si le token est expiré, déconnecter l'utilisateur
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
)

// Service pour les universités (endpoints publics)
export const universityService = {
  getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
    try {
      const response = await publicApi.get("/universities/", { params })
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des universités:", error)
      throw error
    }
  },

  getById: async (id: number) => {
    try {
      const response = await publicApi.get(`/universities/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'université ${id}:`, error)
      throw error
    }
  },

  search: async (query: string): Promise<PaginatedResponse<any>> => {
    try {
      const response = await publicApi.get("/universities/", {
        params: { search: query },
      })
      return response.data
    } catch (error) {
      console.error("Erreur lors de la recherche des universités:", error)
      throw error
    }
  },
}

// Service d'authentification
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await publicApi.post("/token/", { email, password })
      const { access, refresh } = response.data

      // Stockage des tokens
      localStorage.setItem("token", access)
      localStorage.setItem("refreshToken", refresh)

      return response.data
    } catch (error) {
      console.error("Erreur de connexion:", error)
      throw error
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      throw new Error("Refresh token non disponible")
    }

    try {
      const response = await publicApi.post("/token/refresh/", { refresh: refreshToken })
      const { access } = response.data
      localStorage.setItem("token", access)
      return access
    } catch (error) {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await publicApi.post("/users/register/", {
        name,
        email,
        password,
        password2: password,
      })
      return response.data
    } catch (error) {
      console.error("Erreur d'inscription:", error)
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/profile/")
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération du profil utilisateur:", error)
      throw error
    }
  },
}

export default api
