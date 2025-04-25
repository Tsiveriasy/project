import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { programService, type Program } from "../services/api-services"
import ProgramCard from "../components/ProgramCard"

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const itemsPerPage = 50

  useEffect(() => {
    fetchPrograms()
  }, [searchTerm, filterType, sortBy, currentPage])

  const fetchPrograms = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await programService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: searchTerm || undefined,
        level: filterType || undefined,
        ordering: sortBy || undefined
      })
      
      if (response && 'data' in response) {
        setPrograms(response.data)
        setTotalPages(response.total_pages)
        setTotalItems(response.total)
      } else {
        setPrograms([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération des formations:", err)
      setError("Impossible de charger les formations. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
    setCurrentPage(1) // Reset to first page on sort change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Découvrez les formations</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              placeholder="Nom de la formation..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Type de formation
            </label>
            <select
              id="filter"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="">Tous les types</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
              <option value="phd">Doctorat</option>
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
              <option value="duration">Durée</option>
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
            {totalItems} {totalItems > 1 ? "formations trouvées" : "formation trouvée"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Link to={`/programs/${program.id}`} key={program.id}>
                <ProgramCard program={program} />
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded border ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProgramsPage
