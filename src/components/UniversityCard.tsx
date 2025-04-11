import type React from "react"
import { MapPin, Users, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"
import type { University } from "../services/api-services"

interface UniversityCardProps {
  university?: University
  id?: number
  name?: string
  location?: string
  image_url?: string
  ranking?: number
  student_count?: number | string
  programs_count?: number
  success_rate?: number
}

const UniversityCard: React.FC<UniversityCardProps> = (props) => {
  // Si un objet university complet est fourni, l'utiliser, sinon utiliser les propriétés individuelles
  const university =
    props.university ||
    ({
      id: props.id,
      name: props.name || "",
      location: props.location || "",
      image_url: props.image_url,
      rating: props.ranking || 0,
      student_count: props.student_count?.toString() || "0",
      program_count: props.programs_count || 0,
      employment_rate: props.success_rate || 0,
    } as University)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full flex flex-col">
      <div className="relative">
        <img
          src={university.image_url || university.image || "/placeholder.svg?height=300&width=400"}
          alt={university.name}
          className="w-full h-52 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=300&width=400"
          }}
        />
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg font-medium">
          #{university.rating || "N/A"}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{university.name}</h3>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
          <span className="text-sm">{university.location || "Emplacement non spécifié"}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-full mr-3">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Étudiants</p>
              <p className="font-semibold">{university.student_count || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-full mr-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Formations</p>
              <p className="font-semibold">{university.program_count || 0}</p>
            </div>
          </div>
        </div>

        {university.employment_rate !== undefined && (
          <div className="mb-5 mt-auto">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">Taux de réussite</span>
              <span className="font-bold text-blue-600">{university.employment_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  university.employment_rate >= 70
                    ? "bg-green-500"
                    : university.employment_rate >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${university.employment_rate}%` }}
              />
            </div>
          </div>
        )}

        <Link
          to={`/universities/${university.id}`}
          className="mt-auto block w-full bg-blue-600 text-white py-2.5 text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Voir le détail
        </Link>
      </div>
    </div>
  )
}

export default UniversityCard

