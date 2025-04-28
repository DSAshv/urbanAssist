import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';


interface MainLayoutProps {
  isAdmin?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ isAdmin = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header 
        toggleSidebar={toggleSidebar} 
        isAdmin={isAdmin} 
      />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          closeSidebar={() => setSidebarOpen(false)} 
          isAdmin={isAdmin} 
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto pt-16 lg:ml-64">
          <div className="px-4 py-8 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;