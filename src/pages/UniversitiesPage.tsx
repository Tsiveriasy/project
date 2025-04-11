"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Filter, MapPin, ChevronDown } from "lucide-react"
import UniversityCard from "../components/UniversityCard"
import { universityService } from "../services/api-services";
interface University {
  id: number
  name: string
  location: string
  image_url: string
  ranking: number | null
  student_count: string | null
  programs_count: number | null
  success_rate?: number
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: University[]
}

const UniversitiesPage = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    location: [] as string[],
    type: [] as string[],
    field: [] as string[],
  })

  useEffect(() => {
    fetchUniversities()
  }, [searchTerm, filters])

  // Modifier la fonction fetchUniversities pour mieux gérer les données de l'API Django
  const fetchUniversities = async () => {
    try {
      setLoading(true)
      const params = {
        search: searchTerm,
        ...filters,
      }
      console.log("Paramètres de recherche:", params)
      const response = await universityService.getAll(params)
      console.log("Réponse de l'API:", response)

      if (Array.isArray(response)) {
        setUniversities(response)
        setTotalCount(response.length)
        setError(null)
      } else if (response && typeof response === "object" && "results" in response) {
        const paginatedResponse = response as any
        setUniversities(paginatedResponse.results)
        setTotalCount(paginatedResponse.count)
        setError(null)
      } else {
        console.error("Format de réponse inattendu:", response)
        setUniversities([])
        setTotalCount(0)
        setError("Format de données inattendu. Veuillez réessayer.")
      }
    } catch (err) {
      console.error("Erreur lors du chargement des universités:", err)
      setError("Une erreur est survenue lors du chargement des universités. Veuillez réessayer plus tard.")
      setUniversities([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null)
    } else {
      setActiveFilter(filter)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (category: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Une erreur est survenue</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Universités</h1>
          <p className="text-xl text-gray-600">
            Découvrez et comparez les meilleures universités pour votre parcours académique
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Rechercher une université..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  className={`flex items-center px-4 py-2 border rounded-md ${
                    activeFilter === "location" ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleFilter("location")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Localisation</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {activeFilter === "location" && (
                  <div className="absolute z-10 mt-2 w-56 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      {["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"].map((city) => (
                        <div key={city} className="mb-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={filters.location.includes(city)}
                              onChange={() => handleFilterChange("location", city)}
                            />
                            <span>{city}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className={`flex items-center px-4 py-2 border rounded-md ${
                    activeFilter === "type" ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleFilter("type")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Type d'établissement</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {activeFilter === "type" && (
                  <div className="absolute z-10 mt-2 w-56 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      {["Université publique", "Grande école", "École d'ingénieur", "École de commerce"].map((type) => (
                        <div key={type} className="mb-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={filters.type.includes(type)}
                              onChange={() => handleFilterChange("type", type)}
                            />
                            <span>{type}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className={`flex items-center px-4 py-2 border rounded-md ${
                    activeFilter === "field" ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleFilter("field")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Domaine d'études</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {activeFilter === "field" && (
                  <div className="absolute z-10 mt-2 w-56 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      {["Sciences", "Ingénierie", "Commerce", "Droit", "Médecine"].map((field) => (
                        <div key={field} className="mb-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={filters.field.includes(field)}
                              onChange={() => handleFilterChange("field", field)}
                            />
                            <span>{field}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-600">
          {totalCount} {totalCount > 1 ? "universités trouvées" : "université trouvée"}
        </div>

        {/* Universities Grid */}
        {universities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune université trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university) => (
              <UniversityCard
                key={university.id}
                id={university.id}
                name={university.name}
                location={university.location}
                image_url={university.image_url}
                ranking={university.ranking || 0}
                student_count={university.student_count ? Number.parseInt(university.student_count) : 0}
                programs_count={university.programs_count || 0}
                success_rate={university.success_rate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UniversitiesPage

