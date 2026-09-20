import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const WhatsAppAuthModal = ({ token, onBack }) => {
  const [status, setStatus] = useState({ connected: false, qr: null });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/admin/whatsapp/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStatus({ connected: res.data.connected, qr: res.data.qr });
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 3 seconds if not connected
    const interval = setInterval(() => {
      if (!status.connected) {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status.connected, token]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post('/admin/whatsapp/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStatus();
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 md:p-12 w-full max-w-xl text-center relative">
        {status.connected ? (
          <>
            {/* Connected State */}
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-[#0bb37a] rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              
              {/* Badge */}
              <div className="bg-[#f0fbf6] border border-[#a7ebd3] text-[#0bb37a] px-5 py-1.5 rounded-full text-xs font-bold tracking-wider mb-6">
                CONNECTED & ROUTING
              </div>

              {/* Headings */}
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                Communication Engine Active
              </h2>
              <p className="text-gray-600 text-[15px] leading-relaxed max-w-md mb-8">
                The WhatsApp gateway is authenticated and active.<br/>
                Order receipts and delivery dispatch confirmations are<br/>
                currently being routed through your business number.
              </p>

              {/* Stats Box */}
              <div className="w-full border border-gray-200 rounded-xl p-5 mb-8 text-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-800">Gateway Service:</span>
                  <span className="text-gray-600">whatsapp-web.js (Puppeteer)</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-800">Anti-Crash Protocol:</span>
                  <span className="text-[#0bb37a] font-bold">Enabled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Memory Pool Limit:</span>
                  <span className="text-gray-600">500MB Throttled</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={fetchStatus}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Restart Gateway
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 rounded-lg border border-red-200 text-[#e93b53] font-bold hover:bg-red-50 transition-colors"
                >
                  Force Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Disconnected / Loading State */}
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              {loading || (!status.qr && !status.connected) ? (
                <div className="flex flex-col items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-[#b47124] animate-spin mb-4" strokeWidth={2} />
                  <p className="text-gray-600 text-lg">Generating new QR code token...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Link WhatsApp Device</h2>
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 inline-block">
                    <img src={status.qr} alt="WhatsApp QR Code" className="w-[280px] h-[280px]" />
                  </div>
                  <p className="text-gray-600 text-sm max-w-sm mb-6">
                    Open WhatsApp on your phone, go to Settings &gt; Linked Devices, and point your camera at this screen.
                  </p>
                  <button 
                    onClick={fetchStatus}
                    className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh QR
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppAuthModal;
