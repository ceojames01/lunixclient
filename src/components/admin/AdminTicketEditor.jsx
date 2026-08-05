import { useState } from 'react';
import { Search, Eye, Download, Trash2, Ticket, CreditCard, ChevronDown, X, User, Copy, MessageCircle, Calendar, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminTicketEditor = ({ activeTab, data, setData, token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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

  const handleUpdateOrderStatus = async (status) => {
    if (!selectedTransaction) return;
    try {
      setIsUpdating(true);
      const res = await api.put(`/admin/orders/${selectedTransaction._id}`, { status });
      if (res.data.success) {
        toast.success(`Order marked as ${status.toLowerCase()}`);
        
        setData(prev => prev.map(order => 
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
      <div className="flex flex-col gap-1 mb-8 mt-4">
        <h2 className="text-3xl font-bold text-white tracking-tight capitalize">
          {activeTab}
        </h2>
        <p className="text-zinc-400 text-sm">
          {activeTab === 'orders' 
            ? 'Manage and fulfill customer orders' 
            : 'Monitor all M-Pesa payments'}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row gap-4 items-center shadow-lg mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder={activeTab === 'orders' ? "Search by name, email, or phone..." : "Search by phone, email, or refer..."}
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

      {/* Data Table */}
      <div className="bg-[#0f172a] rounded-xl overflow-x-auto shadow-lg border border-zinc-800">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead className="bg-[#1e293b] border-b border-zinc-800">
            <tr>
              <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider w-16">Actions</th>
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
                      <button 
                        onClick={() => setSelectedTransaction(order)}
                        className="text-[#00b87c] hover:text-[#00a36e] transition-colors p-1.5 rounded-md hover:bg-[#00b87c]/10"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                    
                    {activeTab === 'orders' ? (
                      <>
                        <td className="p-5 font-mono text-sm font-bold text-white">
                          {order.ticketCode || (order.qrCodeData ? order.qrCodeData.split('-').slice(-2).join('-') : order._id.slice(-6).toUpperCase())}
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-white group-hover:text-[#00b87c] transition-colors">{order.user?.name || 'Unknown User'}</div>
                          <div className="text-sm text-zinc-500">{order.user?.email || 'No email'}</div>
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
                          <div className="font-bold text-white group-hover:text-[#00b87c] transition-colors">{order.user?.phone || 'N/A'}</div>
                        </td>
                        <td className="p-5 text-sm text-zinc-500">
                          {order.user?.email || 'N/A'}
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

      {/* Transaction / Order Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-2xl h-full border-l border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col">
            
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
                        <h5 className="text-white font-bold text-lg">{selectedTransaction.user?.name || 'Unknown User'}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-400 text-sm">{selectedTransaction.user?.email || 'No email'}</span>
                          <button className="text-zinc-500 hover:text-white bg-zinc-800 p-1 rounded-md"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-400 text-sm">{selectedTransaction.user?.phone || 'N/A'}</span>
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
                        <p className="text-white text-sm">{selectedTransaction.user?.phone || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Email</p>
                        <p className="text-white text-sm">{selectedTransaction.user?.email || 'N/A'}</p>
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
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketEditor;
