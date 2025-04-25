import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { universityService, type University } from "../services/api-services"
import UniversityCard from "../components/UniversityCard"

const UniversityListPage = () => {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterType, setFilterType] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const itemsPerPage = 10 

  useEffect(() => {
    fetchUniversities()
  }, [searchTerm, filterType, sortBy, currentPage])

  const fetchUniversities = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await universityService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        type: filterType || undefined,
        ordering: sortBy || undefined
      })
      
      setUniversities(response.data)
      setTotalPages(response.total_pages)
      setTotalItems(response.total)
    } catch (err: any) {
      console.error("Erreur lors de la récupération des universités:", err)
      setError("Impossible de charger les universités. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value)
    setCurrentPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
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
            {totalItems} {totalItems > 1 ? "universités trouvées" : "université trouvée"}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {universities.map((university) => (
              <Link to={`/universities/${university.id}`} key={university.id}>
                <UniversityCard university={university} />
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
  )
}

export default UniversityListPage
