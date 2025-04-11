import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin',
      exact: true
    },
    {
      title: 'Utilisateurs',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users'
    },
    {
      title: 'Universités',
      icon: <GraduationCap className="h-5 w-5" />,
      path: '/admin/universities',
      submenu: [
        { title: 'Liste des universités', path: '/admin/universities' },
        { title: 'Ajouter une université', path: '/admin/universities/add' }
      ]
    },
    {
      title: 'Formations',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/admin/programs',
      submenu: [
        { title: 'Liste des formations', path: '/admin/programs' },
        { title: 'Ajouter une formation', path: '/admin/programs/add' }
      ]
    },
    {
      title: 'Paramètres',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-blue-800 text-white transition duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-blue-700">
          <Link to="/admin" className="flex items-center">
            <GraduationCap className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl">Admin Panel</span>
          </Link>
          <button 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 mb-6">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
              alt={user?.name} 
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-blue-200">{user?.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.path}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={`flex items-center justify-between w-full px-4 py-2 rounded-md transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-700 text-white'
                          : 'text-blue-100 hover:bg-blue-700'
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        openSubmenu === item.title ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {openSubmenu === item.title && (
                      <div className="mt-1 ml-4 pl-4 border-l border-blue-700 space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.path}
                            to={subitem.path}
                            className={`block px-4 py-2 rounded-md text-sm ${
                              location.pathname === subitem.path
                                ? 'bg-blue-700 text-white'
                                : 'text-blue-100 hover:bg-blue-700'
                            }`}
                            onClick={() => setIsSidebarOpen(false)}
                          >
                            {subitem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      (item.exact && location.pathname === item.path) || 
                      (!item.exact && isActive(item.path))
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t border-blue-700 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-blue-100 hover:bg-blue-700 rounded-md"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600">
                Voir le site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;