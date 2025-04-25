"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Search } from "lucide-react"
import { searchService } from "../services/api-services"
import type { SearchResults } from "../services/api-services"
import UniversityCard from "../components/UniversityCard"
import ProgramCard from "../components/ProgramCard"

const SearchPage = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialQuery = queryParams.get("q") || ""

  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState({
    minTuition: "",
    maxTuition: "",
    degreeLevel: "",
    location: "",
  })
  const [availableFilters, setAvailableFilters] = useState<SearchResults["metadata"]["filters_available"]>({
    locations: [],
    degree_levels: {},
    tuition_range: { min: null, max: null },
    languages: []
  })

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string, searchFilters = filters) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      searchParams.append("q", query)
      if (searchFilters.minTuition) searchParams.append("min_tuition", searchFilters.minTuition)
      if (searchFilters.maxTuition) searchParams.append("max_tuition", searchFilters.maxTuition)
      if (searchFilters.degreeLevel) searchParams.append("degree_level", searchFilters.degreeLevel)
      if (searchFilters.location) searchParams.append("location", searchFilters.location)

      const results = await searchService.globalSearch(searchParams.toString())
      setSearchResults(results)
      
      if (results.metadata?.filters_available) {
        setAvailableFilters(results.metadata.filters_available)
      }
    } catch (err) {
      console.error("Erreur de recherche:", err)
      setError("Une erreur est survenue lors de la recherche. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchTerm)

    const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`
    window.history.pushState({}, "", newUrl)
  }

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    performSearch(searchTerm, newFilters)
  }

  // Filtrer les résultats en fonction de l'onglet actif
  const filteredResults = searchResults ? {
    universities: activeTab === "all" || activeTab === "universities" ? searchResults.universities : [],
    programs: activeTab === "all" || activeTab === "programs" ? searchResults.programs : []
  } : null

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Résultats de recherche</h1>

          {/* Formulaire de recherche et filtres */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Rechercher
                </button>
              </div>
            </form>

            {/* Onglets */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-md ${
                  activeTab === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("all")}
              >
                Tout ({searchResults ? 
                  (searchResults.universities.length + searchResults.programs.length) : 0})
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  activeTab === "universities"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("universities")}
              >
                Universités ({searchResults?.universities.length || 0})
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  activeTab === "programs"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("programs")}
              >
                Programmes ({searchResults?.programs.length || 0})
              </button>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'études
                </label>
                <select
                  value={filters.degreeLevel}
                  onChange={(e) => handleFilterChange("degreeLevel", e.target.value)}
                  className="w-full border rounded-md py-2 px-3"
                >
                  <option value="">Tous les niveaux</option>
                  {availableFilters.degree_levels &&
                    Object.entries(availableFilters.degree_levels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full border rounded-md py-2 px-3"
                >
                  <option value="">Toutes les localisations</option>
                  {availableFilters.locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais min. (€)
                </label>
                <input
                  type="number"
                  value={filters.minTuition}
                  onChange={(e) => handleFilterChange("minTuition", e.target.value)}
                  placeholder="Min"
                  className="w-full border rounded-md py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais max. (€)
                </label>
                <input
                  type="number"
                  value={filters.maxTuition}
                  onChange={(e) => handleFilterChange("maxTuition", e.target.value)}
                  placeholder="Max"
                  className="w-full border rounded-md py-2 px-3"
                />
              </div>
            </div>
          </div>

          {/* État de chargement */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Chargement des résultats...</p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Résultats */}
          {!isLoading && !error && filteredResults && (
            <div className="space-y-6">
              {/* Universités */}
              {(activeTab === "all" || activeTab === "universities") && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Universités ({filteredResults.universities.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults.universities.map((university) => (
                      <UniversityCard key={university.id} university={university} />
                    ))}
                  </div>
                </div>
              )}

              {/* Programmes */}
              {(activeTab === "all" || activeTab === "programs") && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Programmes ({filteredResults.programs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults.programs.map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </div>
                </div>
              )}

              {/* Message si aucun résultat */}
              {filteredResults.universities.length === 0 && filteredResults.programs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Aucun résultat trouvé pour votre recherche.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
