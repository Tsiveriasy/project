"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  GraduationCap,
  Clock,
  Globe,
  Building,
  Euro,
  BookOpen,
  Briefcase,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react"
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

const ProgramDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [program, setProgram] = useState<Program | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await programService.getById(Number.parseInt(id))
        setProgram(data)
      } catch (err) {
        console.error("Erreur lors de la récupération du programme:", err)
        setError("Impossible de charger les détails du programme. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgram()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || "Programme non trouvé"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">{program.name}</h1>
            <div className="flex items-center text-blue-100 mt-2">
              <Building className="h-5 w-5 mr-2" />
              <span>{program.university_name}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <GraduationCap className="h-5 w-5 mr-3" />
                  <div>
                    <span className="text-sm text-gray-500">Niveau d'études</span>
                    <p className="font-medium">{DEGREE_LEVEL_LABELS[program.degree_level]}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <div>
                    <span className="text-sm text-gray-500">Durée</span>
                    <p className="font-medium">{program.duration}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Globe className="h-5 w-5 mr-3" />
                  <div>
                    <span className="text-sm text-gray-500">Langue d'enseignement</span>
                    <p className="font-medium">{program.language}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Euro className="h-5 w-5 mr-3" />
                  <div>
                    <span className="text-sm text-gray-500">Frais de scolarité</span>
                    <p className="font-medium">
                      {program.tuition_fee ? program.tuition_fee.toLocaleString() : "Non spécifié"}{" "}
                      {program.tuition_fee ? "Ar/an" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Description du programme
              </h2>
              <p className="text-gray-600 mb-8">{program.description}</p>

              {program.admission_requirements.requirements &&
                program.admission_requirements.requirements.length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle2 className="h-6 w-6 mr-2" />
                      Conditions d'admission
                    </h2>
                    <ul className="list-disc pl-6 text-gray-600 mb-8">
                      {program.admission_requirements.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </>
                )}

              {program.admission_requirements.debouches && program.admission_requirements.debouches.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-6 w-6 mr-2" />
                    Débouchés
                  </h2>
                  <ul className="list-disc pl-6 text-gray-600 mb-8">
                    {program.admission_requirements.debouches.map((debouche, index) => (
                      <li key={index}>{debouche}</li>
                    ))}
                  </ul>
                </>
              )}

              {program.admission_requirements.secteurs_emploi &&
                program.admission_requirements.secteurs_emploi.length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="h-6 w-6 mr-2" />
                      Secteurs d'emploi
                    </h2>
                    <ul className="list-disc pl-6 text-gray-600">
                      {program.admission_requirements.secteurs_emploi.map((secteur, index) => (
                        <li key={index}>{secteur}</li>
                      ))}
                    </ul>
                  </>
                )}

              {program.admission_requirements.salaire_moyen_debutant && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2" />
                    Salaire moyen débutant
                  </h2>
                  <p className="text-gray-600">{program.admission_requirements.salaire_moyen_debutant}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgramDetailPage

