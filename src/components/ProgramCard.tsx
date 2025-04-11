import type React from "react"
import { MapPin, Users, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"

interface UniversityCardProps {
  id: number
  name: string
  location: string
  image_url: string
  ranking: number
  student_count: number
  programs_count: number
  success_rate?: number
}

const UniversityCard: React.FC<UniversityCardProps> = ({
  id,
  name,
  location,
  image_url,
  ranking,
  student_count,
  programs_count,
  success_rate,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full flex flex-col">
      <div className="relative">
        <img
          src={image_url || "/placeholder.svg?height=300&width=400"}
          alt={name}
          className="w-full h-52 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=300&width=400"
          }}
        />
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg font-medium">
          #{ranking || "N/A"}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{name}</h3>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
          <span className="text-sm">{location || "Emplacement non spécifié"}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-full mr-3">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Étudiants</p>
              <p className="font-semibold">
                {typeof student_count === "number" ? student_count.toLocaleString() : student_count || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-full mr-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Formations</p>
              <p className="font-semibold">{programs_count || 0}</p>
            </div>
          </div>
        </div>

        {success_rate !== undefined && (
          <div className="mb-5 mt-auto">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">Taux de réussite</span>
              <span className="font-bold text-blue-600">{success_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  success_rate >= 70 ? "bg-green-500" : success_rate >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${success_rate}%` }}
              />
            </div>
          </div>
        )}

        <Link
          to={`/universities/${id}`}
          className="mt-auto block w-full bg-blue-600 text-white py-2.5 text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Voir le détail
        </Link>
      </div>
    </div>
  )
}

export default UniversityCard

