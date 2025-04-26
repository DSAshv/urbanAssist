import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface MainLayoutProps {
  isAdmin?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ isAdmin = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        toggleSidebar={toggleSidebar} 
        isAdmin={isAdmin} 
      />
      
      <div className="flex flex-1">
        <Sidebar 
          isOpen={sidebarOpen} 
          closeSidebar={() => setSidebarOpen(false)} 
          isAdmin={isAdmin} 
        />
        
        <main className="flex-1 overflow-auto pt-16">
          <div className="px-4 py-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;