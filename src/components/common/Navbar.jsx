import { User, ExternalLink, ChevronRight, Menu, X, Heart, Zap, LogOut, Edit2, Ticket, Scan } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

const Navbar = () => {
  const location = useLocation();
  const isMinimal = location.pathname === '/login';
  
  const [nextEvent, setNextEvent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showExecutiveBoard, setShowExecutiveBoard] = useState(true);
  const [user, setUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        let userReq = null;
        if (token) {
          userReq = api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        }
        
        const [eventRes, configRes, userRes] = await Promise.all([
          api.get('/content/next-event'),
          api.get('/content/config'),
          userReq ? userReq.catch(() => null) : Promise.resolve(null)
        ]);
        if (active && eventRes.data?.data) {
          setNextEvent(eventRes.data.data);
        }
        if (active && configRes.data?.data) {
          setShowExecutiveBoard(configRes.data.data.showExecutiveBoard !== false);
        }
        if (active && userRes?.data?.user) {
          setUser(userRes.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchEvent();

    const handleUserUpdate = (e) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
      }
    };
    window.addEventListener('user-updated', handleUserUpdate);

    return () => { 
      active = false; 
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);
  const utilityLinks = [
    { name: 'Tickets', path: '/tickets', external: true },
    { name: 'Editors Pick', path: '#' },
    { name: 'Betting', path: '/betting' }
  ];
  const mainLinks = [
    { name: 'Overview', path: '/#overview' },
    { name: 'Corporate structure', path: '/#corporate-structure' },
    { name: 'Global services', path: '/#global-services' },
    ...(showExecutiveBoard ? [{ name: 'Executive Board', path: '/#leadership' }] : [])
  ];
  const renderUserProfile = () => (
    <div className="relative">
      <button 
        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden hover:border-zinc-500 transition-colors"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User size={16} className="text-zinc-400" />
        )}
      </button>
      
      {isProfileDropdownOpen && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl overflow-hidden normal-case z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                <User size={20} className="text-zinc-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-zinc-900 text-sm truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          
          <div className="p-2 flex flex-col gap-1 text-[13px] text-zinc-600 font-medium">
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
              <Edit2 size={16} className="text-zinc-500" /> Profile
            </Link>
            <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
              <Heart size={16} className="text-zinc-500" /> Wishlist
            </Link>
            <Link to="/my-tickets" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
              <Ticket size={16} className="text-zinc-500" /> My Tickets
            </Link>
            {(user.role === 'admin' || user.role === 'scanner') && (
              <Link to="/scanner/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors font-bold text-black" onClick={() => setIsProfileDropdownOpen(false)}>
                <Scan size={16} className="text-zinc-500" /> Scanner
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors font-bold text-black" onClick={() => setIsProfileDropdownOpen(false)}>
                <Zap size={16} className="text-zinc-500" /> Admin Dashboard
              </Link>
            )}
          </div>
          
          <div className="p-2 border-t border-zinc-100">
            <button 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors text-[13px] font-medium"
              onClick={() => {
                localStorage.removeItem('userToken');
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className={`w-full sticky top-0 ${!isMinimal ? 'md:top-[-41px]' : ''} z-50`}>
      {/* Tier 1: Top utility ribbon */}
      {!isMinimal && (
        <div className="hidden md:block bg-f1-black border-b border-f1-border-grey">
        <div className="font-['Formula1'] tracking-wider max-w-7xl mx-auto px-4 h-10 flex items-center justify-end gap-5 text-[11px] font-light text-white/80 uppercase">
          {utilityLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="hover:text-f1-text-muted transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <span className="text-zinc-600 font-normal">|</span>
          {user ? renderUserProfile() : (
            <Link
              to="/login"
              className="font-['Formula1'] font-light flex items-center justify-center bg-f1-red text-white/90 px-5 py-1.5 rounded-full hover:brightness-110 transition-all normal-case text-[12px]"
            >
              Sign In
            </Link>
          )}
        </div>
        </div>
      )}

      {/* Tier 2: Main brand banner */}
      <div 
        className="bg-[#15151e] border-y border-zinc-800"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 25px, rgba(255,255,255,0.03) 25px, rgba(255,255,255,0.03) 50px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Lunix Logo" className="h-16 md:h-20 w-auto object-contain" />
          </Link>

          {!isMinimal && (
            <>
              <nav className="font-['Formula1'] hidden md:flex flex-1 justify-center gap-8 text-sm font-light uppercase tracking-wide text-white/90 h-full">
                {mainLinks.map((link) => (
                  <a key={link.name} href={link.path} className="relative flex items-center h-full border-b-[3px] border-transparent hover:border-white hover:text-white transition-colors">
                    {link.name}
                  </a>
                ))}
              </nav>

              <Link
                to="/contact"
                className="font-['Formula1'] hidden md:block text-sm font-light uppercase tracking-wide text-white/90 hover:underline"
              >
                Contact HQ
              </Link>
            </>
          )}

          <div className="md:hidden flex items-center gap-2">
            <button 
              className="text-white hover:text-white transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            {user && renderUserProfile()}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#111115] border-t border-zinc-800 absolute w-full z-50 shadow-2xl">
            <nav className="flex flex-col font-['Formula1'] text-sm font-light uppercase tracking-wide text-white/90">
              <div 
                className="bg-[#15151e] px-4 py-4 flex flex-col gap-4"
                style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 25px, rgba(255,255,255,0.03) 25px, rgba(255,255,255,0.03) 50px)'
                }}
              >
                {mainLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.path} 
                    className="hover:text-white transition-colors py-2 border-b border-zinc-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="px-4 py-6 flex flex-col gap-3">
                {utilityLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="flex justify-between items-center bg-black rounded-xl px-5 py-4 hover:bg-zinc-900 transition-colors"
                    onClick={() => !link.external && setIsMobileMenuOpen(false)}
                  >
                    <span className="font-bold tracking-wider">{link.name}</span>
                    <ExternalLink size={20} className="text-white" />
                  </Link>
                ))}
                <Link
                  to="/contact"
                  className="hover:text-f1-red transition-colors py-2 text-f1-red"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact HQ
                </Link>
                <Link
                  to="/login"
                  className="mt-2 text-center bg-f1-red text-white py-3 rounded-md hover:brightness-110 transition-colors font-bold normal-case tracking-normal"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Tier 3: Event Banner */}
      {!isMinimal && (
        <div className="bg-black text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <span className="font-['Formula1'] text-zinc-400 font-semibold text-[10px] md:text-xs tracking-wider uppercase">
              {nextEvent?.eventCode || 'E 1'} | {nextEvent?.dateRange || '15 July'}
            </span>
            <Link to="/schedule" className="font-['Formula1'] flex items-center gap-1 font-bold text-sm md:text-base hover:text-zinc-300 transition-colors mt-0.5">
              <span>{nextEvent?.location || 'KUTUS'}</span>
              <ChevronRight size={16} className="stroke-[3]" />
            </Link>
          </div>

          <Link
            to={nextEvent?.ticketLink && nextEvent.ticketLink !== '#' ? nextEvent.ticketLink : "/schedule"}
            target={nextEvent?.ticketLink && nextEvent.ticketLink !== '#' ? '_blank' : undefined}
            rel={nextEvent?.ticketLink && nextEvent.ticketLink !== '#' ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center bg-[#B3BFFF] text-black w-10 h-8 rounded hover:bg-indigo-300 transition-colors duration-200"
          >
            <ExternalLink size={18} className="stroke-[2.5]" />
          </Link>
        </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
