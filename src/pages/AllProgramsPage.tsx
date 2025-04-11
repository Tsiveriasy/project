"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { GraduationCap, Clock, Globe, Search, Building, Euro, ChevronLeft, ChevronRight } from "lucide-react"
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

const ITEMS_PER_PAGE = 9

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
  const [isLoading, setIsLoading] = useState(true);  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    degree_level: "",
    language: "",
    duration: "",
    sort: "",
    university: "",
  })


/*
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        const response = await programService.getAll({
          page: currentPage,
          limit: 50 // Augmenter la limite pour récupérer plus de programmes
        });
        if (response && response.data) {
          setPrograms(response.data);
          setTotalPages(response.total_pages || 1);
        } else {
          setPrograms([]);
          setError("Aucun programme trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des programmes:", error);
        setError("Une erreur est survenue lors du chargement des programmes");
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [currentPage]);
*/

useEffect(() => {
  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      // Augmenter la limite et ajouter des logs
      console.log("Fetching programs for page:", currentPage);
      const response = await programService.getAll({
        page: currentPage,
        limit: 20 // Augmenté à 20 pour être sûr d'avoir tous les programmes
      });
      
      console.log("API Response:", response);
      
      if (response && response.data) {
        setPrograms(response.data);
        setTotalPages(response.total_pages || 1);
        console.log("Total programs:", response.data.length);
      } else {
        setPrograms([]);
        setError("Aucun programme trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes:", error);
      setError("Une erreur est survenue lors du chargement des programmes");
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchPrograms();
}, [currentPage]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
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
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* Université */}
              <div>
                <select
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={filters.university}
                  onChange={(e) => setFilters((prev) => ({ ...prev, university: e.target.value }))}
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
                  onChange={(e) => setFilters((prev) => ({ ...prev, degree_level: e.target.value }))}
                >
                  <option value="">Niveau d'études</option>
                  <option value="licence">Licence (Bac+3)</option>
                  <option value="master">Master (Bac+5)</option>
                  <option value="doctorat">Doctorat (Bac+8)</option>
                  <option value="bts">BTS</option>
                  <option value="dut">DUT</option>
                  <option value="ingenieur">Diplôme d'Ingénieur</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              {/* Langue */}
              <div>
                <select
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  value={filters.language}
                  onChange={(e) => setFilters((prev) => ({ ...prev, language: e.target.value }))}
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
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
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

          {/* Liste des formations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(programs) && programs.map((program) => (
              <Link
                key={program.id}
                to={`/programs/${program.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.name}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Building className="h-4 w-4 mr-2" />
                    <span>{program.university_name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span>{DEGREE_LEVEL_LABELS[program.degree_level]}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{program.duration}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{program.language}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Euro className="h-4 w-4 mr-2" />
                      <span>
                        {program.tuition_fee
                          ? program.tuition_fee.toLocaleString() + " Ar/an"
                          : "Contactez l'établissement"}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 line-clamp-2">{program.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 rounded-md ${
                currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Précédent
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 rounded-md ${
                currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Suivant
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllProgramsPage
