"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  MapPin,
  Users,
  BookOpen,
  Star,
  Clock,
  GraduationCap,
  Heart,
  Share,
  ExternalLink,
  Mail,
  Phone,
  Globe,
} from "lucide-react"
import { universityService } from "../services/api-services"

interface Program {
  id: number
  name: string
  description: string
  duration: string
  degree_level: string
  admission_requirements: { requirements: string[] }
  tuition_fees: number
  language: string
}

// Modifier l'interface University locale pour correspondre à celle importée
interface University {
  id: number
  name: string
  location: string
  type: string
  description: string
  image_url?: string // Rendre optionnel pour correspondre à l'interface importée
  website: string
  rating: number
  student_count: string
  program_count: number
  specialties: string[]
  facilities: string[]
  research_focus: string[]
  international_partnerships: string[]
  employment_rate: number
  admission_requirements: string[]
  academic_calendar: {
    start_date: string
    end_date: string
    application_deadline: string
  }
  contact_info: {
    address: string
    phone: string
    email: string
  }
  programs: Program[]
}

const UniversityDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [university, setUniversity] = useState<University | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchUniversity = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await universityService.getById(Number.parseInt(id))
        setUniversity(data as University) // Utiliser une conversion de type explicite
      } catch (err) {
        console.error(`Erreur lors de la récupération de l'université ${id}:`, err)
        setError(`Impossible de charger les détails de l'université. Veuillez réessayer plus tard.`)
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUniversity()
  }, [id])

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !university) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || "Université non trouvée"}
          </div>
          <Link to="/universities" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
            Retour à la liste des universités
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section with university image */}
      <div className="relative h-80 bg-blue-800">
        <img
          src={university.image_url || "/placeholder.svg"}
          alt={university.name}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{university.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{university.location}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span>{university.rating.toFixed(1)} / 5</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-1" />
                <span>{university.student_count} étudiants</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-1" />
                <span>{university.program_count} formations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Main content */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Présentation
                </button>
                <button
                  onClick={() => setActiveTab("programs")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "programs"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Formations
                </button>
                <button
                  onClick={() => setActiveTab("admissions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "admissions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Admissions
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "reviews"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Avis
                </button>
              </nav>
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">À propos de {university.name}</h2>
                <p className="text-gray-600 mb-6">
                  {university.description ||
                    `${university.name} est une institution d'enseignement supérieur renommée située à ${university.location}. Fondée il y a plusieurs décennies, elle s'est imposée comme un établissement de référence dans le paysage académique français. Avec plus de ${university.student_count} étudiants et ${university.program_count} formations, elle offre un environnement d'apprentissage stimulant et diversifié.`}
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Points forts</h3>
                <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
                  <li>Excellence académique reconnue au niveau national et international</li>
                  <li>Corps enseignant composé d'experts et de chercheurs de renom</li>
                  <li>Infrastructures modernes et équipements de pointe</li>
                  <li>Partenariats avec des entreprises et des institutions prestigieuses</li>
                  <li>Réseau d'anciens élèves influent dans divers secteurs</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Campus et installations</h3>
                <p className="text-gray-600 mb-6">
                  Le campus principal s'étend sur plusieurs hectares et offre un cadre d'études idéal. Les étudiants
                  bénéficient d'installations modernes comprenant des bibliothèques bien fournies, des laboratoires
                  équipés des dernières technologies, des espaces de coworking, des installations sportives et des
                  résidences universitaires confortables.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    alt="Campus"
                    className="rounded-lg w-full h-48 object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1519452575417-564c1401ecc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    alt="Bibliothèque"
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Vie étudiante</h3>
                <p className="text-gray-600">
                  La vie étudiante est riche et dynamique, avec de nombreuses associations et clubs couvrant des
                  domaines variés : sports, arts, culture, entrepreneuriat, etc. Des événements réguliers (conférences,
                  festivals, compétitions sportives) rythment l'année universitaire et favorisent les échanges entre
                  étudiants.
                </p>
              </div>
            )}

            {activeTab === "programs" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Formations proposées</h2>
                <div className="space-y-6">
                  {university.programs?.map((program) => (
                    <div key={program.id} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">{program.name}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center">
                          <GraduationCap className="h-5 w-5 text-blue-500 mr-2" />
                          <span>Niveau : {program.degree_level}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-blue-500 mr-2" />
                          <span>Durée : {program.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-blue-500 mr-2">€</span>
                          <span>Frais : {program.tuition_fees?.toLocaleString("fr-FR")} Ar/an</span>
                        </div>
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-blue-500 mr-2" />
                          <span>Langue : {program.language}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Description :</h4>
                        <p className="text-gray-600">{program.description}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Conditions d'admission :</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {program.admission_requirements?.requirements?.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          Postuler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "admissions" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Procédure d'admission</h2>
                <p className="text-gray-600 mb-6">
                  Les procédures d'admission varient selon le niveau d'études et la formation choisie. Voici les
                  informations générales pour vous guider dans votre candidature.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Calendrier d'admission</h3>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium mr-3 mt-0.5">
                        Janv-Mars
                      </div>
                      <div>
                        <p className="font-medium">Dépôt des candidatures</p>
                        <p className="text-sm text-gray-600">Soumission des dossiers via la plateforme en ligne</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium mr-3 mt-0.5">
                        Avril
                      </div>
                      <div>
                        <p className="font-medium">Étude des dossiers</p>
                        <p className="text-sm text-gray-600">Présélection des candidats</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium mr-3 mt-0.5">
                        Mai
                      </div>
                      <div>
                        <p className="font-medium">Entretiens</p>
                        <p className="text-sm text-gray-600">Pour les candidats présélectionnés</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium mr-3 mt-0.5">
                        Juin
                      </div>
                      <div>
                        <p className="font-medium">Résultats d'admission</p>
                        <p className="text-sm text-gray-600">Communication des décisions aux candidats</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Documents requis</h3>
                <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
                  <li>Formulaire de candidature complété</li>
                  <li>CV détaillé</li>
                  <li>Lettre de motivation</li>
                  <li>Relevés de notes des trois dernières années</li>
                  <li>Diplômes obtenus (ou attestation de réussite)</li>
                  <li>Lettres de recommandation (pour certaines formations)</li>
                  <li>Résultats de tests standardisés (TOEFL, GMAT, etc. selon la formation)</li>
                  <li>Pièce d'identité</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Frais de scolarité</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Niveau
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Étudiants français/UE
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Étudiants internationaux
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Licence</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">170€ - 2 770€ / an</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 770€ - 3 770€ / an</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Master</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">243€ - 3 770€ / an</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 770€ - 5 000€ / an</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Doctorat</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">380€ / an</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">380€ / an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-gray-600 mb-6">
                  Des bourses et aides financières sont disponibles selon les critères sociaux et d'excellence
                  académique. Consultez le service des bourses de l'université pour plus d'informations.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 flex items-start">
                  <ExternalLink className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Pour plus d'informations</p>
                    <p className="text-gray-600 mb-2">
                      Consultez le site officiel de l'université ou contactez le service des admissions.
                    </p>
                    <a href="#" className="text-blue-600 hover:underline">
                      Visiter le site des admissions
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Avis des étudiants</h2>
                <p className="text-gray-600 mb-6">
                  Découvrez ce que les étudiants actuels et anciens pensent de {university.name}.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{university.rating.toFixed(1)} / 5</p>
                      <p className="text-gray-600">Note moyenne basée sur 120 avis</p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${star <= Math.round(university.rating) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">5 étoiles</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="w-10 text-sm text-gray-600">65%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">4 étoiles</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-400 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                      <span className="w-10 text-sm text-gray-600">20%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">3 étoiles</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-yellow-400 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                      <span className="w-10 text-sm text-gray-600">10%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">2 étoiles</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-400 rounded-full" style={{ width: "3%" }}></div>
                      </div>
                      <span className="w-10 text-sm text-gray-600">3%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">1 étoile</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-red-400 rounded-full" style={{ width: "2%" }}></div>
                      </div>
                      <span className="w-10 text-sm text-gray-600">2%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Sample reviews - would be replaced with actual data from API */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                          alt="Sophie Martin"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">Sophie Martin</p>
                          <p className="text-sm text-gray-500">Étudiante en Master</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= 5 ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Une excellente université avec des professeurs passionnés et compétents. Les cours sont stimulants
                      et les infrastructures modernes. J'ai particulièrement apprécié les opportunités de stage et les
                      partenariats internationaux.
                    </p>
                    <p className="text-sm text-gray-500">Publié le 15 mars 2025</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                          alt="Thomas Dubois"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">Thomas Dubois</p>
                          <p className="text-sm text-gray-500">Ancien étudiant</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">
                      J'ai passé 5 années formidables dans cette université. La qualité de l'enseignement est très bonne
                      et le réseau professionnel est un vrai plus pour trouver un emploi après les études. Seul bémol :
                      certains bâtiments mériteraient d'être rénovés.
                    </p>
                    <p className="text-sm text-gray-500">Publié le 2 février 2025</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                          alt="Léa Bernard"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">Léa Bernard</p>
                          <p className="text-sm text-gray-500">Étudiante en Licence</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= 5 ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Je suis très satisfaite de mon expérience à l'université. L'ambiance est studieuse mais
                      conviviale, et les associations étudiantes proposent de nombreuses activités. Les professeurs sont
                      disponibles et à l'écoute des étudiants.
                    </p>
                    <p className="text-sm text-gray-500">Publié le 20 janvier 2025</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                    Voir plus d'avis
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Sidebar */}
          <div className="lg:w-1/3">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col space-y-4">
                <button className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors">
                  <Heart className="h-5 w-5 mr-2" />
                  Sauvegarder
                </button>
                <button className="flex items-center justify-center border border-blue-600 text-blue-600 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors">
                  <Share className="h-5 w-5 mr-2" />
                  Partager
                </button>
                <a
                  href="#"
                  className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Visiter le site officiel
                </a>
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <span className="text-gray-600">{university.contact_info.address}</span>
                </li>
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <a href={`mailto:${university.contact_info.email}`} className="text-blue-600 hover:underline">
                    {university.contact_info.email}
                  </a>
                </li>
                <li className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <a href={`tel:${university.contact_info.phone}`} className="text-blue-600 hover:underline">
                    {university.contact_info.phone}
                  </a>
                </li>
              </ul>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Localisation</h3>
              <div className="h-64 bg-gray-200 rounded-lg mb-3">
                {/* Map would be integrated here */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">Carte interactive</div>
              </div>
              <a href="#" className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener noreferrer">
                Voir sur Google Maps
              </a>
            </div>

            {/* Upcoming events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Événements à venir</h3>
              <ul className="space-y-4">
                <li className="border-b border-gray-100 pb-3">
                  <p className="font-medium text-gray-800">Journée Portes Ouvertes</p>
                  <p className="text-sm text-gray-600 mb-1">15 mai 2025 • 10:00 - 17:00</p>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    Plus d'infos
                  </a>
                </li>
                <li className="border-b border-gray-100 pb-3">
                  <p className="font-medium text-gray-800">Conférence sur l'Intelligence Artificielle</p>
                  <p className="text-sm text-gray-600 mb-1">22 mai 2025 • 14:00 - 16:30</p>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    Plus d'infos
                  </a>
                </li>
                <li>
                  <p className="font-medium text-gray-800">Forum des Métiers</p>
                  <p className="text-sm text-gray-600 mb-1">5 juin 2025 • 09:00 - 18:00</p>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    Plus d'infos
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UniversityDetailPage

