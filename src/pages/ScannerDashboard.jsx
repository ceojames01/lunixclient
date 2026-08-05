import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Search, CheckCircle, XCircle, User, Calendar, QrCode, PlusCircle, Ticket as TicketIcon, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';

const ScannerDashboard = () => {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'issue'
  
  // Scan State
  const [ticketCode, setTicketCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  
  // Issue State
  const [events, setEvents] = useState([]);
  const [issueData, setIssueData] = useState({
    eventId: '',
    ticketTierName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ticketQuantity: 1,
    paymentMethod: 'CASH'
  });
  const [isIssuing, setIsIssuing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('scannerToken') || localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    
    if (!token) {
      navigate('/scanner/login');
      return;
    }
    
    // Set scannerToken so subsequent manual headers in this file work
    localStorage.setItem('scannerToken', token);

    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const u = res.data.user;
        if (u.role === 'scanner' || u.role === 'admin') {
          setUser(u);
        } else {
          navigate('/');
        }
      })
      .catch(() => {
        navigate('/scanner/login');
      });

    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      // Trying the public events endpoint
      const res = await api.get('/content/events');
      if (res.data.success) {
        setEvents(res.data.data.filter(e => e.isActive !== false));
        if (res.data.data.length > 0) {
          const firstEvent = res.data.data[0];
          setIssueData(prev => ({ 
            ...prev, 
            eventId: firstEvent._id,
            ticketTierName: firstEvent.ticketTiers?.length > 0 ? firstEvent.ticketTiers[0].name : 'General Admission'
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  useEffect(() => {
    let html5QrCode;

    if (activeTab === 'scan' && scannerActive) {
      html5QrCode = new Html5Qrcode("reader");
      
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          let code = decodedText;
          if (code.startsWith('LUNIX-TKT-')) {
            code = code.replace('LUNIX-TKT-', '');
          }
          setTicketCode(code);
          setScannerActive(false);
          
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(console.error);
          }
          
          handleVerify(null, code);
        },
        (error) => {
          // ignore routine scan errors
        }
      ).catch((err) => {
        console.error("Camera start failed", err);
        toast.error("Failed to start camera. Please ensure camera permissions are granted.");
        setScannerActive(false);
      });

      return () => {
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      };
    }
  }, [scannerActive, activeTab]);

  const handleVerify = async (e, codeToVerify = ticketCode) => {
    if (e) e.preventDefault();
    if (!codeToVerify.trim()) {
      toast.error('Please enter a ticket code');
      return;
    }

    try {
      setIsVerifying(true);
      setResult(null);
      
      const token = localStorage.getItem('scannerToken');
      const res = await api.put(`/admin/orders/undefined/verify`, 
        { ticketCode: codeToVerify }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setResult({ success: true, data: res.data.data, message: res.data.message });
        setTicketCode('');
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error.response?.data?.message || 'Verification Failed',
        data: error.response?.data?.data
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleIssueTicket = async (e) => {
    e.preventDefault();
    if (!issueData.eventId || !issueData.firstName || !issueData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsIssuing(true);
      const token = localStorage.getItem('scannerToken');
      
      // Get event price to calculate total
      const selectedEvent = events.find(ev => ev._id === issueData.eventId);
      
      let price = 0;
      if (selectedEvent?.ticketTiers?.length > 0) {
        const selectedTier = selectedEvent.ticketTiers.find(t => t.name === issueData.ticketTierName);
        price = selectedTier ? selectedTier.price : (selectedEvent.ticketTiers[0]?.price || 0);
      }
      
      const totalAmount = price * issueData.ticketQuantity;
      const tierName = issueData.ticketTierName || 'General Admission';

      const payload = {
        eventId: issueData.eventId,
        tickets: [{ name: tierName, price, quantity: issueData.ticketQuantity }],
        totalAmount,
        paymentMethod: issueData.paymentMethod,
        billingInfo: {
          firstName: issueData.firstName,
          lastName: issueData.lastName,
          email: issueData.email,
          phone: issueData.phone
        }
      };

      const res = await api.post('/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        if (issueData.paymentMethod === 'MPESA') {
          toast.loading('Sending M-PESA payment prompt...', { id: 'mpesa-toast' });
          try {
            await api.post('/mpesa/stk-push', {
              orderId: res.data.data._id,
              phone: issueData.phone,
              amount: totalAmount
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success(`M-PESA prompt sent! Ticket Code: ${res.data.data.ticketCode}`, { id: 'mpesa-toast', duration: 5000 });
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send M-PESA prompt. Ticket created.', { id: 'mpesa-toast' });
          }
        } else {
          toast.success(`Successfully issued ticket! Code: ${res.data.data.ticketCode}`, { duration: 5000 });
        }

        setIssueData(prev => ({
          ...prev,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          ticketQuantity: 1
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue ticket');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('scannerToken');
    localStorage.removeItem('scannerUser');
    navigate('/scanner/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] font-inter text-base flex flex-col pb-10">
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-zinc-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00b87c] rounded-xl flex items-center justify-center">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-black tracking-widest uppercase text-lg">SCANNER PORTAL</h1>
              <p className="text-[#00b87c] text-sm font-bold uppercase tracking-widest mt-0.5">{user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium bg-zinc-800/50 hover:bg-zinc-800 px-3 py-2 rounded-lg">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium bg-zinc-800/50 hover:bg-zinc-800 px-3 py-2 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="bg-[#1e293b] p-1.5 rounded-xl flex gap-2 border border-zinc-800 shadow-lg">
          <button
            onClick={() => { setActiveTab('scan'); setResult(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'scan' ? 'bg-[#00b87c] text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" /> Verify
          </button>
          <button
            onClick={() => { setActiveTab('issue'); setScannerActive(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'issue' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Issue Ticket
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col pt-6">
        
        {activeTab === 'scan' ? (
          <>
            {/* Scanner Container */}
            <div className="bg-[#1e293b] rounded-3xl border border-zinc-800 shadow-2xl p-6 mb-6">
              
              {!scannerActive ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                    <QrCode className="w-10 h-10 text-zinc-400" />
                  </div>
                  <h2 className="text-white font-bold text-xl mb-2">Scan QR Code</h2>
                  <p className="text-zinc-400 text-sm mb-6">Use your device camera to scan ticket QR codes quickly.</p>
                  
                  <button 
                    onClick={() => setScannerActive(true)}
                    className="w-full bg-[#3b82f6] hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    Open Camera Scanner
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold">Scanning...</h2>
                    <button onClick={() => setScannerActive(false)} className="text-red-400 text-sm font-bold hover:text-red-300">Cancel</button>
                  </div>
                  <div id="reader" className="bg-black rounded-xl overflow-hidden border-2 border-[#00b87c] shadow-[0_0_20px_rgba(0,184,124,0.2)]"></div>
                </div>
              )}

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-zinc-500 bg-[#1e293b]">OR</span>
                </div>
              </div>

              <form onSubmit={(e) => handleVerify(e)} className="space-y-4">
                <h2 className="text-white font-bold mb-2">Manual Entry</h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Enter Ticket Code (e.g., A1B2-C3D4)" 
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#0f172a] text-white pl-12 pr-4 py-4 rounded-xl border border-zinc-700 focus:border-[#00b87c] focus:ring-1 focus:ring-[#00b87c] outline-none transition-all font-mono text-lg uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-600 placeholder:font-sans placeholder:text-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isVerifying || !ticketCode.trim()}
                  className="w-full bg-[#00b87c] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#00a36e] transition-colors shadow-[0_0_15px_rgba(0,184,124,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            </div>

            {/* Result Card */}
            {result && (
              <div className={`p-6 rounded-3xl border animate-in slide-in-from-bottom-4 duration-500 ${result.success ? 'bg-[#00b87c]/10 border-[#00b87c]/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${result.success ? 'bg-[#00b87c]' : 'bg-red-500'} text-white shrink-0 shadow-lg`}>
                    {result.success ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-bold mb-1 ${result.success ? 'text-[#00b87c]' : 'text-red-500'}`}>
                      {result.success ? 'Access Granted' : 'Access Denied'}
                    </h3>
                    <p className="text-zinc-300 font-medium text-sm leading-relaxed">{result.message}</p>
                    
                    {result.data && (
                      <div className="mt-5 grid grid-cols-1 gap-3 text-sm bg-black/40 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-start gap-3">
                          <User className="w-4 h-4 text-zinc-500 mt-0.5" />
                          <div>
                            <span className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Purchaser</span>
                            <span className="font-bold text-white block">{result.data.user?.name || result.data.billingInfo?.firstName || 'Unknown'}</span>
                            <span className="block text-zinc-400 text-xs mt-0.5">{result.data.user?.email || result.data.billingInfo?.email}</span>
                          </div>
                        </div>
                        
                        <div className="h-px bg-white/5 my-1"></div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-zinc-500 mt-0.5" />
                          <div>
                            <span className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Event Details</span>
                            <span className="font-bold text-white block">{result.data.event?.title || 'Unknown Event'}</span>
                            <span className="block text-zinc-400 text-xs mt-0.5">{result.data.event?.dateRange}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Issue Ticket Form */
          <div className="bg-[#1e293b] rounded-3xl border border-zinc-800 shadow-2xl p-6 animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#3b82f6]/20 text-[#3b82f6] rounded-full flex items-center justify-center">
                <TicketIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Issue Door Ticket</h2>
                <p className="text-zinc-400 text-xs">Record cash sales and generate tickets instantly</p>
              </div>
            </div>

            <form onSubmit={handleIssueTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Select Event</label>
                <select 
                  value={issueData.eventId}
                  onChange={(e) => {
                    const event = events.find(ev => ev._id === e.target.value);
                    const tierName = event?.ticketTiers?.length > 0 ? event.ticketTiers[0].name : 'General Admission';
                    setIssueData({...issueData, eventId: e.target.value, ticketTierName: tierName});
                  }}
                  className="w-full bg-[#0f172a] text-white p-3.5 rounded-xl border border-zinc-700 focus:border-[#3b82f6] outline-none"
                  required
                >
                  {events.length === 0 ? <option value="">Loading events...</option> : null}
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              {/* Show Ticket Tiers if event has them */}
              {events.find(ev => ev._id === issueData.eventId)?.ticketTiers?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Ticket Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                    {events.find(ev => ev._id === issueData.eventId).ticketTiers.map(tier => (
                      <button
                        key={tier.name}
                        type="button"
                        onClick={() => setIssueData({...issueData, ticketTierName: tier.name})}
                        className={`aspect-square flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                          issueData.ticketTierName === tier.name 
                            ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                            : 'bg-[#0f172a] border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        <div className={`font-bold text-sm ${issueData.ticketTierName === tier.name ? 'text-[#3b82f6]' : 'text-white'}`}>
                          {tier.name}
                        </div>
                        <div className="text-zinc-400 text-xs mt-2 font-medium">
                          KSh {tier.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={issueData.firstName}
                    onChange={(e) => setIssueData({...issueData, firstName: e.target.value})}
                    className="w-full bg-[#0f172a] text-white p-3.5 rounded-xl border border-zinc-700 focus:border-[#3b82f6] outline-none"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={issueData.lastName}
                    onChange={(e) => setIssueData({...issueData, lastName: e.target.value})}
                    className="w-full bg-[#0f172a] text-white p-3.5 rounded-xl border border-zinc-700 focus:border-[#3b82f6] outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={issueData.email}
                    onChange={(e) => setIssueData({...issueData, email: e.target.value})}
                    className="w-full bg-[#0f172a] text-white p-3.5 rounded-xl border border-zinc-700 focus:border-[#3b82f6] outline-none"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={issueData.phone}
                    onChange={(e) => setIssueData({...issueData, phone: e.target.value})}
                    className="w-full bg-[#0f172a] text-white p-3.5 rounded-xl border border-zinc-700 focus:border-[#3b82f6] outline-none"
                    placeholder="+2547..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={issueData.ticketQuantity}
                    onChange={(e) => setIssueData({...issueData, ticketQuantity: parseInt(e.target.value) || 1})}
                    className="w-full bg-[#0f172a] text-white p-3.5 rounded-xl border border-zinc-700 focus:border-[#3b82f6] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Payment</label>
                  <select 
                    value={issueData.paymentMethod}
                    onChange={(e) => setIssueData({...issueData, paymentMethod: e.target.value})}
                    className="w-full bg-[#0f172a] text-white p-3.5 rounded-xl border border-zinc-700 focus:border-[#3b82f6] outline-none font-bold text-[#00b87c]"
                  >
                    <option value="CASH">CASH</option>
                    <option value="MPESA">M-PESA (Paid Offline)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isIssuing || events.length === 0}
                className="w-full bg-[#3b82f6] text-white px-8 py-4 rounded-xl font-bold mt-4 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                {isIssuing ? 'Generating Ticket...' : 'Complete Sale & Generate Ticket'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScannerDashboard;
