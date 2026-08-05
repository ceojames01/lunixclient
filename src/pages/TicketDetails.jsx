import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, Calendar, Share2, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';
import CalendarModal from '../components/common/CalendarModal';
import GlobalLoader from '../components/common/GlobalLoader';

const TicketDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/content/events/${id}`);
        setEvent(data.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchUser = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
          setUser(res.data.user);
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    fetchEvent();
    fetchUser();
    
    const handleUserUpdate = (e) => {
      if (e.detail?.user) setUser(e.detail.user);
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, [id]);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error('Please login to save to your wishlist');
      navigate('/login');
      return;
    }
    
    try {
      const res = await api.put(`/auth/wishlist/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      toast.success(res.data.user.wishlist.includes(id) ? 'Added to wishlist!' : 'Removed from wishlist!');
      window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: res.data.user } }));
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const displayEvent = event;

  if (loading) return <GlobalLoader fullScreen />;

  if (!displayEvent) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] text-black font-['Formula1'] tracking-wide">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-zinc-600 mb-6">The event you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate('/tickets')} className="bg-[#0A985D] text-white px-6 py-2 rounded font-bold uppercase hover:brightness-110 transition-all">
            Browse Tickets
          </button>
        </div>
        <Footer hideBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-black font-['Formula1'] tracking-wide">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0A985D] hover:opacity-80 transition-opacity mb-8 font-sans">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-lg font-normal tracking-normal capitalize">Back</span>
        </button>
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column - Details */}
          <div className="lg:w-2/3">
            {displayEvent.posterUrl && (
              <img src={displayEvent.posterUrl} alt={displayEvent.title} className="w-full max-w-2xl mx-auto object-cover shadow-lg mb-8" />
            )}
            
            <div className="flex justify-between items-center mb-8">
              <span className="bg-[#E6DEAC] text-[#6A602B] px-4 py-2 font-bold text-sm font-['Manrope']">Arts & Entertainment</span>
              <div className="flex gap-4">
                <button 
                  className="p-2 bg-white rounded shadow-sm hover:bg-zinc-50"
                  onClick={handleWishlistToggle}
                >
                  <Heart size={20} className={user?.wishlist?.includes(id) ? "text-f1-red fill-current" : "text-zinc-600"} />
                </button>
                <button className="p-2 bg-white rounded shadow-sm hover:bg-zinc-50" onClick={() => setIsCalendarOpen(true)}><Calendar size={20} className="text-zinc-600" /></button>
                <button 
                  className="p-2 bg-white rounded shadow-sm hover:bg-zinc-50"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  <Share2 size={20} className="text-zinc-600" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold font-['Manrope'] uppercase">{displayEvent.dateRange}</h3>
            </div>

            <div className="border-l-4 border-f1-red pl-4 mb-6">
              <h1 className="text-4xl font-['Formula1'] font-bold uppercase tracking-wider">{displayEvent.title || 'Untitled Event'}</h1>
            </div>

            {displayEvent.googleMapsLink ? (
              <a href={displayEvent.googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-700 font-bold mb-8 font-['Manrope'] hover:text-f1-red transition-colors cursor-pointer">
                <MapPin size={20} />
                <span className="hover:underline underline-offset-4">{displayEvent.location}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2 text-zinc-700 font-bold mb-8 font-['Manrope']">
                <MapPin size={20} />
                <span>{displayEvent.location}</span>
              </div>
            )}

            <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl whitespace-pre-line font-['Manrope'] font-semibold">
              {displayEvent.description}
            </p>
          </div>

          {/* Right Column - Buy Box & QR Code */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100">
              <h2 className="text-2xl mb-6 text-zinc-900 font-['Manrope'] font-black uppercase tracking-wide">BUY TICKETS</h2>
              
              <div className="inline-block border-2 border-zinc-900 rounded-xl px-5 py-2 mb-6 font-bold text-zinc-800 relative font-['Manrope'] text-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(253,184,19,0.4)] hover:border-[#FDB813] cursor-default group">
                {/* Yellow accent tick mark style breaking the border */}
                <div className="absolute -top-3 -left-3 bg-white px-1">
                  <div className="w-3 h-5 border-b-[3px] border-r-[3px] border-[#FDB813] rotate-45 transform transition-colors duration-300 group-hover:border-[#FDB813]"></div>
                </div>
                {displayEvent.dateRange}
              </div>

              <button 
                onClick={() => navigate(`/tickets/${id}/book`)}
                className="block w-full bg-[#1A1A1F] text-white text-center py-4 rounded-md font-bold mb-8 hover:bg-black transition-colors"
              >
                Get Tickets Now
              </button>

              <hr className="border-zinc-100 mb-8" />

              <div className="text-center">
                <h3 className="text-xl text-zinc-900 mb-6 font-['Manrope'] font-black uppercase tracking-wide">SCAN QR CODE</h3>
                <div className="flex justify-center mb-8">
                  <QRCodeSVG 
                    value={`${window.location.origin}/tickets/${displayEvent._id}/book`} 
                    size={160}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"Q"}
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-l-4 border-[#E6DEAC] pl-4 font-['Manrope']">
              <h4 className="font-black text-lg text-zinc-900 uppercase tracking-wide font-['Manrope']">AGE GROUP</h4>
              <p className="text-zinc-600 font-medium text-lg">All</p>
            </div>
          </div>

        </div>
      </div>
      
      <Footer hideBanner />
      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
    </div>
  );
};

export default TicketDetails;
