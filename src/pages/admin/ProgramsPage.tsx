import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProgramsPage: React.FC = () => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample programs data
  const programs = [
    {
      id: 1,
      title: 'Master en Droit des Affaires',
      university: 'Université Paris-Sorbonne',
      field: 'Droit',
      level: 'Master',
      duration: '2 ans',
      studentCount: 120,
      status: 'active'
    },
    {
      id: 2,
      title: 'Diplôme d\'Ingénieur en Informatique',
      university: 'École Polytechnique',
      field: 'Informatique',
      level: 'Bac+5',
      duration: '3 ans',
      studentCount: 85,
      status: 'active'
    },
    {
      id: 3,
      title: 'MBA Management International',
      university: 'HEC Paris',
      field: 'Commerce',
      level: 'Master',
      duration: '16 mois',
      studentCount: 65,
      status: 'active'
    },
    {
      id: 4,
      title: 'Licence en Sciences Politiques',
      university: 'Sciences Po Paris',
      field: 'Sciences Politiques',
      level: 'Licence',
      duration: '3 ans',
      studentCount: 150,
      status: 'active'
    },
    {
      id: 5,
      title: 'Master en Biologie Moléculaire',
      university: 'Université de Lyon',
      field: 'Sciences',
      level: 'Master',
      duration: '2 ans',
      studentCount: 45,
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
    if (selectedPrograms.length === programs.length) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms(programs.map(program => program.id));
    }
  };

  const toggleSelectProgram = (programId: number) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter(id => id !== programId));
    } else {
      setSelectedPrograms([...selectedPrograms, programId]);
    }
  };

  const filteredPrograms = programs.filter(program => 
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des formations</h1>
          <p className="text-gray-600">Gérez les programmes d'études disponibles sur la plateforme</p>
        </div>
        <Link 
          to="/admin/programs/add" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une formation
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Rechercher une formation..."
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
              <option value="">Tous les niveaux</option>
              <option value="licence">Licence (Bac+3)</option>
              <option value="master">Master (Bac+5)</option>
              <option value="doctorat">Doctorat (Bac+8)</option>
            </select>
            
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les domaines</option>
              <option value="droit">Droit</option>
              <option value="informatique">Informatique</option>
              <option value="commerce">Commerce</option>
              <option value="sciences">Sciences</option>
            </select>
          </div>
        </div>
      </div>

      {/* Programs table */}
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
                      checked={selectedPrograms.length === programs.length}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('title')}
                  >
                    Titre
                    {getSortIcon('title')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('university')}
                  >
                    Université
                    {getSortIcon('university')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('field')}
                  >
                    Domaine
                    {getSortIcon('field')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('level')}
                  >
                    Niveau
                    {getSortIcon('level')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('duration')}
                  >
                    Durée
                    {getSortIcon('duration')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('studentCount')}
                  >
                    Étudiants
                    {getSortIcon('studentCount')}
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
              {filteredPrograms.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedPrograms.includes(program.id)}
                      onChange={() => toggleSelectProgram(program.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{program.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{program.university}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{program.field}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{program.level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{program.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {program.studentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      program.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {program.status === 'active' ? 'Actif' : 'Inactif'}
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
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredPrograms.length}</span> sur <span className="font-medium">{programs.length}</span> formations
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

export default ProgramsPage;