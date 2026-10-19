import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = ({ activeTab, onTabChange, onLogout, adminUser, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_sidebar_open');
      if (saved !== null) return saved === 'true';
      return true;
    }
    return true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_open', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-inter overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          onTabChange(tab);
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        adminUser={adminUser}
        onLogout={onLogout}
      />
      
      <div className={`${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} flex flex-col min-h-screen transition-all duration-300`}>
        <Topbar 
          onTabChange={onTabChange} 
          onLogout={onLogout} 
          adminUser={adminUser} 
          isSidebarOpen={isSidebarOpen}
          onMenuClick={toggleSidebar}
        />
        
        <main className="flex-1 px-4 lg:px-8 pb-8 pt-24 lg:pt-24 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
