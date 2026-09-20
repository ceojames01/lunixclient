import { useState } from 'react';
import { Search, Eye, Download, Trash2, Ticket, CreditCard, ChevronDown, X, User, Copy, MessageCircle, Calendar, Truck, CheckCircle, Printer, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toPng } from 'html-to-image';
import api from '../../services/api';
import TicketPass from '../ticket/TicketPass';
import A4PrintModal from './A4PrintModal';
import { downloadStandaloneQRCode } from '../../utils/qrDownload';

const AdminTicketEditor = ({ activeTab, data, setData, token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [ticketModalOrder, setTicketModalOrder] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'gallery'
  const [showA4Modal, setShowA4Modal] = useState(false);

  // Bulk Generator State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCount, setBulkCount] = useState('400');
  const [bulkTier, setBulkTier] = useState('REGULAR PASS');
  const [bulkPrice, setBulkPrice] = useState('0');
  const [bulkNote, setBulkNote] = useState('Physical Gate Passes');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const handleBulkGenerate = async (e) => {
    if (e) e.preventDefault();
    const count = parseInt(bulkCount, 10);
    if (isNaN(count) || count < 1) {
      toast.error('Please enter a valid number of tickets');
      return;
    }

    const authToken = token || localStorage.getItem('adminToken') || localStorage.getItem('userToken');

    if (token === 'virtual_preview_token') {
      const mockTickets = [];
      const batchId = Math.random().toString(36).substring(2, 6).toUpperCase();
      for (let i = 1; i <= count; i++) {
        const code1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const ticketCode = `${code1}-${code2}`;
        mockTickets.push({
          _id: `mock-${Date.now()}-${i}`,
          user: { name: 'Admin User', email: 'admin@lunix.com' },
          event: { title: 'CAMPUS CULTURE', fullDate: 'FRIDAY 25TH SEPTEMBER 2026' },
          tickets: [{ name: bulkTier, price: Number(bulkPrice) || 0, quantity: 1 }],
          totalAmount: Number(bulkPrice) || 0,
          paymentMethod: 'CASH',
          billingInfo: { firstName: 'Admin Batch', lastName: `#${i} (${batchId})`, email: 'admin@lunix.com', phone: 'N/A' },
          status: 'COMPLETED',
          ticketCode,
          qrCodeData: `LUNIX-TKT-${ticketCode}`,
          createdAt: new Date().toISOString()
        });
      }
      setData([...mockTickets, ...data]);
      toast.success(`🎉 Generated ${count} tickets successfully (Preview Mode)!`);
      setShowBulkModal(false);
      return;
    }

    try {
      setIsBulkGenerating(true);
      let res;
      try {
        res = await api.post('/admin/orders/bulk-generate', {
          count,
          tierName: bulkTier,
          price: Number(bulkPrice) || 0,
          note: bulkNote
        }, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
      } catch (firstErr) {
        if (firstErr.response?.status === 404) {
          res = await api.post('/orders/bulk-generate', {
            count,
            tierName: bulkTier,
            price: Number(bulkPrice) || 0,
            note: bulkNote
          }, {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          });
        } else {
          throw firstErr;
        }
      }

      if (res.data?.success) {
        toast.success(`🎉 Generated ${res.data.count} tickets successfully!`, { duration: 5000 });
        if (res.data.data) {
          setData([...res.data.data, ...data]);
        }
        setShowBulkModal(false);
      }
    } catch (err) {
      console.error('Bulk generate error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate tickets');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const filteredData = data.filter(order => {
    const matchesSearch = 
      order.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.billingInfo?.phone?.includes(searchTerm) ||
      order.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All Status' || 
                          order.status.toLowerCase() === statusFilter.toLowerCase();
                          
    return matchesSearch && matchesStatus;
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleDownloadTicket = async (orderId, ticketCode) => {
    try {
      const ticketElement = document.getElementById(`admin-ticket-${orderId}`) || document.getElementById(`modal-ticket-${orderId}`) || document.getElementById(`gallery-ticket-${orderId}`);
      if (!ticketElement) return;

      const dataUrl = await toPng(ticketElement, {
        pixelRatio: 3,
        backgroundColor: '#000000',
      });

      const link = document.createElement('a');
      link.download = `Lunix_Ticket_${ticketCode || orderId}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Ticket image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket image');
    }
  };

  const handleUpdateOrderStatus = async (status) => {
    if (!selectedTransaction) return;
    try {
      setIsUpdating(true);
      const res = await api.put(`/admin/orders/${selectedTransaction._id}`, { status });
      if (res.data.success) {
        toast.success(`Order marked as ${status.toLowerCase()}`);
        
        setData(data.map(order => 
          order._id === selectedTransaction._id ? { ...order, status } : order
        ));
        
        setSelectedTransaction(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight capitalize">
            {activeTab === 'orders' ? 'Orders & Ticket Passes' : 'Transactions & Payments'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {activeTab === 'orders' 
              ? 'Manage orders, inspect QR codes, and generate ticket passes' 
              : 'Monitor all M-Pesa payments and ticket allocations'}
          </p>
        </div>

        {/* Action Controls & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'orders' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowA4Modal(true)}
                className="bg-[#1e293b] hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border border-zinc-700 shadow-md transition-all"
                title="Print 4 tickets per A4 page or export Multi-Page PDF"
              >
                <Printer className="w-4 h-4 text-[#00b87c]" /> Print A4 Sheet (4/page)
              </button>

              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-[#00b87c] hover:bg-[#00a36e] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(0,184,124,0.3)] transition-all transform active:scale-95"
              >
                <Ticket className="w-4 h-4" /> + Bulk Generate Tickets
              </button>
            </div>
          )}

          <div className="flex items-center bg-[#1e293b] p-1 rounded-xl border border-zinc-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' 
                  ? 'bg-[#00b87c] text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Table List
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'gallery' 
                  ? 'bg-[#00b87c] text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" /> Passes Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row gap-4 items-center shadow-lg mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder={activeTab === 'orders' ? "Search by ticket code, name, email, phone..." : "Search by phone, email, or reference..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b] text-white pl-12 pr-4 py-3 rounded-xl border border-zinc-700 focus:border-[#00b87c] focus:ring-1 focus:ring-[#00b87c] outline-none transition-all text-sm"
          />
        </div>
        
        <div className="relative min-w-[180px] w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#22272e] text-white pl-4 pr-10 py-3 rounded-xl border border-zinc-700 focus:border-[#00b87c] outline-none appearance-none font-medium text-sm cursor-pointer transition-colors"
          >
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
        </div>

        {activeTab === 'orders' ? (
          <button className="w-full sm:w-auto bg-[#4a2e35] text-[#ff7b72] border border-[#ff7b72]/30 px-6 py-3 rounded-xl font-medium hover:bg-[#ff7b72]/20 transition-colors flex items-center justify-center gap-2 text-sm">
            <Trash2 className="w-4 h-4" />
            Clear Abandoned
          </button>
        ) : (
          <button className="w-full sm:w-auto bg-[#00b87c] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#00a36e] transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_4px_14px_rgba(0,184,124,0.3)]">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        )}
      </div>

      {/* Data Table View */}
      {viewMode === 'table' ? (
        <div className="bg-[#0f172a] rounded-xl overflow-x-auto shadow-lg border border-zinc-800">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#1e293b] border-b border-zinc-800">
              <tr>
                <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider w-28">Actions</th>
                {activeTab === 'orders' ? (
                  <>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Ticket Code</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Customer</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Items</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Total</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Date</th>
                  </>
                ) : (
                  <>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Phone</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Email</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Amount</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Reference</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
                {filteredData.map((order) => {
                  const totalItems = order.tickets?.reduce((acc, t) => acc + t.quantity, 0) || 0;
                  const date = new Date(order.createdAt).toLocaleDateString('en-GB'); // dd/mm/yyyy
                  
                  return (
                    <tr key={order._id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setTicketModalOrder(order)}
                            className="bg-[#00b87c]/15 hover:bg-[#00b87c]/25 text-[#00b87c] border border-[#00b87c]/30 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                            title="View Ticket Pass"
                          >
                            <Ticket className="w-3.5 h-3.5" /> Pass
                          </button>
                          <button 
                            onClick={() => setSelectedTransaction(order)}
                            className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                            title="Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      
                      {activeTab === 'orders' ? (
                        <>
                          <td className="p-5 font-mono text-sm font-bold text-white">
                            {order.ticketCode || (order.qrCodeData ? order.qrCodeData.split('-').slice(-2).join('-') : order._id.slice(-6).toUpperCase())}
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-white group-hover:text-[#00b87c] transition-colors">
                              {order.billingInfo?.firstName ? `${order.billingInfo.firstName} ${order.billingInfo.lastName}` : (order.user?.name || 'Unknown User')}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {order.billingInfo?.email || order.user?.email || 'No email'}
                            </div>
                          </td>
                          <td className="p-5 text-sm text-zinc-400">
                            {totalItems} items
                          </td>
                          <td className="p-5 font-bold text-white text-sm">
                            KSh {order.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider capitalize transition-all border ${
                              order.status === 'COMPLETED' ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/30' : 
                              order.status === 'PENDING' ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30' : 
                              'bg-red-500/10 text-red-500 border-red-500/30'
                            }`}>
                              {order.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="p-5 text-sm text-zinc-400">
                            {date}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-5">
                            <div className="font-bold text-white group-hover:text-[#00b87c] transition-colors">{order.billingInfo?.phone || order.user?.phone || 'N/A'}</div>
                          </td>
                          <td className="p-5 text-sm text-zinc-500">
                            {order.billingInfo?.email || order.user?.email || 'N/A'}
                          </td>
                          <td className="p-5 font-bold text-white text-sm">
                            KSh {order.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider capitalize transition-all border ${
                              order.status === 'COMPLETED' ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/30' : 
                              order.status === 'PENDING' ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30' : 
                              'bg-red-500/10 text-red-500 border-red-500/30'
                            }`}>
                              {order.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="p-5 font-mono text-sm text-zinc-400">
                            {order.paymentMethod === 'MPESA' ? (order.paymentReference || `ws_CO_${order._id.slice(-8).toUpperCase()}`) : '-'}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'orders' ? 7 : 6} className="py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        {activeTab === 'orders' ? <Ticket className="w-8 h-8 opacity-20" /> : <CreditCard className="w-8 h-8 opacity-20" />}
                        <p>No {activeTab} found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      ) : (
        /* Gallery View */
        <div className="space-y-6">
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {filteredData.map((order) => (
                <div key={order._id} className="bg-[#0f172a] p-6 rounded-2xl border border-zinc-800 shadow-xl flex flex-col items-center gap-4">
                  {/* Card Top Info */}
                  <div className="w-full max-w-[900px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <h4 className="text-white font-bold text-base flex items-center gap-2">
                        {order.billingInfo?.firstName ? `${order.billingInfo.firstName} ${order.billingInfo.lastName}` : (order.user?.name || 'Customer')}
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          order.status === 'COMPLETED' ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {order.status}
                        </span>
                      </h4>
                      <p className="text-xs text-zinc-400">{order.billingInfo?.email || order.user?.email} • {order.billingInfo?.phone || order.user?.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const code = order.ticketCode || (order.qrCodeData ? order.qrCodeData.split('-').slice(-2).join('-') : order._id.slice(-6).toUpperCase());
                          navigator.clipboard.writeText(code);
                          toast.success(`Copied ticket code: ${code}`);
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-zinc-700"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </button>
                      <button
                        onClick={() => {
                          downloadStandaloneQRCode(order.qrCodeData || `LUNIX-TKT-${order.ticketCode}`, order.ticketCode, order.event?.title);
                          toast.success('QR Code downloaded!');
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-zinc-700 hover:text-white"
                        title="Download Standalone QR Code image"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#00b87c]" /> QR Code (PNG)
                      </button>
                      <button
                        onClick={() => handleDownloadTicket(order._id, order.ticketCode)}
                        className="bg-[#00b87c] hover:bg-[#00a36e] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-[0_2px_10px_rgba(0,184,124,0.3)]"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Pass
                      </button>
                    </div>
                  </div>

                  {/* Rendered Ticket */}
                  <div className="w-full flex justify-center overflow-x-auto py-2">
                    <TicketPass 
                      order={order} 
                      id={`gallery-ticket-${order._id}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a] rounded-xl p-16 text-center border border-zinc-800 text-zinc-500">
              <Ticket className="w-12 h-12 opacity-20 mx-auto mb-3" />
              <p>No ticket passes found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Dedicated Ticket Inspection Modal */}
      {ticketModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-4xl rounded-2xl border border-zinc-800 shadow-2xl p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#e5b53e]" /> Ticket Pass Inspection
                </h3>
                <p className="text-xs text-zinc-400">
                  {ticketModalOrder.billingInfo?.firstName ? `${ticketModalOrder.billingInfo.firstName} ${ticketModalOrder.billingInfo.lastName}` : (ticketModalOrder.user?.name || 'Customer')} • Order #{ticketModalOrder.ticketCode || ticketModalOrder._id.slice(-6).toUpperCase()}
                </p>
              </div>
              <button 
                onClick={() => setTicketModalOrder(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-4">
              <TicketPass 
                order={ticketModalOrder} 
                id={`modal-ticket-${ticketModalOrder._id}`} 
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs font-mono">CODE: <strong className="text-white font-bold">{ticketModalOrder.ticketCode || ticketModalOrder._id.slice(-6).toUpperCase()}</strong></span>
                <button
                  onClick={() => {
                    const code = ticketModalOrder.ticketCode || (ticketModalOrder.qrCodeData ? ticketModalOrder.qrCodeData.split('-').slice(-2).join('-') : ticketModalOrder._id.slice(-6).toUpperCase());
                    navigator.clipboard.writeText(code);
                    toast.success(`Copied ticket code: ${code}`);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-2.5 py-1 rounded border border-zinc-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    downloadStandaloneQRCode(ticketModalOrder.qrCodeData || `LUNIX-TKT-${ticketModalOrder.ticketCode}`, ticketModalOrder.ticketCode, ticketModalOrder.event?.title);
                    toast.success('QR Code downloaded!');
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-zinc-700 shadow-sm transition-all"
                >
                  <QrCode className="w-4 h-4 text-[#00b87c]" /> Download QR Code Only
                </button>
                <button
                  onClick={() => handleDownloadTicket(ticketModalOrder._id, ticketModalOrder.ticketCode)}
                  className="bg-[#00b87c] hover:bg-[#00a36e] text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_4px_14px_rgba(0,184,124,0.3)] transition-all"
                >
                  <Download className="w-4 h-4" /> Download Full Pass (PNG)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction / Order Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-4xl h-full border-l border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col">
            
            {activeTab === 'orders' ? (
              <>
                <div className="flex justify-between items-start p-6 border-b border-zinc-800 shrink-0">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">Order Details</h3>
                      <span className="bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider capitalize">
                        {selectedTransaction.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 font-mono">
                      #{selectedTransaction.ticketCode || (selectedTransaction.qrCodeData ? selectedTransaction.qrCodeData.split('-').slice(-2).join('-') : selectedTransaction._id.slice(-6).toUpperCase())} <span className="text-zinc-600">({selectedTransaction._id})</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  
                  {/* Customer Information */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-white font-bold text-lg">Customer Information</h4>
                    </div>
                    
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-[#00b87c] flex items-center justify-center text-white shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold text-lg">
                          {selectedTransaction.billingInfo?.firstName ? `${selectedTransaction.billingInfo.firstName} ${selectedTransaction.billingInfo.lastName}` : (selectedTransaction.user?.name || 'Unknown User')}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-400 text-sm">{selectedTransaction.billingInfo?.email || selectedTransaction.user?.email || 'No email'}</span>
                          <button className="text-zinc-500 hover:text-white bg-zinc-800 p-1 rounded-md"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-400 text-sm">{selectedTransaction.billingInfo?.phone || selectedTransaction.user?.phone || 'N/A'}</span>
                          <button className="text-[#25D366] hover:text-[#1da851] bg-[#25D366]/10 p-1 rounded-md"><MessageCircle className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-zinc-400 border-t border-zinc-800/50 pt-4 mt-2">
                      <Calendar className="w-4 h-4" />
                      <span>Ordered: {new Date(selectedTransaction.createdAt).toLocaleDateString('en-GB')}, {new Date(selectedTransaction.createdAt).toLocaleTimeString('en-GB')}</span>
                    </div>
                  </div>
                  
                  {/* Items */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50">
                    <h4 className="text-white font-bold text-lg mb-4">Items ({selectedTransaction.tickets?.length || 0})</h4>
                    <div className="space-y-4">
                      {selectedTransaction.tickets?.map((t, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <Ticket className="w-8 h-8 text-zinc-300" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-white font-bold">{t.name}</h5>
                                <p className="text-sm text-zinc-400 mt-1">Event Ticket</p>
                              </div>
                              <div className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">Qty {t.quantity}</div>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                              <span className="text-sm text-zinc-500">KSh {t.price.toLocaleString()} each</span>
                              <span className="text-white font-bold font-mono">KSh {(t.price * t.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Ticket Pass Preview Section */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-[#e5b53e]" /> Generated Ticket Pass
                        </h4>
                        <p className="text-xs text-zinc-400">Live ticket template with QR code & ticket code</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const code = selectedTransaction.ticketCode || (selectedTransaction.qrCodeData ? selectedTransaction.qrCodeData.split('-').slice(-2).join('-') : selectedTransaction._id.slice(-6).toUpperCase());
                            navigator.clipboard.writeText(code);
                            toast.success(`Copied ticket code: ${code}`);
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-700"
                          title="Copy Ticket Code"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Code
                        </button>
                        <button
                          onClick={() => {
                            downloadStandaloneQRCode(selectedTransaction.qrCodeData || `LUNIX-TKT-${selectedTransaction.ticketCode}`, selectedTransaction.ticketCode, selectedTransaction.event?.title);
                            toast.success('QR Code downloaded!');
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-700"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#00b87c]" /> QR Code
                        </button>
                        <button
                          onClick={() => handleDownloadTicket(selectedTransaction._id, selectedTransaction.ticketCode)}
                          className="bg-[#00b87c] hover:bg-[#00a36e] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-[0_2px_10px_rgba(0,184,124,0.3)]"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Pass
                        </button>
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto py-2 flex justify-center">
                      <TicketPass 
                        order={selectedTransaction} 
                        id={`admin-ticket-${selectedTransaction._id}`} 
                        className="scale-90 sm:scale-100 origin-top transform-gpu"
                      />
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50">
                    <h4 className="text-white font-bold text-lg mb-4 border-b border-zinc-800/50 pb-4">Financial Summary</h4>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Subtotal</span>
                        <span className="text-white font-bold font-mono">KSh {selectedTransaction.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Shipping Cost</span>
                        <span className="text-white font-bold">Free</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                      <span className="text-white font-bold text-lg">Grand Total</span>
                      <span className="text-[#00b87c] font-bold text-xl font-mono">KSh {selectedTransaction.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Fulfillment Status */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50 mb-4">
                    <div className="flex items-center gap-2 mb-6">
                      <h4 className="text-white font-bold text-lg">Fulfillment Status Details</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Order Status</label>
                      <select 
                        value={selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1).toLowerCase()}
                        onChange={(e) => handleUpdateOrderStatus(e.target.value.toUpperCase())}
                        disabled={isUpdating}
                        className="w-full bg-[#0f172a] text-white px-4 py-3 rounded-lg border border-zinc-700 outline-none disabled:opacity-50"
                      >
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Failed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="p-6 border-t border-zinc-800 flex gap-4 shrink-0 bg-[#0f172a]">
                  <button 
                    onClick={() => handleUpdateOrderStatus('COMPLETED')}
                    disabled={isUpdating || selectedTransaction.status === 'COMPLETED'}
                    className="flex-1 bg-[#00b87c] hover:bg-[#00a36e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(0,184,124,0.3)]"
                  >
                    <CheckCircle className="w-5 h-5" /> Mark as Fulfilled
                  </button>
                  <button 
                    onClick={() => handleUpdateOrderStatus('FAILED')}
                    disabled={isUpdating || selectedTransaction.status === 'FAILED'}
                    className="px-8 border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 rounded-xl transition-colors shrink-0"
                  >
                    Cancel Order
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
                  <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Payment Details */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50">
                    <h4 className="text-white font-bold mb-6">Payment Details</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-sm text-zinc-400 mb-2">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider capitalize border inline-block ${
                          selectedTransaction.status === 'COMPLETED' ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/30' : 
                          selectedTransaction.status === 'PENDING' ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30' : 
                          'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          {selectedTransaction.status.toLowerCase()}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Amount Paid</p>
                        <p className="text-lg font-bold text-white">KSh {selectedTransaction.totalAmount.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">M-Pesa Code</p>
                        <p className="text-white font-mono text-sm">{selectedTransaction.paymentMethod === 'MPESA' ? (selectedTransaction.paymentReference || `ws_CO_${selectedTransaction._id.slice(-8).toUpperCase()}`) : '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Date & Time</p>
                        <p className="text-white text-sm">
                          {new Date(selectedTransaction.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
                          {new Date(selectedTransaction.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Phone Number</p>
                        <p className="text-white text-sm">{selectedTransaction.billingInfo?.phone || selectedTransaction.user?.phone || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Email</p>
                        <p className="text-white text-sm">{selectedTransaction.billingInfo?.email || selectedTransaction.user?.email || 'N/A'}</p>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <p className="text-sm text-zinc-400 mb-1">Reference</p>
                        <p className="text-zinc-400 font-mono text-sm">{selectedTransaction.paymentMethod === 'MPESA' ? (selectedTransaction.paymentReference || `ws_CO_${selectedTransaction._id.slice(-8).toUpperCase()}`) : '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50">
                    <h4 className="text-white font-bold mb-4">Order Summary</h4>
                    {selectedTransaction.tickets && selectedTransaction.tickets.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTransaction.tickets.map((t, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="text-white font-medium">{t.name}</p>
                              <p className="text-zinc-400">Qty: {t.quantity}</p>
                            </div>
                            <p className="text-white font-bold">KSh {(t.price * t.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-sm">No order details available for this transaction.</p>
                    )}
                  </div>

                  {/* Ticket Pass Preview in Transactions */}
                  <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-[#e5b53e]" /> Generated Ticket Pass
                        </h4>
                        <p className="text-xs text-zinc-400">Live ticket template with QR code & ticket code</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const code = selectedTransaction.ticketCode || (selectedTransaction.qrCodeData ? selectedTransaction.qrCodeData.split('-').slice(-2).join('-') : selectedTransaction._id.slice(-6).toUpperCase());
                            navigator.clipboard.writeText(code);
                            toast.success(`Copied ticket code: ${code}`);
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-700"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Code
                        </button>
                        <button
                          onClick={() => {
                            downloadStandaloneQRCode(selectedTransaction.qrCodeData || `LUNIX-TKT-${selectedTransaction.ticketCode}`, selectedTransaction.ticketCode, selectedTransaction.event?.title);
                            toast.success('QR Code downloaded!');
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-zinc-700"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#00b87c]" /> QR Code
                        </button>
                        <button
                          onClick={() => handleDownloadTicket(selectedTransaction._id, selectedTransaction.ticketCode)}
                          className="bg-[#00b87c] hover:bg-[#00a36e] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-[0_2px_10px_rgba(0,184,124,0.3)]"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Pass
                        </button>
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto py-2 flex justify-center">
                      <TicketPass 
                        order={selectedTransaction} 
                        id={`admin-ticket-${selectedTransaction._id}`} 
                        className="scale-90 sm:scale-100 origin-top transform-gpu"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Bulk Ticket Generator Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-xl rounded-2xl border border-zinc-800 shadow-2xl p-6 sm:p-8 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2.5">
                  <Ticket className="w-6 h-6 text-[#00b87c]" /> Bulk Ticket Generator
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Generate multiple tickets with unique QR codes & ticket codes without needing customer emails or phones.
                </p>
              </div>
              <button 
                onClick={() => setShowBulkModal(false)}
                disabled={isBulkGenerating}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkGenerate} className="space-y-5">
              
              {/* Ticket Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Number of Tickets to Generate <span className="text-red-400">*</span>
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="2000"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  placeholder="e.g. 400"
                  required
                  disabled={isBulkGenerating}
                  className="w-full bg-[#1e293b] text-white text-lg font-bold px-4 py-3 rounded-xl border border-zinc-700 focus:border-[#00b87c] focus:ring-1 focus:ring-[#00b87c] outline-none transition-all"
                />
                {/* Quick Selection Chips */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {[10, 50, 100, 200, 400, 500, 1000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBulkCount(num.toString())}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                        bulkCount === num.toString()
                          ? 'bg-[#00b87c] text-white border-[#00b87c]'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {num} Tickets
                    </button>
                  ))}
                </div>
              </div>

              {/* Pass Tier / Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    Pass Category / Tier
                  </label>
                  <select
                    value={bulkTier}
                    onChange={(e) => setBulkTier(e.target.value)}
                    disabled={isBulkGenerating}
                    className="w-full bg-[#1e293b] text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-[#00b87c] outline-none text-sm font-medium"
                  >
                    <option value="REGULAR PASS">REGULAR PASS</option>
                    <option value="VIP PASS">VIP PASS</option>
                    <option value="VVIP PASS">VVIP PASS</option>
                    <option value="EARLY BIRD">EARLY BIRD</option>
                    <option value="COMPLIMENTARY PASS">COMPLIMENTARY PASS</option>
                  </select>
                </div>

                {/* Price per Ticket */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    Price per Ticket (KSh)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    placeholder="0"
                    disabled={isBulkGenerating}
                    className="w-full bg-[#1e293b] text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-[#00b87c] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Batch Reference / Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Batch Tag / Print Reference
                </label>
                <input 
                  type="text" 
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  placeholder="e.g. Physical Gate Passes Batch #1"
                  disabled={isBulkGenerating}
                  className="w-full bg-[#1e293b] text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-[#00b87c] outline-none text-sm"
                />
              </div>

              {/* Info Box */}
              <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#00b87c]" /> Auto-Allocation & Verification
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  All <strong className="text-white">{bulkCount || 0} tickets</strong> will be created as <strong>COMPLETED</strong> with unique scannable QR codes and unique ticket codes. They will appear immediately under your <strong>Orders</strong> and your personal <strong>My Tickets</strong> page.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  disabled={isBulkGenerating}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBulkGenerating || !bulkCount || parseInt(bulkCount, 10) < 1}
                  className="bg-[#00b87c] hover:bg-[#00a36e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(0,184,124,0.3)] transition-all"
                >
                  {isBulkGenerating ? (
                    <>Generating {bulkCount} Tickets...</>
                  ) : (
                    <>⚡ Generate {bulkCount} Tickets Now</>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* A4 Multi-Ticket Print & Multi-Page PDF Modal */}
      {showA4Modal && (
        <A4PrintModal 
          orders={filteredData} 
          onClose={() => setShowA4Modal(false)} 
        />
      )}

    </div>
  );
};

export default AdminTicketEditor;

