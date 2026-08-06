import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Download, Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/common/GlobalLoader';

const MyTickets = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await api.get('/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          toast.error('Failed to load tickets');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, [navigate]);

  const downloadTicket = async (orderId, eventTitle) => {
    try {
      const ticketElement = document.getElementById(`ticket-${orderId}`);
      if (!ticketElement) return;

      const dataUrl = await toPng(ticketElement, {
        pixelRatio: 3, // High resolution (3x)
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const link = document.createElement('a');
      link.download = `${eventTitle.replace(/\s+/g, '_')}_Ticket.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-black font-['Formula1'] tracking-wide flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0A985D] hover:opacity-80 transition-opacity mb-8 font-sans">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-lg font-normal tracking-normal capitalize">Back</span>
        </button>
        <h1 className="text-2xl md:text-4xl font-['Formula1'] font-bold mb-12">My Tickets</h1>
        
        {loading ? (
          <GlobalLoader />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-manrope">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order._id} className="relative group">
                  <div id={`ticket-${order._id}`} className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="bg-zinc-50/70 p-6 border-b-2 border-dashed border-zinc-200 flex justify-between items-start relative z-10">
                      {/* Ticket Cutouts */}
                      <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-[#FDFCF0] rounded-full border border-zinc-200 z-20"></div>
                      <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-[#FDFCF0] rounded-full border border-zinc-200 z-20"></div>
                      
                      <div className="flex items-center gap-4">
                        {order.event?.posterUrl && (
                          <img 
                            src={order.event.posterUrl} 
                            alt={order.event.title} 
                            className="w-20 h-28 rounded-md object-cover shadow-sm border border-zinc-200"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-xl md:text-2xl text-zinc-900 mb-2 leading-tight">{order.event?.title || 'Unknown Event'}</h4>
                          <div className="flex flex-col gap-2 font-sans">
                            <p className="text-xs text-zinc-600 font-semibold flex items-start gap-1.5 uppercase tracking-wide">
                              <span className="mt-0.5 flex-shrink-0"><Calendar size={14} className="text-[#DA1A21]" /></span>
                              <span className="flex-1 leading-relaxed">{order.event?.fullDate || 'TBD'}</span>
                            </p>
                            {order.event?.timeDetails && (
                              <p className="text-xs text-zinc-600 font-semibold flex items-start gap-1.5 uppercase tracking-wide">
                                <span className="mt-0.5 flex-shrink-0"><Clock size={14} className="text-[#DA1A21]" /></span>
                                <span className="flex-1 leading-relaxed">{order.event.timeDetails}</span>
                              </p>
                            )}
                            {order.event?.location && (
                              <p className="text-xs text-zinc-600 font-semibold flex items-start gap-1.5 uppercase tracking-wide">
                                <span className="mt-0.5 flex-shrink-0"><MapPin size={14} className="text-[#DA1A21]" /></span>
                                <span className="flex-1 leading-relaxed">{order.event.location}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider ${
                          order.status === 'COMPLETED' ? 'bg-[#0e9f6e]/10 text-[#0e9f6e]' : 
                          order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                        {order.isScanned && (
                           <span className="bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                             USED
                           </span>
                        )}
                      </div>
                    </div>
                  <div className="p-6 flex-1 flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between relative overflow-hidden bg-white">
                    {/* Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] font-black text-zinc-50/50 -rotate-12 whitespace-nowrap pointer-events-none select-none z-0">
                      LUNIX ENTERPRISES
                    </div>

                    <div className="flex-1 w-full relative z-10">
                      <p className="text-xs text-zinc-400 mb-3 font-bold uppercase tracking-widest">Order Details</p>
                      <div className="space-y-2 mb-6">
                        {order.tickets.map((t, i) => (
                          <div key={i} className="flex justify-between text-base">
                            <span className="text-zinc-700 font-medium">{t.quantity}x {t.name}</span>
                            <span className="text-zinc-900 font-bold">KES {t.price * t.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-dashed border-zinc-200 pt-4 flex justify-between">
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Paid</span>
                        <span className="text-lg font-bold text-[#DA1A21]">KES {order.totalAmount}</span>
                      </div>
                    </div>
                    
                    {order.status === 'COMPLETED' && order.qrCodeData && (
                      <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 border border-zinc-200 rounded-xl min-w-[150px] relative z-10 shadow-sm">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-zinc-100 mb-4">
                          <QRCodeSVG 
                            value={order.qrCodeData} 
                            size={100}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                          />
                        </div>
                        <fieldset className="w-full mt-2 border border-zinc-200 rounded-md px-2 pb-2 pt-0 text-center shadow-sm">
                          <legend className="px-2 text-[9px] text-zinc-400 font-bold uppercase tracking-widest mx-auto bg-transparent">
                            TICKET CODE
                          </legend>
                          <div className="text-sm text-zinc-800 font-mono font-bold tracking-wide w-full bg-transparent leading-none pb-1">
                            {order.ticketCode || order.qrCodeData.split('-').slice(-2).join('-')}
                          </div>
                        </fieldset>
                      </div>
                    )}
                  </div>
                </div>
                {order.status === 'COMPLETED' && (
                  <button 
                    onClick={() => downloadTicket(order._id, order.event?.title || 'Event')}
                    className="absolute -top-3 -right-3 bg-zinc-900 text-white p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:bg-[#DA1A21] hover:scale-110 transition-all duration-200 z-10"
                    title="Download Ticket Image"
                  >
                    <Download size={18} />
                  </button>
                )}
              </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-zinc-200 col-span-full shadow-sm">
                <Ticket className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-800 mb-2 font-['Formula1']">No Tickets Found</h3>
                <p className="text-zinc-500 font-medium mb-8">You haven't purchased any tickets yet. Discover exciting events and book your spot!</p>
                <Link to="/" className="inline-block bg-[#0e9f6e] text-white px-8 py-3 rounded font-bold hover:bg-[#0c8a5f] transition-colors uppercase tracking-wide">
                  Browse Events
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer hideBanner />
    </div>
  );
};

export default MyTickets;
