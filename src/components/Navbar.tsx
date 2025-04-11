"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, ChevronDown, GraduationCap, Search, User, LogOut, Settings } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { searchService } from "../services/api-services"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length >= 2) {
      setIsSearching(true)
      try {
        const results = await searchService.globalSearch(value)
        setSearchResults(results)
      } catch (error) {
        console.error("Erreur de recherche:", error)
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchResults(null)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
      setSearchResults(null)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">OrientationU</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button 
                onClick={() => toggleDropdown('universities')}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Universités</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === 'universities' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'universities' && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                  <Link 
                    to="/universities" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Toutes les universités
                  </Link>
                  <Link 
                    to="/universities?type=public" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Universités publiques
                  </Link>
                  <Link 
                    to="/universities?type=private" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Universités privées
                  </Link>
                </div>
              )}
            </div>

            <div className="relative group">
              <button 
                onClick={() => toggleDropdown('programs')}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Formations</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === 'programs' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'programs' && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                  <Link 
                    to="/programs" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Toutes les formations
                  </Link>
                  <Link 
                    to="/programs?level=bachelor" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Licence
                  </Link>
                  <Link 
                    to="/programs?level=master" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Master
                  </Link>
                  <Link 
                    to="/programs?level=doctorate" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Doctorat
                  </Link>
                </div>
              )}
            </div>

            <Link to="/orientation-test" className="text-gray-700 hover:text-blue-600 transition-colors">
              Test d'orientation
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-64 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
            {searchResults && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <span className="text-gray-500">Recherche en cours...</span>
                  </div>
                ) : searchResults.universities?.length === 0 && searchResults.programs?.length === 0 ? (
                  <div className="p-4 text-center">
                    <span className="text-gray-500">Aucun résultat trouvé</span>
                  </div>
                ) : (
                  <>
                    {searchResults.universities?.length > 0 && (
                      <div>
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Universités</h3>
                        <ul>
                          {searchResults.universities.map((uni: any) => (
                            <li key={uni.id}>
                              <Link
                                to={`/universities/${uni.id}`}
                                className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                                onClick={() => setSearchResults(null)}
                              >
                                {uni.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {searchResults.programs?.length > 0 && (
                      <div>
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Formations</h3>
                        <ul>
                          {searchResults.programs.map((prog: any) => (
                            <li key={prog.id}>
                              <Link
                                to={`/programs/${prog.id}`}
                                className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                                onClick={() => setSearchResults(null)}
                              >
                                {prog.name} - {prog.university.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.name || 'Profil'}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon profil
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4">
          <div className="mb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>
          
          <nav className="flex flex-col space-y-4">
            <div>
              <button
                onClick={() => toggleDropdown('mobileUniversities')}
                className="flex items-center justify-between w-full py-2 text-gray-700"
              >
                <span>Universités</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === 'mobileUniversities' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobileUniversities' && (
                <div className="pl-4 mt-2 space-y-2">
                  <Link
                    to="/universities"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Toutes les universités
                  </Link>
                  <Link
                    to="/universities?type=public"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Universités publiques
                  </Link>
                  <Link
                    to="/universities?type=private"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Universités privées
                  </Link>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleDropdown('mobilePrograms')}
                className="flex items-center justify-between w-full py-2 text-gray-700"
              >
                <span>Formations</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === 'mobilePrograms' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobilePrograms' && (
                <div className="pl-4 mt-2 space-y-2">
                  <Link
                    to="/programs"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Toutes les formations
                  </Link>
                  <Link
                    to="/programs?level=bachelor"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Licence
                  </Link>
                  <Link
                    to="/programs?level=master"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Master
                  </Link>
                  <Link
                    to="/programs?level=doctorate"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Doctorat
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/orientation-test"
              className="block py-2 text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Test d'orientation
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon profil
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-700"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block py-2 text-center text-gray-700 border border-gray-300 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-center bg-blue-600 text-white rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
