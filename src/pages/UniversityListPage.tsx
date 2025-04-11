"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { universityService, type University } from "../services/api-services"
import UniversityCard from "../components/UniversityCard"

const UniversityListPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")

  useEffect(() => {
    fetchUniversities()
  }, [searchTerm, filterType, sortBy])

  // Modifier la fonction fetchUniversities pour mieux gérer les données de l'API Django
  const fetchUniversities = async () => {
    setLoading(true)
    setError(null)
    try {
      // Construire les paramètres de requête
      const params: Record<string, string> = {}
      if (searchTerm) params.search = searchTerm
      if (filterType) params.type = filterType

      // Ajouter le paramètre de tri
      if (sortBy === "rating") {
        params.ordering = "-rating"
      } else if (sortBy === "name") {
        params.ordering = "name"
      }

      const data = await universityService.getAll(params)
      console.log("Universités récupérées:", data)
      setUniversities(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Erreur lors de la récupération des universités:", err)
      setError("Impossible de charger les universités. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Découvrez les universités</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              placeholder="Nom de l'université..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Type d'établissement
            </label>
            <select
              id="filter"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="">Tous les types</option>
              <option value="public">Public</option>
              <option value="private">Privé</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Trier par
            </label>
            <select
              id="sort"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="name">Nom</option>
              <option value="rating">Classement</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            {universities.length} {universities.length > 1 ? "universités trouvées" : "université trouvée"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university) => (
              <Link to={`/universities/${university.id}`} key={university.id}>
                <UniversityCard university={university} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default UniversityListPage

