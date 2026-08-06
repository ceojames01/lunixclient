import { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onTabChange, onLogout, adminUser, onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const avatar = adminUser?.avatar || "https://ui-avatars.com/api/?name=Admin&background=random";
  const name = adminUser?.name || "Admin";
  const email = adminUser?.email || "admin@lunix.com";
  return (
    <header className="relative h-20 bg-[#1e293b] border-b border-zinc-800/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      {isProfileOpen && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 pointer-events-none"></div>
      )}
      <div className="relative z-10 flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide uppercase hidden sm:block">Lunix Admin</h2>
      </div>

      <div className="flex items-center gap-4 lg:gap-6 relative z-50">
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-48 lg:w-64 bg-[#0f172a] border border-zinc-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00b87c] transition-colors"
          />
        </div>

        <button className="relative text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#1e293b]"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center sm:justify-start gap-3 p-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl cursor-pointer sm:min-w-[145px] h-[48px] w-[48px] sm:h-[52px] sm:w-auto"
          >
            <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden shrink-0">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-bold text-white text-sm leading-tight truncate">{name}</p>
              <p className="text-[11px] text-zinc-400">Admin</p>
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 top-[calc(100%+12px)] w-[300px] sm:w-[350px] bg-[#1e293b]/90 backdrop-blur-xl border-2 border-zinc-600 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                <div className="p-4 border-b-2 border-zinc-600 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-white text-sm truncate">{name}</p>
                    <p className="text-xs text-zinc-400 truncate">{email}</p>
                    <p className="text-xs text-[#00b87c] font-medium mt-0.5">Admin</p>
                  </div>
                </div>
                
                <div className="p-2 flex flex-col">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2d303e] rounded-lg transition-colors"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      onTabChange('settings');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2d303e] rounded-lg transition-colors"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#2d303e] rounded-lg transition-colors mt-1"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
