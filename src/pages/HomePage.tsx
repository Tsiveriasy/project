"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { GraduationCap, Users, TrendingUp, Award, MapPin, ArrowRight, Star, School } from "lucide-react"
import { universityService, type University } from "../services/api-services"

const HomePage = () => {
  const [featuredUniversities, setFeaturedUniversities] = useState<University[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchFeaturedUniversities = async () => {
    try {
      setIsLoading(true);
      const universities = await universityService.getFeatured();
      console.log('Universités en vedette:', universities);
      setFeaturedUniversities(universities);
    } catch (error) {
      console.error('Error fetching featured universities:', error);
      setError('Impossible de charger les universités en vedette');
    } finally {
      setIsLoading(false);
    }
  };

  fetchFeaturedUniversities();
}, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Trouvez l'université qui vous correspond</h1>
            <p className="text-xl mb-8">
              Comparez les universités, explorez les programmes et découvrez votre parcours idéal
            </p>
            <div className="flex space-x-4">
              <Link
                to="/orientation"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-300"
              >
                Faire le test d'orientation
              </Link>
              <Link
                to="/search"
                className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
              >
                Explorer les universités
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Universities Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Universités à découvrir</h2>
            <Link to="/universities" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
              Voir toutes <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredUniversities.map((university) => (
                <div
                  key={university.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${university.image_url || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"})`,
                    }}
                  >
                    <div className="flex justify-between p-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Classement #{university.rating || "N/A"}
                      </span>
                      {university.specialties && university.specialties.length > 0 && (
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <Star className="h-3 w-3 mr-1" /> Recommandé
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{university.name}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{university.location}</span>
                    </div>

                    <p className="text-gray-600 mb-6 line-clamp-2">{university.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-500">Étudiants</div>
                          <div className="font-semibold">{university.student_count || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <School className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-500">Programmes</div>
                          <div className="font-semibold">{university.program_count || "N/A"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-500">Taux d'emploi</span>
                        <span className="text-sm font-medium text-gray-700">{university.employment_rate || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${university.employment_rate || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/universities/${university.id}`}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Pourquoi choisir notre plateforme ?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Orientation personnalisée</h3>
              <p className="text-gray-600">
                Un test d'orientation qui analyse vos préférences et compétences pour vous recommander les meilleurs
                parcours.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Données à jour</h3>
              <p className="text-gray-600">
                Des informations récentes et pertinentes sur les universités, les taux d'emploi et les tendances du
                marché.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Universités de qualité</h3>
              <p className="text-gray-600">
                Une sélection des meilleures universités avec des évaluations transparentes et des avis d'étudiants.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Communauté active</h3>
              <p className="text-gray-600">
                Échangez avec d'autres étudiants et professionnels pour obtenir des conseils et partager vos
                expériences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

