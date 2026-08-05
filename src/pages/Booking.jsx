import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';
import PurchaseModal from '../components/common/PurchaseModal';
import GlobalLoader from '../components/common/GlobalLoader';

const Booking = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketCounts, setTicketCounts] = useState({});
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
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
    fetchEvent();
  }, [id]);

  const updateCount = (tierIndex, delta) => {
    setTicketCounts(prev => {
      const current = prev[tierIndex] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      return { ...prev, [tierIndex]: next };
    });
  };

  const handleBook = () => {
    const selected = Object.entries(ticketCounts)
      .filter(([, count]) => count > 0)
      .map(([idx, count]) => `${displayEvent.ticketTiers[idx].name}: ${count}`);
      
    if (selected.length === 0) {
      toast.error('Please select at least one ticket.');
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  if (loading) return <GlobalLoader fullScreen />;

  const displayEvent = event;

  if (!displayEvent) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col font-['Formula1']">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-zinc-600 mb-6">The event you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate('/tickets')} className="bg-f1-red text-white px-6 py-2 rounded font-bold uppercase hover:brightness-110 transition-all">
            Browse Tickets
          </button>
        </div>
        <Footer hideBanner />
      </div>
    );
  }

  const totalAmount = displayEvent.ticketTiers ? displayEvent.ticketTiers.reduce((acc, tier, idx) => {
    return acc + (tier.price * (ticketCounts[idx] || 0));
  }, 0) : 0;

  return (
    <div className="min-h-screen bg-white text-black font-['Formula1'] tracking-wide">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Left Column - Poster */}
          <div className="md:w-1/3">
            {displayEvent.posterUrl ? (
              <img src={displayEvent.posterUrl} alt={displayEvent.title} className="w-full rounded-2xl shadow-md mb-4" />
            ) : (
              <div className="w-full h-80 bg-zinc-200 rounded-2xl flex items-center justify-center text-zinc-500 font-bold mb-4">No Poster</div>
            )}
            {displayEvent.eventType && (
              <p className="font-bold text-sm text-zinc-800 font-['Manrope']">Event type: <span className="font-normal">{displayEvent.eventType}</span></p>
            )}
          </div>

          {/* Right Column - Booking Details */}
          <div className="md:w-2/3">
            <h2 className="text-lg text-black mb-4 font-['Manrope'] font-semibold">{displayEvent.description}</h2>
            
            <p className="text-black font-bold mb-6 font-['Manrope']">{displayEvent.fullDate}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center border border-f1-red rounded-full overflow-hidden">
                <div className="bg-f1-red p-3 text-white flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div className="px-4 py-2 font-bold text-sm text-zinc-800 font-['Manrope']">
                  {displayEvent.timeDetails}
                </div>
              </div>
              <div className="flex items-center border border-f1-red rounded-full overflow-hidden">
                <div className="bg-f1-red p-3 text-white flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="px-4 py-2 font-bold text-sm text-zinc-800 font-['Manrope']">
                  {displayEvent.location}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-6 font-['Manrope'] uppercase">Available tickets</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {displayEvent.ticketTiers && displayEvent.ticketTiers.length > 0 ? (
                displayEvent.ticketTiers.map((tier, idx) => {
                  const count = ticketCounts[idx] || 0;
                  return (
                    <div key={idx} className="border border-zinc-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6 flex flex-col items-center justify-between min-h-[180px] group hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300">
                      <div className="w-full text-center">
                        <h4 className="text-f1-red font-bold text-base font-['Manrope']">{tier.name}</h4>
                        <hr className="w-full border-zinc-200 my-4 transition-colors duration-300 group-hover:border-f1-red" />
                        <p className="text-f1-red font-normal text-base font-['Manrope']">KES {tier.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-6 mt-auto">
                        <button 
                          onClick={() => updateCount(idx, -1)} 
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${count > 0 ? 'bg-zinc-400 hover:bg-zinc-500' : 'bg-zinc-300 cursor-not-allowed'}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-f1-red font-bold text-lg font-['Manrope']">{count}</span>
                        <button 
                          onClick={() => updateCount(idx, 1)} 
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-f1-red text-white hover:brightness-110"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-zinc-500 italic">No tickets available at the moment.</p>
              )}
            </div>

            {totalAmount > 0 && (
              <div className="mb-8 font-['Manrope']">
                <p className="text-black font-bold text-lg mb-2">Total:</p>
                <p className="text-[#DA1A21] font-bold text-[40px] leading-none">KES {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            )}

            <button 
              onClick={handleBook}
              className="bg-f1-red text-white font-bold font-['Manrope'] px-8 py-3 rounded mb-6 hover:brightness-110 transition-colors uppercase"
            >
              BOOK TICKETS
            </button>

            <p className="text-xs text-zinc-500 font-bold mb-2 font-['Manrope']">By continuing, you agree to our <a href="/terms" className="text-f1-red hover:underline font-bold font-['Manrope']">terms and conditions</a></p>
            <p className="text-xs text-zinc-500 font-bold font-['Manrope']">* Tickets once purchased cannot be refunded.</p>
            
          </div>

        </div>
      </div>
      
      <Footer hideBanner />

      <PurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        event={displayEvent}
        ticketCounts={ticketCounts}
        totalAmount={totalAmount}
      />
    </div>
  );
};

export default Booking;
