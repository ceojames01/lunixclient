import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/common/GlobalLoader';
import { CalendarPlus, ExternalLink, X, MapPin } from 'lucide-react';

const calendarOptions = [
  { name: 'Google', icon: 'https://api.iconify.design/logos/google-calendar.svg' },
  { name: 'Outlook.com (Web)', icon: 'https://api.iconify.design/vscode-icons/file-type-outlook.svg' },
  { name: 'Classic Outlook (Desktop)', icon: 'https://api.iconify.design/vscode-icons/file-type-outlook.svg' },
  { name: 'New Outlook (Desktop)', icon: 'https://api.iconify.design/vscode-icons/file-type-outlook.svg' },
  { name: 'Microsoft 365', icon: 'https://api.iconify.design/logos/microsoft-teams.svg' },
  { name: 'Other', icon: 'https://api.iconify.design/flat-color-icons/calendar.svg' }
];

const Schedule = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get('/content/schedule');
        if (res.data.success && res.data.data) {
          setSchedule(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <GlobalLoader />
      </div>
    );
  }

  if (!schedule) {
    return (
    <div className="min-h-screen bg-[#15151e] flex flex-col">
      <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">
          <p>No active schedule found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#15151e] flex flex-col font-['Formula1']">
      <Navbar />
      
      {/* Hero Banner */}
      <div 
        className="relative w-full bg-zinc-900 overflow-hidden min-h-[350px] h-[50vh] md:h-[var(--schedule-height)] md:min-h-[50vh]"
        style={{ '--schedule-height': schedule.sectionHeight || '60vh' }}
      >
        <img 
          src={schedule.bannerImage} 
          alt={schedule.title}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: schedule.overlayOpacity !== undefined ? schedule.overlayOpacity / 100 : 0.5 }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#15151e] via-transparent to-black/30"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white font-black uppercase tracking-wider leading-tight max-w-4xl drop-shadow-2xl font-['Formula1'] break-words">
              {schedule.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Schedule Container */}
      <div className="max-w-6xl mx-auto w-full px-4 py-12 md:py-16">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-5xl text-white font-black uppercase tracking-wider font-['Formula1']">
            Schedule
          </h2>
        </div>

        {/* Sessions List */}
        <div className="bg-black rounded-xl border-t border-zinc-800 mb-12">
          
          <div className="p-6 md:p-8 border-b border-zinc-800/50">
            <button 
              onClick={() => setIsCalendarModalOpen(true)}
              className="bg-[#e10600] text-white px-5 md:px-10 py-2 md:py-3 rounded-full font-['Formula1'] font-bold text-[11px] md:text-[15px] flex items-center gap-2 md:gap-3 hover:bg-red-700 transition-colors"
            >
              <CalendarPlus size={20} strokeWidth={2.5} /> Add calendar
            </button>
          </div>

          <div className="p-6 md:p-8">
            {schedule.sessions && schedule.sessions.map((session, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between group ${
                  index !== schedule.sessions.length - 1 ? 'border-b border-zinc-800/50 pb-6 mb-6' : ''
                }`}
              >
                <div className="flex items-center gap-3 md:gap-6 flex-1">
                  <div className="flex flex-col items-center justify-center min-w-[40px] md:min-w-[50px]">
                    <span className="text-white font-black text-xl md:text-3xl leading-none font-['Formula1']">{session.date}</span>
                    <span className="text-zinc-400 text-[10px] md:text-sm uppercase font-bold mt-1 md:mt-2">{session.month}</span>
                  </div>
                  <div className="h-8 md:h-12 w-[2px] bg-zinc-700"></div>
                  <h3 className="text-white font-bold text-[15px] leading-tight md:text-2xl uppercase tracking-wide font-['Formula1']">{session.title}</h3>
                </div>
                <Link to="/tickets" className="w-10 h-10 bg-[#B3BFFF] rounded flex items-center justify-center text-black hover:bg-indigo-300 transition-colors">
                  <ExternalLink size={20} strokeWidth={2.5} />
                </Link>
              </div>
            ))}
            {(!schedule.sessions || schedule.sessions.length === 0) && (
              <div className="py-12 text-center text-zinc-500">
                No sessions scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <a href="/betting" className="flex-1 bg-[#B3BFFF] text-black px-6 py-5 rounded-lg flex items-center justify-between font-bold uppercase tracking-wide hover:bg-indigo-300 transition-colors">
            <span>Lunix Betting</span>
            <ExternalLink size={20} strokeWidth={2.5} />
          </a>
          <a href="/tickets" className="flex-1 bg-[#B3BFFF] text-black px-6 py-5 rounded-lg flex items-center justify-between font-bold uppercase tracking-wide hover:bg-indigo-300 transition-colors">
            <span>Lunix Tickets</span>
            <ExternalLink size={20} strokeWidth={2.5} />
          </a>
        </div>

        {/* Results Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-5xl text-white font-black uppercase tracking-wider mb-8 font-['Formula1']">
            Results
          </h2>
          {schedule.results && schedule.results.length > 0 ? (
            <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="p-6 text-sm font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">Name</th>
                      <th className="p-6 text-sm font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">Registration Number</th>
                      <th className="p-6 text-sm font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">Phone Number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {schedule.results.map((result, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-6 text-white font-bold md:text-lg whitespace-nowrap">{result.name || '-'}</td>
                        <td className="p-6 text-zinc-300 font-mono whitespace-nowrap">{result.registrationNumber || '-'}</td>
                        <td className="p-6 text-zinc-300 whitespace-nowrap">{result.phoneNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-black border border-zinc-800 rounded-xl p-16 md:p-24 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-black text-xl">
                !
              </div>
              <span className="text-white text-lg tracking-wide text-center">No results available for this session</span>
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-5xl text-white font-black uppercase tracking-wider mb-8 font-['Formula1']">
            Location
          </h2>
          {schedule.locationLink || schedule.locationName ? (
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-black border border-zinc-800 rounded-xl p-8">
              <a 
                href={schedule.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-[400px] h-[250px] bg-zinc-900 rounded-xl border border-zinc-700 flex flex-col items-center justify-center hover:border-zinc-500 hover:bg-zinc-800 transition-all group overflow-hidden relative"
              >
                {/* Simulated map placeholder (can be swapped with an iframe if an embed link is provided) */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
                <MapPin size={48} className="text-zinc-600 group-hover:text-white transition-colors mb-4 z-10" />
                <span className="text-zinc-400 group-hover:text-white font-medium z-10 tracking-wide uppercase text-sm">Click to view map</span>
              </a>
              
              <div className="flex flex-col flex-1 text-center md:text-left">
                <span className="text-zinc-400 text-sm md:text-base font-medium tracking-wide mb-2">Event Place</span>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <MapPin size={32} className="text-[#e10600] shrink-0" />
                  <span className="text-3xl md:text-5xl text-white font-black uppercase tracking-wider font-['Formula1'] mt-2">
                    {schedule.locationName || 'Location Name'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black border border-zinc-800 rounded-xl p-16 md:p-24 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-black text-xl">
                !
              </div>
              <span className="text-white text-lg tracking-wide">No available location for this event</span>
            </div>
          )}
        </div>

      </div>
      
      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCalendarModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl mt-12 animate-in fade-in zoom-in duration-200">
            
            {/* Red Header */}
            <div className="bg-[#e10600] h-20 rounded-t-2xl relative flex justify-end p-4">
              <button onClick={() => setIsCalendarModalOpen(false)} className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <X size={16} />
              </button>
              {/* Logo overlapping top */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-black rounded-full border-[3px] border-white flex items-center justify-center overflow-hidden shadow-lg">
                <img src="/logo.png" alt="Lunix Logo" className="w-14 h-14 object-contain" />
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 pt-8 text-center">
              <h2 className="text-2xl font-black font-['Formula1'] uppercase text-black leading-tight mb-4">
                Choose Your<br/>Calendar
              </h2>
              <div className="w-full h-px bg-zinc-200 mb-6"></div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 px-2 pb-4">
                 {calendarOptions.map(opt => (
                   <button key={opt.name} className="flex flex-col items-center gap-2 group text-center">
                     <div className="w-16 h-16 border border-zinc-200 rounded-2xl flex items-center justify-center group-hover:border-zinc-400 group-hover:shadow-md transition-all bg-white">
                       <img src={opt.icon} alt={opt.name} className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <span className="text-[10px] text-zinc-600 font-medium group-hover:text-black px-1 leading-tight">{opt.name}</span>
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Schedule;
