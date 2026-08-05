import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  Calendar, 
  Image as ImageIcon, 
  Clock, 
  Users, 
  User as UserIcon,
  FileText, 
  Briefcase, 
  Settings,
  LogOut,
  TrendingUp,
  Ticket,
  CreditCard
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Site view', path: '/', id: 'site_view', icon: Monitor, external: true },
  { name: 'Event', id: 'event', icon: Calendar },
  { name: 'Hero', id: 'hero', icon: ImageIcon },
  { name: 'Schedule', id: 'schedule', icon: Clock },
  { name: 'Leaders', id: 'leaders', icon: Users },
  { name: 'Editorials', id: 'editorials', icon: FileText },
  { name: 'Partners', id: 'partners', icon: Briefcase },
  { name: 'Users', id: 'users', icon: UserIcon },
  { name: 'Orders', id: 'orders', icon: Ticket },
  { name: 'Transactions', id: 'transactions', icon: CreditCard },
  { name: 'Settings', id: 'settings', icon: Settings },
];

const Sidebar = ({ activeTab, onTabChange, onLogout, adminUser, isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const avatar = adminUser?.avatar || "https://ui-avatars.com/api/?name=Admin&background=random";
  const name = adminUser?.name || "CEO James";
  const email = adminUser?.email || "jameshalom217@gmail.com";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`w-64 bg-[#1e293b] text-zinc-300 flex flex-col h-screen fixed left-0 top-0 border-r border-zinc-700 shadow-xl z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-[#00b87c] rounded-md flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">LUNIX</h1>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.external) {
            return (
              <a
                key={item.name}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800/50 transition-all text-base font-medium"
              >
                <Icon size={18} className="text-zinc-400" />
                {item.name}
              </a>
            );
          }

          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base ${
                isActive 
                  ? 'bg-[#00b87c] text-white font-bold shadow-[0_10px_25px_-5px_rgba(0,184,124,0.7)]' 
                  : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white font-medium'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-zinc-400'} />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* User Area */}
      <div className="p-4 border-t border-zinc-700">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-2 py-2 mb-4 w-full text-left rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden text-left">
            <p className="font-bold text-white text-sm truncate">{name}</p>
            <p className="text-xs text-zinc-500 truncate max-w-[150px]">{email}</p>
          </div>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-bold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
