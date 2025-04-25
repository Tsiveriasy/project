import type React from "react"
import { Clock, GraduationCap, Globe, Building } from "lucide-react"
import { Link } from "react-router-dom"
import type { Program } from "../services/api-services"

interface ProgramCardProps {
  program: Program
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const {
    id,
    name,
    university_name,
    degree_level,
    duration,
    language,
    tuition_fees,
    description,
  } = program

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {degree_level}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Building className="h-5 w-5 mr-2 text-blue-600" />
            <span>{university_name}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            <span>{duration}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            <span>{language}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
            <span>{tuition_fees?.toLocaleString()}€/an</span>
          </div>
        </div>

        {description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        )}

        <Link
          to={`/programs/${id}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          En savoir plus
        </Link>
      </div>
    </div>
  )
}

export default ProgramCard
