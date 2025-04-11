"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Search } from "lucide-react"
import { searchService } from "../services/api-services"
import UniversityCard from "../components/UniversityCard"
import ProgramCard from "../components/ProgramCard"

const SearchPage = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialQuery = queryParams.get("q") || ""

  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const results = await searchService.globalSearch(query)
      setSearchResults(results)
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

    // Mettre à jour l'URL avec la nouvelle requête
    const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`
    window.history.pushState({}, "", newUrl)
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Résultats de recherche</h1>

          {/* Formulaire de recherche */}
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
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
          ) : searchResults ? (
            <div>
              {/* Universités */}
              {(activeTab === "all" || activeTab === "universities") &&
                searchResults.universities &&
                searchResults.universities.length > 0 && (
                  <div className="mb-10">
                    {activeTab === "all" && <h2 className="text-2xl font-semibold text-gray-800 mb-4">Universités</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.universities.map((uni: any) => (
                        <UniversityCard
                          key={uni.id}
                          id={uni.id}
                          name={uni.name}
                          location={uni.location}
                          image_url={uni.image_url}
                          ranking={uni.ranking}
                          student_count={uni.student_count}
                          programs_count={uni.programs_count}
                          success_rate={uni.success_rate}
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* Formations */}
              {(activeTab === "all" || activeTab === "programs") &&
                searchResults.programs &&
                searchResults.programs.length > 0 && (
                  <div>
                    {activeTab === "all" && <h2 className="text-2xl font-semibold text-gray-800 mb-4">Formations</h2>}
                    <div className="space-y-6">
                      {searchResults.programs.map((program: any) => (
                        <ProgramCard
                          key={program.id}
                          id={program.id}
                          name={program.name}
                          university_name={program.university_name}
                          level={program.level}
                          duration={program.duration}
                          language={program.language}
                          tuition_fee={program.tuition_fee}
                          description={program.description}
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* Aucun résultat */}
              {((activeTab === "all" &&
                (!searchResults.universities || searchResults.universities.length === 0) &&
                (!searchResults.programs || searchResults.programs.length === 0)) ||
                (activeTab === "universities" &&
                  (!searchResults.universities || searchResults.universities.length === 0)) ||
                (activeTab === "programs" && (!searchResults.programs || searchResults.programs.length === 0))) && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun résultat trouvé pour "{initialQuery}"</p>
                  <p className="text-gray-400 mt-2">
                    Essayez avec d'autres termes de recherche ou consultez nos suggestions ci-dessous
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Commencez votre recherche en utilisant le formulaire ci-dessus</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
