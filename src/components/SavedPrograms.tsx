import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, MapPin, Award } from "lucide-react"
import { userService, programService } from "../services/api-services"
import type { Program } from "../services/api-services"

export const SavedPrograms = () => {
  const [savedPrograms, setSavedPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedPrograms = async () => {
      try {
        const { savedPrograms } = await userService.getSavedItems()
        if (!savedPrograms || savedPrograms.length === 0) {
          setSavedPrograms([])
          setIsLoading(false)
          return
        }

        // Fetch details for each saved program ID
        const programsData = await Promise.all(
          savedPrograms.map((id: number) => programService.getById(id))
        )
        setSavedPrograms(programsData)
      } catch (err) {
        console.error("Erreur lors de la récupération des programmes sauvegardés:", err)
        setError("Impossible de charger les programmes sauvegardés")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedPrograms()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    )
  }

  if (savedPrograms.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Vous n'avez pas encore sauvegardé de programmes</p>
        <Link to="/programs" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Découvrir les programmes
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {savedPrograms.map((program) => (
        <Link
          key={program.id}
          to={`/programs/${program.id}`}
          className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{program.description.substring(0, 100)}...</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{program.university_name}</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>{program.degree_level}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>{program.duration}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default SavedPrograms
