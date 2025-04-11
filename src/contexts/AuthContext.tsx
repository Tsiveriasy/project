"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService, userService, type User } from "../services/api-services"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      // Récupérer l'utilisateur depuis le localStorage
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } else {
        // Si pas d'utilisateur dans le localStorage, essayer de le récupérer via l'API
        const userData = await userService.getCurrentUser()
        if (userData) {
          setUser(userData)
        } else {
          // Si aucun utilisateur n'est trouvé, déconnecter
          localStorage.removeItem("token")
          setUser(null)
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, confirmPassword: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.register(name, email, password, confirmPassword)
      setUser(response.user)
      setLoading(false)
      return true
    } catch (err: any) {
      console.error("Registration error:", err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Une erreur est survenue lors de l'inscription.")
      }
      setLoading(false)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login(email, password)
      if (response && response.user) {
        setUser(response.user)
        return true
      }
      throw new Error("Réponse invalide du serveur")
    } catch (err: any) {
      setError(err.message || "Erreur de connexion")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const clearError = () => {
    setError(null)
  }

  // Détermine si l'utilisateur est authentifié
  const isAuthenticated = user !== null

  // Détermine si l'utilisateur est administrateur
  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
