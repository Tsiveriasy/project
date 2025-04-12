"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Search } from "lucide-react"
import { searchService } from "../services/api-services"
import UniversityCard from "../components/UniversityCard"
import ProgramCard from "../components/ProgramCard"
import type { University, Program } from "../services/api-services"

// Types pour l'analyse Gemini
interface GeminiAnalysis {
  analysis: string
  suggested_filters: {
    degree_levels: string[]
    locations: string[]
    tuition_range: {
      min: number | null
      max: number | null
    }
  }
}

interface SearchMetadata {
  filters_available: {
    locations: string[]
    degree_levels: { [key: string]: string }
    tuition_range: {
      min: number | null
      max: number | null
    }
  }
  analysis: string
  suggested_filters: GeminiAnalysis["suggested_filters"]
}

interface SearchResults {
  universities: University[]
  programs: Program[]
  metadata: SearchMetadata
}

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
  const [availableFilters, setAvailableFilters] = useState<any>({
    degree_levels: {},
    locations: [],
  })
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>("")
  const [suggestedFilters, setSuggestedFilters] = useState<GeminiAnalysis["suggested_filters"] | null>(null)

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
      
      if (results.metadata) {
        setGeminiAnalysis(results.metadata.analysis)
        setSuggestedFilters(results.metadata.suggested_filters)
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

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'études</label>
                <select
                  value={filters.degreeLevel}
                  onChange={(e) => handleFilterChange("degreeLevel", e.target.value)}
                  className="w-full border rounded-md py-2 px-3"
                >
                  <option value="">Tous les niveaux</option>
                  {Object.entries(availableFilters.degree_levels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label as string}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full border rounded-md py-2 px-3"
                >
                  <option value="">Toutes les localisations</option>
                  {availableFilters.locations.map((location: string) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais min. (€)</label>
                <input
                  type="number"
                  value={filters.minTuition}
                  onChange={(e) => handleFilterChange("minTuition", e.target.value)}
                  placeholder="Min"
                  className="w-full border rounded-md py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais max. (€)</label>
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

          {/* Analyse Gemini */}
          {geminiAnalysis && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Analyse de votre recherche</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600">{geminiAnalysis}</p>
              </div>
            </div>
          )}

          {/* Filtres suggérés */}
          {suggestedFilters && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Suggestions de filtres</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Niveaux d'études suggérés */}
                {suggestedFilters.degree_levels.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Niveaux d'études suggérés</h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestedFilters.degree_levels.map((level) => (
                        <button
                          key={level}
                          onClick={() => handleFilterChange("degreeLevel", level)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            filters.degreeLevel === level
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {availableFilters.degree_levels[level] || level}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Localisations suggérées */}
                {suggestedFilters.locations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Localisations suggérées</h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestedFilters.locations.map((location) => (
                        <button
                          key={location}
                          onClick={() => handleFilterChange("location", location)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            filters.location === location
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fourchette de prix suggérée */}
                {suggestedFilters.tuition_range.min !== null && suggestedFilters.tuition_range.max !== null && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Fourchette de prix suggérée</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleFilterChange("minTuition", String(suggestedFilters.tuition_range.min))
                          handleFilterChange("maxTuition", String(suggestedFilters.tuition_range.max))
                        }}
                        className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        {suggestedFilters.tuition_range.min}€ - {suggestedFilters.tuition_range.max}€
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglets de filtrage */}
          {searchResults && (
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "all"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Tous les résultats
                </button>
                <button
                  onClick={() => setActiveTab("universities")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "universities"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Universités ({searchResults.universities?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("programs")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "programs"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Formations ({searchResults.programs?.length || 0})
                </button>
              </nav>
            </div>
          )}

          {/* Affichage des résultats */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Recherche en cours...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          ) : searchResults ? (
            <div className="space-y-6">
              {activeTab === "all" || activeTab === "universities" ? (
                <div className="space-y-4">
                  {searchResults.universities?.map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))}
                </div>
              ) : null}

              {activeTab === "all" || activeTab === "programs" ? (
                <div className="space-y-4">
                  {searchResults.programs?.map((program) => (
                    <ProgramCard
                      key={program.id}
                      id={program.id}
                      name={program.name}
                      university_name={program.university_name}
                      degree_level={program.degree_level}
                      duration={program.duration}
                      language={program.language}
                      tuition_fees={program.tuition_fees || program.tuition_fee || 0}
                      description={program.description}
                    />
                  ))}
                </div>
              ) : null}

              {((activeTab === "universities" && !searchResults.universities?.length) ||
                (activeTab === "programs" && !searchResults.programs?.length) ||
                (activeTab === "all" &&
                  !searchResults.universities?.length &&
                  !searchResults.programs?.length)) && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun résultat trouvé</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
