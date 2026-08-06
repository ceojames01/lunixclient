import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/common/GlobalLoader';

const Wishlist = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [eventsRes, userRes] = await Promise.all([
          api.get('/content/events'),
          api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setEvents(eventsRes.data.data);
        setUser(userRes.data.user);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    const handleUserUpdate = (e) => {
      if (e.detail?.user) setUser(e.detail.user);
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, [navigate]);

  const handleWishlistToggle = async (e, id) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
      const res = await api.put(`/auth/wishlist/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      toast.success('Removed from wishlist');
      window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: res.data.user } }));
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const displayEvents = events.filter(event => user?.wishlist?.includes(event._id));

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-black font-['Formula1'] tracking-wide flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0A985D] hover:opacity-80 transition-opacity mb-8 font-sans">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-lg font-normal tracking-normal capitalize">Back</span>
        </button>
        <h1 className="text-2xl md:text-4xl font-['Formula1'] font-bold mb-12">My Wishlist</h1>
        {loading ? (
          <GlobalLoader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayEvents.length > 0 ? (
              displayEvents.map((event) => (
                <div key={event._id} className="relative group">
                  <Link 
                    to={event.ticketLink && event.ticketLink !== '#' ? event.ticketLink : `/tickets/${event._id}`} 
                    target={event.ticketLink && event.ticketLink !== '#' ? '_blank' : undefined}
                    rel={event.ticketLink && event.ticketLink !== '#' ? 'noopener noreferrer' : undefined}
                    className="block bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {event.posterUrl ? (
                      <img src={event.posterUrl} alt={event.title} className="w-full h-64 object-cover" />
                    ) : (
                      <div className="w-full h-64 bg-zinc-200 flex items-center justify-center font-bold text-zinc-400">NO POSTER</div>
                    )}
                    <div className="p-6">
                      <div className="text-sm text-f1-red font-bold mb-2 font-['Manrope'] uppercase">{event.dateRange}</div>
                      <h2 className="text-2xl font-bold mb-2 font-['Manrope']">{event.title || 'Untitled Event'}</h2>
                      <p className="text-zinc-600 mb-4 line-clamp-2 font-['Manrope'] font-semibold">{event.description}</p>
                      <p className="text-sm font-bold font-['Manrope'] uppercase">{event.location}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={(e) => handleWishlistToggle(e, event._id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-zinc-50 z-10"
                  >
                    <Heart size={20} className="text-f1-red fill-current" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 italic col-span-full font-['Manrope']">Your wishlist is empty. Browse tickets to add some!</p>
            )}
          </div>
        )}
      </div>
      <Footer hideBanner />
    </div>
  );
};

export default Wishlist;
