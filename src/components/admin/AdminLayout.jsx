import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = ({ activeTab, onTabChange, onLogout, adminUser, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] font-inter overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          onTabChange(tab);
          setIsMobileMenuOpen(false);
        }} 
        onLogout={onLogout} 
        adminUser={adminUser}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />
      
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Topbar 
          onTabChange={onTabChange} 
          onLogout={onLogout} 
          adminUser={adminUser} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
