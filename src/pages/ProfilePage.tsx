"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/api-services'
import { UserProfile } from '../types/user'
import { ProfileDirectUpdateData } from '../services/api-services'
import { AlertCircle, Edit2, Save, User, Mail, Phone, MapPin, BookOpen, School, Heart, Star, FileText } from 'lucide-react'
import TranscriptUpload from '../components/TranscriptUpload'
import { Link } from 'react-router-dom'

const ProfilePage: React.FC = () => {
  const { user, loading, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [editedData, setEditedData] = useState<Partial<UserProfile>>({})
  const [savedItems, setSavedItems] = useState<{
    universities: any[]
    programs: any[]
  }>({
    universities: [],
    programs: []
  })
  const [transcriptFiles, setTranscriptFiles] = useState<any[]>([])

  const fetchProfileData = async (forceRefresh = false) => {
    if (!user) {
      setError("Utilisateur non connecté")
      setIsLoading(false)
      return
    }

    try {
      // Si on force le rafraîchissement, on vide le cache du local storage
      if (forceRefresh) {
        console.log("Forçage du rafraîchissement des données de profil - suppression du cache");
        // On supprime uniquement les données utilisateur du localStorage, pas le token
        localStorage.removeItem("user");
      }
      
      const profileData = await userService.getCurrentUser(forceRefresh)
      
      if (!profileData) {
        setError("Impossible de charger les données du profil")
        setIsLoading(false)
        return
      }

      console.log("Raw profile data:", profileData);
      console.log("Profile details - address:", profileData.profile?.address);
      console.log("Profile details - phone:", profileData.profile?.phone);
      console.log("Profile details - transcript files:", profileData.profile?.transcript_files);
      
      // Correction explicite pour le nom - en utilisant first_name et last_name
      let fullName = '';
      if (profileData.first_name && profileData.last_name) {
        fullName = `${profileData.first_name} ${profileData.last_name}`;
      } else if (profileData.name) {
        fullName = profileData.name;
      } else if (profileData.username) {
        fullName = profileData.username;
      } else if (profileData.email) {
        fullName = profileData.email.split('@')[0];
      }

      const userProfile: UserProfile = {
        name: fullName,
        email: profileData.email || '',
        phone: profileData.profile?.phone || '',
        location: profileData.profile?.address || '',
        bio: profileData.profile?.bio || '',
        interests: profileData.profile?.interests || [],
        savedUniversities: profileData.saved_universities || [],
        savedPrograms: profileData.saved_programs || [],
        educationLevel: profileData.profile?.education_level || '',
        currentUniversity: profileData.profile?.current_university || '',
        role: profileData.is_admin ? 'admin' : 'student',
        academicRecords: profileData.profile?.academic_records || [],
        testResults: profileData.test_results || null
      }

      console.log("Processed user profile:", userProfile);
      
      // Récupérer les fichiers de relevés de notes s'ils existent
      if (profileData.profile?.transcript_files) {
        setTranscriptFiles(profileData.profile.transcript_files);
      }
      
      setUserData(userProfile)
      setEditedData(userProfile)
      setError(null)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setError("Une erreur est survenue lors du chargement de votre profil")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSavedItems = async () => {
    if (!user) return
    
    try {
      // Utiliser le service API au lieu de fetch directement
      console.log("Attempting to fetch saved items using userService.getSavedItems");
      const data = await userService.getSavedItems();
      console.log("Received saved items data:", data);
      
      setSavedItems({
        universities: data.saved_universities || [],
        programs: data.saved_programs || []
      });
    } catch (err) {
      console.error('Error fetching saved items:', err)
    }
  }

  useEffect(() => {
    if (user && !loading) {
      fetchProfileData()
      fetchSavedItems()
    }
  }, [user, loading])

  const handleSave = async () => {
    if (!userData) return

    try {
      setIsLoading(true)
      
      // Get the current values from editedData
      console.log("Current edited data:", editedData);
      
      // Create update data avec la structure correcte attendue par le service API
      const updateData: ProfileDirectUpdateData = {
        first_name: editedData.name?.split(' ')[0] || '',
        last_name: editedData.name?.split(' ').slice(1).join(' ') || '',
        phone: editedData.phone || '',
        address: editedData.location || '',
        bio: editedData.bio || '',
        interests: editedData.interests || [],
        education_level: editedData.educationLevel || '',
        current_university: editedData.currentUniversity || '',
        academic_records: editedData.academicRecords || []
      }

      console.log("Attempting to update profile with:", updateData);
      
      try {
        // Appeler directement le service userService pour la mise à jour
        console.log("Sending direct API request...");
        const updatedUser = await userService.updateProfile(updateData);
        console.log("Direct API update response:", updatedUser);
        
        if (updatedUser) {
          // Actualiser les données locales en forçant le rafraîchissement
          await fetchProfileData(true);
          
          // Show success message
          const successMessage = document.createElement('div')
          successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
          successMessage.textContent = 'Profil mis à jour avec succès'
          document.body.appendChild(successMessage)
          setTimeout(() => successMessage.remove(), 3000)
          
          setIsEditing(false)
        }
      } catch (err) {
        console.error("Direct API update failed:", err);
        setError("Échec de la mise à jour du profil via l'API directe. Tentative avec le contexte d'authentification...");
        
        // Fallback au contexte d'authentification si l'API directe échoue
        const success = await updateProfile(updateData);
        
        if (success) {
          // Récupérer les données mises à jour
          await fetchProfileData(true);
          
          // Show success message
          const successMessage = document.createElement('div')
          successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
          successMessage.textContent = 'Profil mis à jour avec succès'
          document.body.appendChild(successMessage)
          setTimeout(() => successMessage.remove(), 3000)
        } else {
          setError("Une erreur est survenue lors de la mise à jour de votre profil");
        }
        
        setIsEditing(false)
      }
      
    } catch (err: any) {
      console.error("Error updating profile:", err)
      console.error("Error response:", err.response?.data)
      setError(err.response?.data?.detail || "Une erreur est survenue lors de la mise à jour de votre profil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-900">Veuillez vous connecter pour accéder à votre profil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* En-tête du profil */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-16">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      isEditing 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-white text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-5 h-5" />
                        Enregistrer
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-5 h-5" />
                        Modifier
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 mr-2 text-indigo-600" />
                        Nom
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{userData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 mr-2 text-indigo-600" />
                        Email
                      </label>
                      <p className="text-gray-900">{userData.email}</p>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 mr-2 text-indigo-600" />
                        Téléphone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      ) : (
                        <p className="text-gray-900">{userData.phone || 'Non renseigné'}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                        Localisation
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      ) : (
                        <p className="text-gray-900">{userData.location || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                        Niveau d'études
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.educationLevel || ''}
                          onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      ) : (
                        <p className="text-gray-900">{userData.educationLevel || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <School className="w-4 h-4 mr-2 text-indigo-600" />
                        Université actuelle
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.currentUniversity || ''}
                          onChange={(e) => handleInputChange('currentUniversity', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      ) : (
                        <p className="text-gray-900">{userData.currentUniversity || 'Non renseigné'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Heart className="w-4 h-4 mr-2 text-indigo-600" />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.bio || 'Non renseigné'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Centres d'intérêt */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-indigo-600" />
                Centres d'intérêt
              </h2>
              {isEditing ? (
                <textarea
                  value={editedData.interests?.join(', ') || ''}
                  onChange={(e) => handleInputChange('interests', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="Séparez vos centres d'intérêt par des virgules"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  rows={3}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userData.interests && userData.interests.length > 0 ? (
                    userData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Aucun centre d'intérêt renseigné</p>
                  )}
                </div>
              )}
            </div>

            {/* Relevé de notes */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Relevé de notes
              </h2>
              <TranscriptUpload
                onTranscriptImport={(data) => {
                  setEditedData(prev => ({
                    ...prev,
                    academicRecords: data
                  }))
                  if (!isEditing) {
                    setIsEditing(true)
                  }
                }}
                existingFiles={transcriptFiles}
                isEditing={isEditing}
              />
              {userData.academicRecords && 
               userData.academicRecords.length > 0 && 
               userData.academicRecords.some(record => record.courses && record.courses.length > 0) && (
                <div className="mt-6 space-y-4">
                  {userData.academicRecords
                    .filter(record => record.courses && record.courses.length > 0)
                    .map((record, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">
                          {record.year} - {record.semester}
                        </h3>
                        <span className="text-sm font-medium text-indigo-600">
                          GPA: {record.gpa.toFixed(2)}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {record.courses.map((course, courseIndex) => (
                          <div key={courseIndex} className="py-2 flex justify-between">
                            <span className="text-gray-900">{course.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">{course.credits} crédits</span>
                              <span className="font-medium text-gray-900">{course.grade}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favoris */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Star className="w-5 h-5 mr-2 text-indigo-600" />
                Mes favoris
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Universités favorites */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Universités</h3>
                  {savedItems.universities.length > 0 ? (
                    <div className="space-y-3">
                      {savedItems.universities.map((uni) => (
                        <Link
                          key={uni.id}
                          to={`/universities/${uni.id}`}
                          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {uni.image_url && (
                              <img
                                src={uni.image_url}
                                alt={uni.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{uni.name}</h4>
                              <p className="text-sm text-gray-600">{uni.location}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucune université en favoris</p>
                  )}
                </div>

                {/* Programmes favoris */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Programmes</h3>
                  {savedItems.programs.length > 0 ? (
                    <div className="space-y-3">
                      {savedItems.programs.map((program) => (
                        <Link
                          key={program.id}
                          to={`/programs/${program.id}`}
                          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <h4 className="font-medium text-gray-900">{program.name}</h4>
                          <p className="text-sm text-gray-600">{program.university_name}</p>
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <School className="w-4 h-4" />
                            <span>{program.degree_level}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucun programme en favoris</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ProfilePage
