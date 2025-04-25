"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService, userService, type User } from "../services/api-services"
import type { AxiosError } from "axios"

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
  updateProfile: (profileData: any) => Promise<boolean>
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
        try {
          const userData = JSON.parse(userStr)
          console.log("User data loaded from localStorage:", userData)
          setUser(userData)
          
          // Refresh profile data in the background
          const refreshedUserData = await userService.getCurrentUser()
          if (refreshedUserData) {
            console.log("Updated user data from API:", refreshedUserData)
            // Make sure we preserve saved items
            const mergedData = {
              ...refreshedUserData,
              saved_universities: refreshedUserData.saved_universities || userData.saved_universities || [],
              saved_programs: refreshedUserData.saved_programs || userData.saved_programs || []
            }
            setUser(mergedData)
            // Update localStorage with the latest data
            localStorage.setItem("user", JSON.stringify(mergedData))
          }
        } catch (parseError) {
          console.error("Error parsing user data from localStorage:", parseError)
          // Invalid data in localStorage, try to fetch from API
          const userData = await userService.getCurrentUser()
          if (userData) {
            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))
          } else {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setUser(null)
          }
        }
      } else {
        // Si pas d'utilisateur dans le localStorage, essayer de le récupérer via l'API
        const userData = await userService.getCurrentUser()
        if (userData) {
          console.log("User data fetched from API:", userData)
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
        } else {
          // Si aucun utilisateur n'est trouvé, déconnecter
          localStorage.removeItem("token")
          setUser(null)
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching user profile:", err)
      // Don't remove the token and user data on network errors
      // This allows the app to work offline with cached user data
      if (err instanceof Error && err.message && (err.message.includes("token") || err.message.includes("authentication"))) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
      }
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
    } catch (err: unknown) {
      console.error("Registration error:", err)
      if (typeof err === "object" && err !== null && 'response' in err) {
        const axiosError = err as AxiosError<any>
        if (axiosError.response?.data?.errors) {
          // Formatage des erreurs de validation
          const errorMessages = Object.entries(axiosError.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join('\n')
          setError(errorMessages)
        } else if (axiosError.response?.data?.detail) {
          setError(axiosError.response.data.detail)
        } else if (err instanceof Error && err.message) {
          setError(err.message)
        } else {
          setError("Une erreur est survenue lors de l'inscription.")
        }
      } else if (err instanceof Error && err.message) {
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
        console.log("Login successful, setting user:", response.user)
        setUser(response.user)
        return true
      }
      throw new Error("Réponse invalide du serveur")
    } catch (err: unknown) {
      console.error("Login error:", err)
      if (err instanceof Error) {
        setError(err.message || "Erreur de connexion")
      } else {
        setError("Erreur de connexion")
      }
      setLoading(false)
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

  const updateProfile = async (profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.updateProfile(profileData);
      setUser(updatedUser);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      if (typeof err === "object" && err !== null && 'response' in err) {
        const axiosError = err as AxiosError<any>
        if (axiosError.response?.data?.errors) {
          const errorMessages = Object.entries(axiosError.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join('\n');
          setError(errorMessages);
        } else if (axiosError.response?.data?.detail) {
          setError(axiosError.response.data.detail);
        } else if (err instanceof Error && err.message) {
          setError(err.message);
        } else {
          setError("Une erreur est survenue lors de la mise à jour du profil.");
        }
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la mise à jour du profil.");
      }
      setLoading(false);
      return false;
    }
  };

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
        updateProfile
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
