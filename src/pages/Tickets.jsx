import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/common/GlobalLoader';

const Tickets = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/content/events');
        setEvents(data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const displayEvents = events;

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-black font-['Formula1'] tracking-wide">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#0A985D] hover:opacity-80 transition-opacity mb-8 font-sans">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-lg font-normal tracking-normal capitalize">Back to home</span>
        </button>
        <h1 className="text-2xl md:text-4xl font-['Formula1'] font-bold mb-12">Upcoming Events & Tickets</h1>
        {loading ? (
          <GlobalLoader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayEvents.length > 0 ? (
              displayEvents.map((event) => (
                <Link 
                  to={event.ticketLink && event.ticketLink !== '#' ? event.ticketLink : `/tickets/${event._id}`} 
                  target={event.ticketLink && event.ticketLink !== '#' ? '_blank' : undefined}
                  rel={event.ticketLink && event.ticketLink !== '#' ? 'noopener noreferrer' : undefined}
                  key={event._id} 
                  className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
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
              ))
            ) : (
              <p className="text-zinc-500 italic col-span-full">No events currently available. Please check back later.</p>
            )}
          </div>
        )}
      </div>
      <Footer hideBanner />
    </div>
  );
};

export default Tickets;
