import React from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, Activity, Calendar } from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Sample data for the dashboard
  const stats = [
    {
      title: 'Utilisateurs',
      value: '2,543',
      change: '+12.5%',
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: 'up'
    },
    {
      title: 'Universités',
      value: '152',
      change: '+3.2%',
      icon: <GraduationCap className="h-6 w-6 text-indigo-600" />,
      trend: 'up'
    },
    {
      title: 'Formations',
      value: '1,875',
      change: '+8.1%',
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      trend: 'up'
    },
    {
      title: 'Tests d\'orientation',
      value: '4,328',
      change: '+24.3%',
      icon: <Activity className="h-6 w-6 text-green-600" />,
      trend: 'up'
    }
  ];

  // Sample data for recent activities
  const recentActivities = [
    {
      id: 1,
      user: 'Sophie Martin',
      action: 'a créé un compte',
      time: 'Il y a 2 heures'
    },
    {
      id: 2,
      user: 'Thomas Dubois',
      action: 'a passé un test d\'orientation',
      time: 'Il y a 3 heures'
    },
    {
      id: 3,
      user: 'Léa Bernard',
      action: 'a ajouté l\'Université de Lyon à ses favoris',
      time: 'Il y a 5 heures'
    },
    {
      id: 4,
      user: 'Admin',
      action: 'a ajouté une nouvelle formation',
      time: 'Il y a 1 jour'
    },
    {
      id: 5,
      user: 'Admin',
      action: 'a mis à jour les informations de l\'École Polytechnique',
      time: 'Il y a 2 jours'
    }
  ];

  // Sample data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Journée portes ouvertes - Université Paris-Sorbonne',
      date: '15 Mai 2025',
      time: '10:00 - 17:00'
    },
    {
      id: 2,
      title: 'Salon de l\'orientation - Paris',
      date: '22 Mai 2025',
      time: '09:00 - 18:00'
    },
    {
      id: 3,
      title: 'Webinaire - Comment choisir sa formation ?',
      date: '28 Mai 2025',
      time: '14:00 - 15:30'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue dans l'interface d'administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className={`h-4 w-4 ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={`text-sm ml-1 ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-gray-500 text-sm ml-2">ce mois</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Activités récentes</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="py-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-center">
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                Voir toutes les activités
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Événements à venir</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.date} • {event.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-center">
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                Gérer les événements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;