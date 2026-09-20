import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Download, Sparkles, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toPng } from 'html-to-image';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/common/GlobalLoader';
import TicketPass from '../components/ticket/TicketPass';
import { downloadStandaloneQRCode } from '../utils/qrDownload';

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

  const downloadTicket = async (orderId, eventTitle, ticketCode) => {
    try {
      const ticketElement = document.getElementById(`ticket-${orderId}`);
      if (!ticketElement) return;

      const dataUrl = await toPng(ticketElement, {
        pixelRatio: 3, // High resolution (3x)
        backgroundColor: '#000000',
      });

      const link = document.createElement('a');
      link.download = `${(eventTitle || 'Lunix_Ticket').replace(/\s+/g, '_')}_${ticketCode || orderId}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Ticket pass downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white tracking-wide flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#00b87c] hover:opacity-80 transition-opacity mb-3 font-sans">
              <ArrowLeft size={18} strokeWidth={2} />
              <span className="text-sm font-semibold tracking-normal capitalize">Back to Home</span>
            </button>
            <h1 className="text-2xl md:text-4xl font-['Orbitron'] font-black tracking-tight text-white flex items-center gap-3">
              My Tickets <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-zinc-400 text-sm mt-1">View, present, or download your official digital passes</p>
          </div>
        </div>
        
        {loading ? (
          <GlobalLoader />
        ) : (
          <div className="space-y-10">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order._id} className="flex flex-col items-center gap-4 bg-[#141422]/60 p-4 sm:p-6 rounded-3xl border border-zinc-800/80 shadow-2xl backdrop-blur-sm">
                  
                  {/* Status & Action Header */}
                  <div className="w-full max-w-[900px] flex justify-between items-center px-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                        order.status === 'COMPLETED' ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/30' : 
                        order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {order.status}
                      </span>
                      {order.isScanned && (
                        <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-zinc-700">
                          SCANNED / USED
                        </span>
                      )}
                    </div>

                    {order.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            downloadStandaloneQRCode(order.qrCodeData || `LUNIX-TKT-${order.ticketCode}`, order.ticketCode, order.event?.title);
                            toast.success('QR Code downloaded!');
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl border border-zinc-700 shadow-sm flex items-center gap-1.5 transition-all transform active:scale-95"
                          title="Download standalone QR Code image"
                        >
                          <QrCode size={16} className="text-[#00b87c]" /> QR Code (PNG)
                        </button>
                        <button 
                          onClick={() => downloadTicket(order._id, order.event?.title, order.ticketCode)}
                          className="bg-[#00b87c] hover:bg-[#00a36e] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-[0_4px_14px_rgba(0,184,124,0.3)] flex items-center gap-2 transition-all transform active:scale-95"
                        >
                          <Download size={16} /> Download Pass (PNG)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rendered Live Ticket Pass */}
                  <div className="w-full flex justify-center overflow-x-auto py-2">
                    <TicketPass 
                      order={order} 
                      id={`ticket-${order._id}`} 
                    />
                  </div>

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
