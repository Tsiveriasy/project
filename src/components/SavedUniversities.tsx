import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { MapPin, Users, Star } from "lucide-react"
import { userService, universityService } from "../services/api-services"
import type { University } from "../services/api-services"

export const SavedUniversities = () => {
  const [savedUniversities, setSavedUniversities] = useState<University[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedUniversities = async () => {
      try {
        const { savedUniversities } = await userService.getSavedItems()
        if (!savedUniversities || savedUniversities.length === 0) {
          setSavedUniversities([])
          setIsLoading(false)
          return
        }

        // Fetch details for each saved university ID
        const universitiesData = await Promise.all(
          savedUniversities.map((id: number) => universityService.getById(id))
        )
        setSavedUniversities(universitiesData)
      } catch (err) {
        console.error("Erreur lors de la récupération des universités sauvegardées:", err)
        setError("Impossible de charger les universités sauvegardées")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedUniversities()
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

  if (savedUniversities.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Vous n'avez pas encore sauvegardé d'universités</p>
        <Link to="/universities" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Découvrir les universités
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {savedUniversities.map((university) => (
        <Link
          key={university.id}
          to={`/universities/${university.id}`}
          className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative h-48">
            <img
              src={university.image_url || "/placeholder.svg"}
              alt={university.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{university.name}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{university.location}</span>
              </div>
              {university.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{university.rating.toFixed(1)} / 5</span>
                </div>
              )}
              {university.student_count && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{university.student_count} étudiants</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default SavedUniversities
