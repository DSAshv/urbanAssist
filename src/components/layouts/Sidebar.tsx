import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  FileText,
  User,
  Settings,
  X,
  BarChart3,
  Users
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar, isAdmin = false }) => {
  const location = useLocation();
  const basePath = isAdmin ? '/admin' : '/app';

  const navigationItems = isAdmin ? [
    { path: `${basePath}/dashboard`, label: 'Dashboard', icon: BarChart3 },
    { path: `${basePath}/complaints`, label: 'Complaints', icon: FileText },
    { path: `${basePath}/users`, label: 'Users', icon: Users },
    { path: `${basePath}/settings`, label: 'Settings', icon: Settings },
  ] : [
    { path: `${basePath}/dashboard`, label: 'Dashboard', icon: Home },
    { path: `${basePath}/complaints/new`, label: 'New Complaint', icon: FileText },
    { path: `${basePath}/profile`, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 pt-16`}
      >
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <h2 className="text-xl font-semibold text-gray-800">
            {isAdmin ? 'Admin Panel' : 'Navigation'}
          </h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => closeSidebar()}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;