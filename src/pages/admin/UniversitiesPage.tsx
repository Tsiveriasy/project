import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const UniversitiesPage: React.FC = () => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample universities data
  const universities = [
    {
      id: 1,
      name: 'Université Paris-Sorbonne',
      location: 'Paris, France',
      type: 'Université publique',
      programCount: 120,
      studentCount: '45,000+',
      rating: 4.7,
      status: 'active'
    },
    {
      id: 2,
      name: 'École Polytechnique',
      location: 'Palaiseau, France',
      type: 'Grande école',
      programCount: 35,
      studentCount: '3,000+',
      rating: 4.8,
      status: 'active'
    },
    {
      id: 3,
      name: 'HEC Paris',
      location: 'Jouy-en-Josas, France',
      type: 'École de commerce',
      programCount: 40,
      studentCount: '4,500+',
      rating: 4.9,
      status: 'active'
    },
    {
      id: 4,
      name: 'Sciences Po Paris',
      location: 'Paris, France',
      type: 'Grande école',
      programCount: 50,
      studentCount: '14,000+',
      rating: 4.6,
      status: 'active'
    },
    {
      id: 5,
      name: 'Université de Lyon',
      location: 'Lyon, France',
      type: 'Université publique',
      programCount: 90,
      studentCount: '35,000+',
      rating: 4.5,
      status: 'active'
    }
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const toggleSelectAll = () => {
    if (selectedUniversities.length === universities.length) {
      setSelectedUniversities([]);
    } else {
      setSelectedUniversities(universities.map(uni => uni.id));
    }
  };

  const toggleSelectUniversity = (uniId: number) => {
    if (selectedUniversities.includes(uniId)) {
      setSelectedUniversities(selectedUniversities.filter(id => id !== uniId));
    } else {
      setSelectedUniversities([...selectedUniversities, uniId]);
    }
  };

  const filteredUniversities = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des universités</h1>
          <p className="text-gray-600">Gérez les établissements d'enseignement supérieur</p>
        </div>
        <Link 
          to="/admin/universities/add" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une université
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Rechercher une université..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              <span>Filtrer</span>
            </button>
            
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les types</option>
              <option value="public">Université publique</option>
              <option value="grande-ecole">Grande école</option>
              <option value="commerce">École de commerce</option>
              <option value="ingenieur">École d'ingénieur</option>
            </select>
            
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Toutes les localisations</option>
              <option value="paris">Paris</option>
              <option value="lyon">Lyon</option>
              <option value="marseille">Marseille</option>
              <option value="toulouse">Toulouse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Universities table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedUniversities.length === universities.length}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('name')}
                  >
                    Nom
                    {getSortIcon('name')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('location')}
                  >
                    Localisation
                    {getSortIcon('location')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('type')}
                  >
                    Type
                    {getSortIcon('type')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('programCount')}
                  >
                    Formations
                    {getSortIcon('programCount')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('rating')}
                  >
                    Note
                    {getSortIcon('rating')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('status')}
                  >
                    Statut
                    {getSortIcon('status')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUniversities.map((university) => (
                <tr key={university.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedUniversities.includes(university.id)}
                      onChange={() => toggleSelectUniversity(university.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{university.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{university.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{university.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {university.programCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{university.rating.toFixed(1)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      university.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {university.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Précédent
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredUniversities.length}</span> sur <span className="font-medium">{universities.length}</span> universités
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Précédent
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversitiesPage;