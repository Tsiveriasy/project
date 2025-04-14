"use client"

import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  School,
  Edit,
  Save,
  X,
  FileText,
  BarChart2,
  Bookmark,
  BookOpen,
  Building,
  Award,
} from "lucide-react"
import { userService } from "../services/api-services"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"

// Interface pour les résultats de test attendus par le composant
interface TestResult {
  date: string
  recommended_fields: string[]
  recommended_programs: {
    id: number
    name: string
    university_name: string
    match_percentage: number
  }[]
}

interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  interests: string[]
  savedUniversities: number[]
  savedPrograms: number[]
  educationLevel: string
  currentUniversity: string
  role: string // Changé de "admin" | "student" | "teacher" à string
  academicRecords: {
    year: string
    semester: string
    gpa: number
    courses: {
      name: string
      grade: string
      credits: number
    }[]
  }[]
  testResults: TestResult | null
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [editedData, setEditedData] = useState<UserProfile | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    if (!user) {
      setError("Utilisateur non connecté")
      setIsLoading(false)
      return
    }

    try {
      const profileData = await userService.getCurrentUser()

      if (!profileData) {
        console.error("Profil utilisateur non disponible")
        setError("Impossible de charger les données du profil. Veuillez vous connecter à nouveau.")
        setIsLoading(false)
        return
      }

      const userProfileData: UserProfile = {
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        phone: profileData.profile?.phone || "",
        location: profileData.profile?.address || "",
        bio: profileData.profile?.bio || "",
        interests: profileData.interests || profileData.profile?.interests || [],
        savedUniversities: profileData.saved_universities || [],
        savedPrograms: profileData.saved_programs || [],
        educationLevel: profileData.education_level || profileData.profile?.education_level || "",
        currentUniversity: profileData.university || profileData.profile?.current_university || "",
        role: profileData.role || "student",
        academicRecords: profileData.profile?.academic_records || [],
        testResults:
          profileData.test_results && profileData.test_results.length > 0 ? profileData.test_results[0] : null,
      }

      setUserData(userProfileData)
      setEditedData(userProfileData)
      setIsLoading(false)
    } catch (err) {
      console.error("Erreur lors de la récupération du profil:", err)
      setError("Une erreur est survenue lors du chargement du profil")
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!editedData) return

    try {
      const [firstName, ...lastNameParts] = editedData.name.split(" ")
      const lastName = lastNameParts.join(" ")

      console.log("Envoi des données de mise à jour:", { firstName, lastName });

      const updatedProfile = await userService.updateProfile({
        firstName,
        lastName,
        profile: {
          phone: editedData.phone,
          address: editedData.location,
          bio: editedData.bio,
          interests: editedData.interests,
          education_level: editedData.educationLevel,
          current_university: editedData.currentUniversity,
          academic_records: editedData.academicRecords,
        },
      })

      console.log("Profil mis à jour reçu:", updatedProfile);

      // Mettre à jour les données locales avec les données du serveur
      const userProfileData: UserProfile = {
        name: `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim(),
        email: updatedProfile.email,
        phone: updatedProfile.profile?.phone || "",
        location: updatedProfile.profile?.address || "",
        bio: updatedProfile.profile?.bio || "",
        interests: updatedProfile.interests || updatedProfile.profile?.interests || [],
        savedUniversities: updatedProfile.saved_universities || [],
        savedPrograms: updatedProfile.saved_programs || [],
        educationLevel: updatedProfile.education_level || updatedProfile.profile?.education_level || "",
        currentUniversity: updatedProfile.university || updatedProfile.profile?.current_university || "",
        role: updatedProfile.role || "student",
        academicRecords: updatedProfile.profile?.academic_records || [],
        testResults: updatedProfile.test_results && updatedProfile.test_results.length > 0 
          ? updatedProfile.test_results[0] 
          : null,
      }

      setUserData(userProfileData)
      setEditedData(userProfileData)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err)
      setError("Une erreur est survenue lors de la sauvegarde du profil")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  if (!userData) {
    return <div className="text-center py-8">Aucune donnée de profil disponible</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profil Utilisateur</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setEditedData(userData)
                  setIsEditing(false)
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.name}
                  onChange={(e) => setEditedData((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <span>{userData.name}</span>
              )}
            </div>

            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-500 mr-2" />
              <span>{userData.email}</span>
            </div>

            <div className="flex items-center">
              <Award className="w-5 h-5 text-gray-500 mr-2" />
              <span>Statut: {userData.role}</span>
            </div>

            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-500 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.phone}
                  onChange={(e) => setEditedData((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <span>{userData.phone || "Non renseigné"}</span>
              )}
            </div>

            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.location}
                  onChange={(e) => setEditedData((prev) => (prev ? { ...prev, location: e.target.value } : null))}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <span>{userData.location || "Non renseigné"}</span>
              )}
            </div>
          </div>

          {/* Éducation et intérêts */}
          <div className="space-y-4">
            <div className="flex items-center">
              <School className="w-5 h-5 text-gray-500 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.educationLevel}
                  onChange={(e) => setEditedData((prev) => (prev ? { ...prev, educationLevel: e.target.value } : null))}
                  className="w-full p-2 border rounded"
                  placeholder="Niveau d'études"
                />
              ) : (
                <span>{userData.educationLevel || "Non renseigné"}</span>
              )}
            </div>

            <div className="flex items-center">
              <Building className="w-5 h-5 text-gray-500 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.currentUniversity}
                  onChange={(e) =>
                    setEditedData((prev) => (prev ? { ...prev, currentUniversity: e.target.value } : null))
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Université actuelle"
                />
              ) : (
                <span>{userData.currentUniversity || "Non renseigné"}</span>
              )}
            </div>

            <div className="flex items-start">
              <BookOpen className="w-5 h-5 text-gray-500 mr-2 mt-2" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Intérêts</label>
                {isEditing ? (
                  <textarea
                    value={editedData?.interests.join(", ")}
                    onChange={(e) =>
                      setEditedData((prev) =>
                        prev ? { ...prev, interests: e.target.value.split(",").map((i) => i.trim()) } : null,
                      )
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Séparez les intérêts par des virgules"
                    rows={3}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Relevés de notes */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Relevés de notes
          </h2>
          {isEditing ? (
            <div className="space-y-4">
              {editedData?.academicRecords.map((record, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      value={record.year}
                      onChange={(e) => {
                        const newRecords = [...editedData.academicRecords]
                        newRecords[index].year = e.target.value
                        setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                      }}
                      className="p-2 border rounded"
                      placeholder="Année"
                    />
                    <input
                      type="text"
                      value={record.semester}
                      onChange={(e) => {
                        const newRecords = [...editedData.academicRecords]
                        newRecords[index].semester = e.target.value
                        setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                      }}
                      className="p-2 border rounded"
                      placeholder="Semestre"
                    />
                    <input
                      type="number"
                      value={record.gpa}
                      onChange={(e) => {
                        const newRecords = [...editedData.academicRecords]
                        newRecords[index].gpa = Number.parseFloat(e.target.value)
                        setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                      }}
                      className="p-2 border rounded"
                      placeholder="Moyenne"
                      step="0.01"
                    />
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Matière</th>
                        <th className="text-left">Note</th>
                        <th className="text-left">Crédits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.courses.map((course, courseIndex) => (
                        <tr key={courseIndex}>
                          <td>
                            <input
                              type="text"
                              value={course.name}
                              onChange={(e) => {
                                const newRecords = [...editedData.academicRecords]
                                newRecords[index].courses[courseIndex].name = e.target.value
                                setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                              }}
                              className="p-2 border rounded w-full"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={course.grade}
                              onChange={(e) => {
                                const newRecords = [...editedData.academicRecords]
                                newRecords[index].courses[courseIndex].grade = e.target.value
                                setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                              }}
                              className="p-2 border rounded w-full"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={course.credits}
                              onChange={(e) => {
                                const newRecords = [...editedData.academicRecords]
                                newRecords[index].courses[courseIndex].credits = Number.parseInt(e.target.value)
                                setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                              }}
                              className="p-2 border rounded w-full"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={() => {
                      const newRecords = [...editedData.academicRecords]
                      newRecords[index].courses.push({
                        name: "",
                        grade: "",
                        credits: 0,
                      })
                      setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ajouter une matière
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newRecords = [...(editedData?.academicRecords || [])]
                  newRecords.push({
                    year: "",
                    semester: "",
                    gpa: 0,
                    courses: [],
                  })
                  setEditedData((prev) => (prev ? { ...prev, academicRecords: newRecords } : null))
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Ajouter un semestre
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {userData.academicRecords.map((record, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {record.year} - {record.semester}
                    </h3>
                    <span className="text-lg font-bold">Moyenne: {record.gpa.toFixed(2)}</span>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Matière</th>
                        <th className="text-left">Note</th>
                        <th className="text-left">Crédits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.courses.map((course, courseIndex) => (
                        <tr key={courseIndex}>
                          <td>{course.name}</td>
                          <td>{course.grade}</td>
                          <td>{course.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test d'orientation */}
        {userData.testResults && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2" />
              Résultats du test d'orientation
            </h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">
                Date du test: {new Date(userData.testResults.date).toLocaleDateString()}
              </p>
              <div className="mb-4">
                <h3 className="font-medium mb-2">Domaines recommandés:</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.testResults.recommended_fields.map((field, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Programmes recommandés:</h3>
                <div className="space-y-2">
                  {userData.testResults.recommended_programs.map((program, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-gray-600">{program.university_name}</p>
                      </div>
                      <span className="text-green-600 font-medium">{program.match_percentage}% de correspondance</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favoris */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Bookmark className="w-5 h-5 mr-2" />
            Favoris
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Universités sauvegardées</h3>
              <p className="text-gray-600">{userData.savedUniversities.length} université(s)</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Programmes sauvegardés</h3>
              <p className="text-gray-600">{userData.savedPrograms.length} programme(s)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
