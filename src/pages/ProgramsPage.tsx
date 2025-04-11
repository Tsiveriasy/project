"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown } from "lucide-react"
import ProgramCard from "../components/ProgramCard"

const ProgramsPage = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Sample data for programs
  const programs = [
    {
      id: 1,
      title: "Master en Droit des Affaires",
      university: "Université Paris-Sorbonne",
      duration: "2 ans",
      level: "Master",
      field: "Droit",
      studentCount: 120,
      image:
        "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 2,
      title: "Diplôme d'Ingénieur en Informatique",
      university: "École Polytechnique",
      duration: "3 ans",
      level: "Bac+5",
      field: "Informatique",
      studentCount: 85,
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 3,
      title: "MBA Management International",
      university: "HEC Paris",
      duration: "16 mois",
      level: "Master",
      field: "Commerce",
      studentCount: 65,
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 4,
      title: "Licence en Sciences Politiques",
      university: "Sciences Po Paris",
      duration: "3 ans",
      level: "Licence",
      field: "Sciences Politiques",
      studentCount: 150,
      image:
        "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 5,
      title: "Master en Biologie Moléculaire",
      university: "Université de Lyon",
      duration: "2 ans",
      level: "Master",
      field: "Sciences",
      studentCount: 45,
      image:
        "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ]

  const toggleFilter = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null)
    } else {
      setActiveFilter(filter)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Formations</h1>
          <p className="text-xl text-gray-600">
            Explorez notre catalogue de formations pour trouver celle qui correspond à vos ambitions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  className={`flex items-center px-4 py-2 border rounded-md ${
                    activeFilter === "level" ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleFilter("level")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Niveau</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {activeFilter === "level" && (
                  <div className="absolute z-10 mt-2 w-56 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Licence (Bac+3)</span>
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Master (Bac+5)</span>
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Doctorat (Bac+8)</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Formation professionnelle</span>
                        </label>
                      </div>
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
                  <span>Domaine</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {activeFilter === "field" && (
                  <div className="absolute z-10 mt-2 w-56 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Sciences</span>
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Ingénierie</span>
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Commerce</span>
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Droit</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Médecine</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className={`flex items-center px-4 py-2 border rounded-md ${
                    activeFilter === "duration" ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleFilter("duration")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Durée</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {activeFilter === "duration" && (
                  <div className="absolute z-10 mt-2 w-56 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>1 an</span>
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>2 ans</span>
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>3 ans</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>Plus de 3 ans</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">{programs.length} résultats trouvés</p>
            <div className="flex items-center">
              <span className="mr-2 text-gray-600">Trier par:</span>
              <select className="border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Popularité</option>
                <option>Durée</option>
                <option>Nom (A-Z)</option>
                <option>Nom (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                id={program.id}
                name={program.title}
                university_name={program.university}
                level={program.level}
                duration={program.duration}
                language="Français" // Valeur par défaut si non disponible
                tuition_fee="Contactez l'établissement" // Valeur par défaut si non disponible
                description={`Formation en ${program.field} proposée par ${program.university}`} // Description générée
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <a
              href="#"
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
            >
              Précédent
            </a>
            <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-blue-50 text-blue-600 font-medium">
              1
            </a>
            <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
              2
            </a>
            <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
              3
            </a>
            <a
              href="#"
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
            >
              Suivant
            </a>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default ProgramsPage

