import { NavigateFunction } from 'react-router-dom'
import jwt from 'jsonwebtoken'
import { User } from '../services/api-services'

const JWT_SECRET = "votre_secret_jwt_super_securise" // À stocker dans les variables d'environnement en production

export const requireAuth = (navigate: NavigateFunction) => {
  const token = localStorage.getItem('token')
  if (!token) {
    navigate('/login')
    return false
  }

  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    console.error('Token invalide:', error)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    return false
  }
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

export const isAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

export const hasPermission = (requiredRole: 'user' | 'admin'): boolean => {
  const user = getCurrentUser()
  if (!user) return false
  
  if (requiredRole === 'admin') {
    return user.role === 'admin'
  }
  
  return true // Les admins et les utilisateurs ont accès aux routes 'user'
}

export const setupAxiosInterceptors = (axios: any) => {
  axios.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}
