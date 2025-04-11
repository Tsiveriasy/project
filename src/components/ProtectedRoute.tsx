"use client"

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { requireAuth, hasPermission } from '../middleware/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin'
}

// Améliorer le comportement du ProtectedRoute pour mieux gérer les cas d'erreur
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'user' }) => {
  const location = useLocation()

  // Vérifier l'authentification
  const isAuthenticated = requireAuth(() => {})

  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    console.log("Redirection vers /login depuis ProtectedRoute, chemin actuel:", location.pathname)
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Vérifier les permissions
  if (!hasPermission(requiredRole)) {
    // Rediriger vers la page d'accueil si l'utilisateur n'a pas les permissions nécessaires
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
