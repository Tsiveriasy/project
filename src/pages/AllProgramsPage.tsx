"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { GraduationCap, Clock, Globe, Search, Building, Euro } from "lucide-react"
import { programService, type Program } from "../services/api-services"

const DEGREE_LEVEL_LABELS: Record<string, string> = {
  licence: "Licence (Bac+3)",
  master: "Master (Bac+5)",
  doctorat: "Doctorat (Bac+8)",
  bts: "BTS",
  dut: "DUT",
  ingenieur: "Diplôme d'Ingénieur",
  other: "Autre",
}

const ITEMS_PER_PAGE = 10

interface ProgramSearchParams {
  page: number
  limit: number
  search?: string
  level?: string
  university?: string
  language?: string
  ordering?: string
}

const AllProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState({
    search: "",
    degree_level: "",
    language: "",
    university: "",
    sort: ""
  })

  useEffect(() => {
    fetchPrograms()
  }, [currentPage, filters])

  const fetchPrograms = async () => {
    try {
      setIsLoading(true)
      const response = await programService.getAll({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: filters.search || undefined,
        level: filters.degree_level || undefined,
        university: filters.university || undefined,
        language: filters.language || undefined,
        ordering: filters.sort || undefined
      })
      
      setPrograms(response.data)
      setTotalPages(response.total_pages)
      setTotalItems(response.total)
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes:", error)
      setError("Une erreur est survenue lors du chargement des programmes")
      setPrograms([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Bouton "Précédent"
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        Précédent
      </button>
    )

    // Première page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      )
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        )
      }
    }

    // Pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded border ${
            currentPage === i
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      )
    }

    // Dernière page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        )
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      )
    }

    // Bouton "Suivant"
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        Suivant
      </button>
    )

    return buttons
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Formations disponibles</h1>

          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Recherche */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Université */}
              <div>
                <select
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={filters.university}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                >
                  <option value="">Toutes les universités</option>
                  <option value="ua">Université d'Antananarivo</option>
                  <option value="iscam">ISCAM</option>
                  <option value="ut">Université de Toamasina</option>
                  <option value="uf">Université de Fianarantsoa</option>
                  <option value="um">Université de Mahajanga</option>
                </select>
              </div>

              {/* Niveau */}
              <div>
                <select
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={filters.degree_level}
                  onChange={(e) => handleFilterChange('degree_level', e.target.value)}
                  onChange={(e) => handleFilterChange('degree_level', e.target.value)}
                >
                  <option value="">Niveau d'études</option>
                  {Object.entries(DEGREE_LEVEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Langue */}
              <div>
                <select
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                >
                  <option value="">Langue d'enseignement</option>
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="fr-en">Français et Anglais</option>
                </select>
              </div>

              {/* Tri */}
              <div>
                <select
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="">Trier par</option>
                  <option value="name">Nom (A-Z)</option>
                  <option value="-name">Nom (Z-A)</option>
                  <option value="university_name">Université (A-Z)</option>
                  <option value="-university_name">Université (Z-A)</option>
                  <option value="tuition_fee">Frais de scolarité (croissant)</option>
                  <option value="-tuition_fee">Frais de scolarité (décroissant)</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Erreur!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-600">
                {totalItems} {totalItems > 1 ? "formations trouvées" : "formation trouvée"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {programs.map((program) => (
                  <Link
                    key={program.id}
                    to={`/programs/${program.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{program.name}</h2>
                      <p className="text-gray-600 mb-4">{program.university_name}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <GraduationCap className="h-5 w-5 mr-2" />
                          <span>{DEGREE_LEVEL_LABELS[program.degree_level] || program.degree_level}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-2" />
                          <span>{program.duration}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Globe className="h-5 w-5 mr-2" />
                          <span>{program.language}</span>
                        </div>

                        {program.tuition_fees && (
                          <div className="flex items-center text-gray-600">
                            <Euro className="h-5 w-5 mr-2" />
                            <span>{program.tuition_fees.toLocaleString()} Ar/an</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <div className="flex justify-center items-center space-x-2">
                    {renderPaginationButtons()}
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllProgramsPage
