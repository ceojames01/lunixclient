import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, User as UserIcon, Edit, Calendar, MapPin, X } from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/admin/AdminLayout';
import AdminHeroEditor from '../components/admin/AdminHeroEditor';
import AdminScheduleEditor from '../components/admin/AdminScheduleEditor';
import AdminLeaderEditor from '../components/admin/AdminLeaderEditor';
import AdminEditorialEditor from '../components/admin/AdminEditorialEditor';
import AdminPartnerEditor from '../components/admin/AdminPartnerEditor';
import AdminEventEditor from '../components/admin/AdminEventEditor';
import AdminUserEditor from '../components/admin/AdminUserEditor';
import AdminTicketEditor from '../components/admin/AdminTicketEditor';
import { toast } from 'react-hot-toast';

const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('event');

  const [data, setData] = useState({ event: [], hero: [], partners: [], leaders: [], editorials: [], schedule: [], config: {}, users: [], tickets: [] });
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    if (token && token !== 'virtual_preview_token') {
      fetchData();
      if (!adminUser) fetchAdminUser();
    }
  }, [token, activeTab]);

  const fetchAdminUser = async () => {
    try {
      const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      setAdminUser(res.data.user);
    } catch (e) {
      console.error('Fetch admin user error:', e);
    }
  };

  const fetchData = async () => {
    try {
      const endpoints = {
        event: '/admin/event',
        hero: '/admin/hero',
        partners: '/admin/partners',
        leaders: '/admin/leaders',
        editorials: '/admin/editorials',
        schedule: '/admin/schedule',
        config: '/admin/config',
        users: '/admin/users',
        orders: '/admin/orders',
        transactions: '/admin/orders'
      };
      const apiEndpoint = activeTab === 'settings' ? 'config' : activeTab;
      const res = await api.get(endpoints[apiEndpoint], {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedData = res.data.data;
      setData(prev => ({ ...prev, [apiEndpoint]: fetchedData }));
      
      if (activeTab === 'settings') {
        setFormData(fetchedData || {});
      }
      
      if (activeTab === 'hero' || activeTab === 'schedule') {
        const item = fetchedData && fetchedData.length > 0 ? fetchedData[0] : { isNew: true, isActive: true, showBadge: true, overlayOpacity: 50, headingSize: 'Large (Default)', sectionHeight: '85vh', sessions: [] };
        setEditingItem(item);
        setFormData(item);
      }
    } catch (error) {
      if (error.response?.status === 401) handleLogout();
      console.error('Fetch error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      setToken(res.data.token);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.', { style: { background: '#333', color: '#fff' } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  const handleToggleRole = async (user) => {
    if (token === 'virtual_preview_token') {
      toast.success('Role updated (Preview Mode)', { style: { background: '#333', color: '#fff' } });
      return;
    }
    try {
      let newRole = 'user';
      if (user.role === 'user') newRole = 'admin';
      else if (user.role === 'admin') newRole = 'scanner';
      else newRole = 'user';
      await api.put(`/admin/users/${user._id}`, { ...user, role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      toast.success(`Role updated to ${newRole}`, { style: { background: '#333', color: '#fff' } });
    } catch (error) {
      toast.error('Failed to update role', { style: { background: '#333', color: '#fff' } });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    if (token === 'virtual_preview_token') {
      setData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(item => item._id !== id)
      }));
      return;
    }
    try {
      await api.delete(`/admin/${activeTab}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      toast.error('Delete failed', { style: { background: '#333', color: '#fff' } });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (token === 'virtual_preview_token') {
      setData(prev => {
        const currentData = prev[activeTab];
        if (editingItem?._id) {
          return { ...prev, [activeTab]: currentData.map(item => item._id === editingItem._id ? { ...item, ...formData } : item) };
        } else {
          const newItem = { ...formData, _id: Date.now().toString() };
          return { ...prev, [activeTab]: [...currentData, newItem] };
        }
      });
      if (activeTab !== 'hero') {
        setEditingItem(null);
        setFormData({});
      }
      toast.success('Successfully saved (Preview Mode)!', {
        style: { background: '#333', color: '#fff' }
      });
      return;
    }
    try {
      const apiEndpoint = activeTab === 'settings' ? 'config' : activeTab;
      if (apiEndpoint === 'config') {
        await api.put(`/admin/config`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (editingItem?._id) {
        await api.put(`/admin/${apiEndpoint}/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post(`/admin/${apiEndpoint}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      if (activeTab !== 'hero' && activeTab !== 'settings') {
        setEditingItem(null);
        setFormData({});
      }
      fetchData();
      toast.success('Successfully saved & published!', {
        style: { background: '#333', color: '#fff' }
      });
    } catch (error) {
      toast.error('Save failed: ' + (error.response?.data?.message || error.message), {
        style: { background: '#333', color: '#fff' }
      });
    }
  };

  const openForm = (item = null) => {
    setEditingItem(item || { isNew: true });
    setFormData(item || { isActive: true, displayOrder: 0 });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (token === 'virtual_preview_token') {
      toast.error('Uploads are disabled in virtual preview mode.', { style: { background: '#333', color: '#fff' } });
      return;
    }

    setIsUploading(true);
    const form = new FormData();
    form.append('image', file);

    try {
      const res = await api.post('/admin/upload', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setFormData(prev => ({ ...prev, [field]: res.data.url }));
    } catch (error) {
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message), { style: { background: '#333', color: '#fff' } });
    } finally {
      setIsUploading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-sans">
        <form onSubmit={handleLogin} className="bg-[#1e293b] p-8 rounded-2xl border border-zinc-800 shadow-2xl w-96">
          <div className="flex justify-center mb-6">
            <h2 className="text-2xl font-bold tracking-wide text-white">Seekon <span className="text-[#00b87c]">Admin</span></h2>
          </div>
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-4 p-3.5 bg-[#0f172a] rounded-xl border border-zinc-700 focus:outline-none focus:border-[#00b87c] transition-colors" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-6 p-3.5 bg-[#0f172a] rounded-xl border border-zinc-700 focus:outline-none focus:border-[#00b87c] transition-colors" required />
          <button type="submit" className="w-full bg-[#00b87c] text-white font-bold p-3.5 rounded-xl hover:bg-[#00a36d] transition-colors shadow-lg shadow-[#00b87c]/20">Sign In to Dashboard</button>
        </form>
      </div>
    );
  }

  const renderForm = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSave} className="bg-zinc-900 p-8 rounded-xl border border-zinc-700 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-6 text-white uppercase">{editingItem?.isNew ? 'Create' : 'Edit'} {activeTab.slice(0,-1)}</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {activeTab === 'users' && (
            <>
              <input type="text" placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" required />
              <input type="email" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" required />
              <input type={editingItem?.isNew ? "password" : "text"} placeholder={editingItem?.isNew ? "Password (Required)" : "Password (leave blank to keep current)"} value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" required={editingItem?.isNew} />
              <input type="text" placeholder="Phone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" />
              <select value={formData.role || 'user'} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="scanner">Scanner</option>
              </select>
              <select value={formData.status || 'Active'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </>
          )}

          {activeTab === 'hero' && (
            <>
              <input type="text" placeholder="Title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" required />
              <input type="text" placeholder="Badge Text (e.g. UNLOCKED)" value={formData.badgeText || ''} onChange={e => setFormData({...formData, badgeText: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" />
              <div className="flex gap-2 items-center">
                <input type="text" placeholder="Media URL (Image or Video link)" value={formData.mediaUrl || ''} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} className="flex-1 p-2 bg-black border border-zinc-700 rounded text-white" required />
                <label className="bg-zinc-800 px-4 py-2 rounded text-white cursor-pointer hover:bg-zinc-700 text-sm font-bold whitespace-nowrap">
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'mediaUrl')} accept="image/*,video/*" disabled={isUploading} />
                </label>
              </div>
              <select value={formData.mediaType || 'image'} onChange={e => setFormData({...formData, mediaType: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <label className="flex items-center text-white"><input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2" /> Active</label>
            </>
          )}
          {activeTab === 'schedule' && (
            <>
              <input type="text" placeholder="Title (e.g. FORMULA 1 AWS HUNGARIAN GRAND PRIX)" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" required />
              <div className="flex gap-2 items-center">
                <input type="text" placeholder="Banner Image URL" value={formData.bannerImage || ''} onChange={e => setFormData({...formData, bannerImage: e.target.value})} className="flex-1 p-2 bg-black border border-zinc-700 rounded text-white" required />
                <label className="bg-zinc-800 px-4 py-2 rounded text-white cursor-pointer hover:bg-zinc-700 text-sm font-bold whitespace-nowrap">
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'bannerImage')} accept="image/*" disabled={isUploading} />
                </label>
              </div>
              <input type="text" placeholder="Location Name (e.g. KUTUS)" value={formData.locationName || ''} onChange={e => setFormData({...formData, locationName: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" />
              <input type="url" placeholder="Google Maps Embed Link for Map (Optional)" value={formData.locationLink || ''} onChange={e => setFormData({...formData, locationLink: e.target.value})} className="w-full p-2 bg-black border border-zinc-700 rounded text-white" />
              <label className="flex items-center text-white"><input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2" /> Active</label>
              
              <div className="border border-zinc-700 p-4 rounded bg-black">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-sm text-zinc-400">Sessions</span>
                  <button type="button" onClick={() => setFormData({...formData, sessions: [...(formData.sessions || []), { date: '', month: '', title: '' }]})} className="bg-f1-red px-2 py-1 rounded text-xs">+ Add Session</button>
                </div>
                {(formData.sessions || []).map((session, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input type="text" placeholder="Date (24)" value={session.date} onChange={e => { const newSessions = [...formData.sessions]; newSessions[idx].date = e.target.value; setFormData({...formData, sessions: newSessions}); }} className="w-16 p-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm" />
                    <input type="text" placeholder="Month (JUL)" value={session.month} onChange={e => { const newSessions = [...formData.sessions]; newSessions[idx].month = e.target.value; setFormData({...formData, sessions: newSessions}); }} className="w-20 p-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm" />
                    <input type="text" placeholder="Title (PRACTICE 1)" value={session.title} onChange={e => { const newSessions = [...formData.sessions]; newSessions[idx].title = e.target.value; setFormData({...formData, sessions: newSessions}); }} className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm" />

                    <button type="button" onClick={() => { const newSessions = formData.sessions.filter((_, i) => i !== idx); setFormData({...formData, sessions: newSessions}); }} className="text-red-500 hover:text-red-400 font-bold px-2">X</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-zinc-400 hover:text-white" disabled={isUploading}>Cancel</button>
          <button type="submit" className={`px-6 py-2 font-bold rounded ${isUploading ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' : 'bg-f1-red text-white'}`} disabled={isUploading}>Save</button>
        </div>
      </form>
    </div>
  );

  return (
    <AdminLayout activeTab={activeTab} onTabChange={(tab) => {
      setActiveTab(tab);
      if (tab === 'hero' || tab === 'schedule') {
        const item = data[tab] && data[tab].length > 0 ? data[tab][0] : { isNew: true };
        setEditingItem(item);
        setFormData(item);
      } else {
        setEditingItem(null);
        setFormData({});
      }
      if (tab === 'settings') setFormData(data.config || {});
    }} onLogout={handleLogout} adminUser={adminUser}>
      {activeTab !== 'orders' && activeTab !== 'transactions' && (
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">
              {activeTab === 'users' ? 'Users' : 
               activeTab === 'settings' ? 'Website Settings' : 
               activeTab === 'dashboard' ? 'Dashboard Overview' : 
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-sm text-zinc-400">
              {activeTab === 'users' ? 'Manage all registered users' : 
               activeTab === 'dashboard' ? "Welcome back! Here's what's happening with your business." :
               'Manage your platform content.'}
            </p>
          </div>
          
          {activeTab !== 'settings' && activeTab !== 'dashboard' && activeTab !== 'hero' && activeTab !== 'schedule' && (!editingItem || (activeTab !== 'leaders' && activeTab !== 'editorials' && activeTab !== 'partners' && activeTab !== 'event')) && (
            <button 
              onClick={() => openForm()} 
              className="w-full sm:w-auto justify-center bg-[#00b87c] text-white font-bold px-4 py-2.5 rounded-lg hover:bg-[#00a36d] transition-colors flex items-center gap-2 shadow-lg shadow-[#00b87c]/20"
            >
              + Add {activeTab === 'users' ? 'User' : 'New'}
            </button>
          )}
        </div>
      )}

        <div className={(activeTab === 'hero' || activeTab === 'schedule' || activeTab === 'leaders' || activeTab === 'editorials' || activeTab === 'partners' || activeTab === 'event' || activeTab === 'users' || activeTab === 'orders' || activeTab === 'transactions') ? "" : "bg-[#1e293b] rounded-xl border border-zinc-800 overflow-hidden shadow-sm"}>
          {activeTab === 'users' && !editingItem && (
            <div className="bg-[#0f172a] p-5 rounded-xl border border-zinc-800 mb-6 shadow-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or phone..." 
                  className="w-full bg-[#1e293b] border border-zinc-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#00b87c] transition-colors"
                />
              </div>
            </div>
          )}
          {activeTab === 'settings' ? (
            <form onSubmit={handleSave} className="p-8">
              <div className="mb-6">
                <label className="block text-zinc-400 text-sm font-bold mb-2">Editor's Picks "See All" Drive Link</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://drive.google.com/..." value={formData.editorsPicksLink || ''} onChange={e => setFormData({...formData, editorsPicksLink: e.target.value})} className="flex-1 w-full p-3 bg-[#0f172a] border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#00b87c]" />
                  {formData.editorsPicksLink && (
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, editorsPicksLink: ''})}
                      className="bg-[#d32f2f] hover:bg-red-600 text-white p-3 rounded-xl flex items-center justify-center transition-colors"
                      title="Clear Link"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-8">
                <label className="flex items-center text-white cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.showExecutiveBoard !== false ? 'bg-[#00b87c]' : 'bg-zinc-700'} mr-4 flex`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.showExecutiveBoard !== false ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <input type="checkbox" checked={formData.showExecutiveBoard !== false} onChange={e => setFormData({...formData, showExecutiveBoard: e.target.checked})} className="hidden" /> 
                  <span className="font-bold">Show Executive Board section</span>
                </label>
              </div>
              <button type="submit" className={`px-6 py-2.5 font-bold rounded-lg transition-colors shadow-lg ${isUploading ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' : 'bg-[#00b87c] text-white hover:bg-[#00a36d] shadow-[#00b87c]/20'}`} disabled={isUploading}>Save Settings</button>
            </form>
          ) : activeTab === 'dashboard' ? (
            <div className="p-8 text-center text-zinc-400 py-20">
              Dashboard Overview components will be built here in Phase 2
            </div>

          ) : activeTab === 'hero' ? (
            <AdminHeroEditor 
              formData={formData} 
              setFormData={setFormData} 
              handleSave={handleSave} 
              isUploading={isUploading} 
              handleImageUpload={handleImageUpload} 
            />
          ) : activeTab === 'schedule' ? (
            <AdminScheduleEditor 
              formData={formData} 
              setFormData={setFormData} 
              handleSave={handleSave} 
              isUploading={isUploading} 
              handleImageUpload={handleImageUpload} 
            />
          ) : activeTab === 'leaders' && editingItem ? (
            <AdminLeaderEditor 
              formData={formData} 
              setFormData={setFormData} 
              handleSave={handleSave} 
              isUploading={isUploading} 
              handleImageUpload={handleImageUpload}
              onCancel={() => setEditingItem(null)}
            />
          ) : activeTab === 'leaders' && !editingItem ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(data.leaders || []).map(leader => (
                <div key={leader._id} className="bg-[#0f172a] border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-[#00b87c] transition-colors shadow-lg">
                  <div className="h-56 bg-zinc-900 relative group">
                    {leader.imageUrl ? (
                      <img src={leader.imageUrl} alt={leader.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><UserIcon size={48} /></div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded border border-zinc-700">
                      Order: {leader.displayOrder}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 bg-white">
                    <h3 className="font-['Formula1'] font-bold text-zinc-900 tracking-wide truncate">{leader.name}</h3>
                    <p className="text-sm text-zinc-500 mb-4 truncate font-medium">{leader.role}</p>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-200">
                      <button onClick={() => openForm(leader)} className="text-[#3b82f6] hover:text-blue-500 font-bold text-sm flex items-center gap-1.5 transition-colors"><Edit size={16} /> Edit</button>
                      <button onClick={() => handleDelete(leader._id)} className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-1.5 transition-colors"><Trash2 size={16} /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.leaders || data.leaders.length === 0) && (
                <div className="col-span-full py-20 text-center text-zinc-500">No leaders found. Click "Add New" to create one.</div>
              )}
            </div>
          ) : activeTab === 'editorials' && editingItem ? (
            <AdminEditorialEditor 
              formData={formData} 
              setFormData={setFormData} 
              handleSave={handleSave} 
              isUploading={isUploading} 
              handleImageUpload={handleImageUpload}
              onCancel={() => setEditingItem(null)}
            />
          ) : activeTab === 'editorials' && !editingItem ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.editorials || []).map((article, idx) => {
                const isWide = (idx % 6 === 0) || (idx % 6 === 5);
                return (
                  <div 
                    key={article._id} 
                    className={`relative overflow-hidden rounded-3xl group shadow-2xl border border-zinc-800 hover:border-zinc-500 transition-colors ${
                      isWide ? 'lg:col-span-2' : 'lg:col-span-1'
                    } h-[300px]`}
                  >
                    {article.imageUrl ? (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600">
                        <span className="text-xs font-bold tracking-widest uppercase">No Image</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button onClick={() => openForm(article)} className="bg-blue-600/90 text-white p-2.5 rounded-full hover:bg-blue-500 shadow-lg backdrop-blur" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(article._id)} className="bg-red-600/90 text-white p-2.5 rounded-full hover:bg-red-500 shadow-lg backdrop-blur" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4 z-20 flex gap-2 flex-col items-start">
                      {article.isEditorsPick && (
                        <div className="bg-f1-red text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-lg">
                          Editor's Pick
                        </div>
                      )}
                      <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-zinc-700 shadow-lg">
                        {article.category || 'Category'}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 p-6 w-full z-10 flex flex-col justify-end transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-['Formula1'] text-white text-base sm:text-lg font-bold uppercase tracking-wider drop-shadow-md line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-zinc-300 text-xs tracking-wide mt-2 line-clamp-2 font-medium">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!data.editorials || data.editorials.length === 0) && (
                <div className="col-span-full py-20 text-center text-zinc-500">No editorials found. Click "Add New" to create one.</div>
              )}
            </div>
          ) : activeTab === 'partners' && editingItem ? (
            <AdminPartnerEditor 
              formData={formData} 
              setFormData={setFormData} 
              handleSave={handleSave} 
              isUploading={isUploading} 
              handleImageUpload={handleImageUpload}
              onCancel={() => setEditingItem(null)}
            />
          ) : activeTab === 'partners' && !editingItem ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {(data.partners || []).map(partner => (
                <div key={partner._id} className={`bg-[#0f0a0a] border ${partner.isActive !== false ? 'border-zinc-800 hover:border-[#00b87c]' : 'border-red-900/50 hover:border-red-500'} rounded-2xl overflow-hidden flex flex-col transition-colors shadow-lg relative group h-[200px] flex items-center justify-center p-8 ${partner.isActive === false ? 'opacity-50 grayscale' : ''}`}>
                  {partner.imageUrl ? (
                    <img src={partner.imageUrl} alt={partner.name} className="max-w-full max-h-full object-contain filter hover:brightness-125 transition-all duration-300" />
                  ) : (
                    <div className="text-zinc-600 font-bold uppercase tracking-widest text-sm text-center">No Logo</div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${partner.isActive !== false ? 'bg-[#00b87c]' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-zinc-700">
                    Order: {partner.displayOrder || 0}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                    <span className="text-white font-bold text-lg text-center px-2">{partner.name}</span>
                    <div className="flex gap-3">
                      <button onClick={() => openForm(partner)} className="bg-[#3b82f6] text-white p-3 rounded-full hover:bg-blue-500 transition-colors shadow-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(partner._id)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-500 transition-colors shadow-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.partners || data.partners.length === 0) && (
                <div className="col-span-full py-20 text-center text-zinc-500">No partners found. Click "Add New" to create one.</div>
              )}
            </div>
          ) : activeTab === 'event' && editingItem ? (
            <AdminEventEditor 
              formData={formData} 
              setFormData={setFormData} 
              handleSave={handleSave} 
              isUploading={isUploading} 
              handleImageUpload={handleImageUpload}
              onCancel={() => setEditingItem(null)}
            />
          ) : activeTab === 'event' && !editingItem ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {(data.event || []).map(event => (
                <div key={event._id} className={`w-full aspect-[4/5] bg-zinc-900 border ${event.isActive !== false ? 'border-zinc-800 hover:border-[#00b87c]' : 'border-red-900/50 hover:border-red-500'} rounded-2xl overflow-hidden relative shadow-lg group ${event.isActive === false ? 'opacity-60 grayscale' : ''}`}>
                  {event.posterUrl ? (
                    <img src={event.posterUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-80 filter hover:brightness-110 transition-all duration-500" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900">
                      <span className="text-xs font-bold tracking-widest uppercase">No Poster</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 bg-f1-red text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-lg">
                    {event.eventCode || 'Code'}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${event.isActive !== false ? 'bg-[#00b87c]' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                  </div>

                  <div className="absolute bottom-0 left-0 p-5 w-full flex flex-col justify-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-['Formula1'] text-white text-lg font-bold uppercase tracking-wider drop-shadow-md leading-tight mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex flex-col gap-1 text-xs text-zinc-300 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1.5"><Calendar size={12} className="text-[#00b87c]" /> {event.dateRange}</div>
                      <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#00b87c]" /> <span className="truncate">{event.location}</span></div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                    <div className="flex gap-3">
                      <button onClick={() => openForm(event)} className="bg-[#3b82f6] text-white p-3 rounded-full hover:bg-blue-500 transition-colors shadow-lg"><Edit size={20} /></button>
                      <button onClick={() => handleDelete(event._id)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-500 transition-colors shadow-lg"><Trash2 size={20} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.event || data.event.length === 0) && (
                <div className="col-span-full py-20 text-center text-zinc-500">No events found. Click "Add New" to create one.</div>
              )}
            </div>
          ) : (activeTab === 'orders' || activeTab === 'transactions') ? (
            <AdminTicketEditor 
              activeTab={activeTab}
              data={data[activeTab] || []} 
              setData={(newData) => setData(prev => ({ ...prev, [activeTab]: newData }))} 
              token={token} 
            />
          ) : activeTab === 'users' && editingItem ? (
            <AdminUserEditor 
              formData={formData} 
              setFormData={setFormData} 
              handleSave={handleSave} 
              isUploading={isUploading} 
              handleImageUpload={handleImageUpload}
              onCancel={() => setEditingItem(null)}
            />
          ) : activeTab === 'users' && !editingItem ? (
            <div className="bg-[#0f172a] rounded-xl overflow-x-auto shadow-lg border border-zinc-800" data-hmr-trigger="true">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                <thead className="bg-[#1e293b] border-b border-zinc-800">
                  <tr>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">User Details</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Contact</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider">Role</th>
                    <th className="p-5 text-xs font-bold uppercase text-zinc-400 tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {(data.users || []).map(user => (
                    <tr key={user._id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-[#00b87c] transition-colors">{user.name}</div>
                            <div className="text-sm text-zinc-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-zinc-400">
                        <div>{user.phone || 'N/A'}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-[150px]">{user.address || 'No address'}</div>
                      </td>
                      <td className="p-5">
                        <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${user.status === 'Inactive' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#00b87c]/10 text-[#00b87c] border border-[#00b87c]/20'}`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-5">
                        <button 
                          onClick={() => handleToggleRole(user)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider capitalize transition-all border ${user.role === 'admin' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30 hover:bg-[#3b82f6]/20' : user.role === 'scanner' ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/30 hover:bg-[#00b87c]/20' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'}`}
                        >
                          {user.role || 'user'}
                        </button>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openForm(user)} className="bg-zinc-800 hover:bg-[#3b82f6] text-zinc-400 hover:text-white p-2 rounded-lg transition-colors shadow-sm" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(user._id)} className="bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white p-2 rounded-lg transition-colors shadow-sm" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data.users || data.users.length === 0) && (
                    <tr><td colSpan="5" className="p-10 text-center text-zinc-500">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-950">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase text-zinc-500">Name / Title</th>
                  <th className="p-4 text-xs font-bold uppercase text-zinc-500">Details</th>
                  <th className="p-4 text-xs font-bold uppercase text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data[activeTab] || []).map(item => (
                  <tr key={item._id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4 font-bold">{item.name || item.title || item.eventCode}</td>
                    <td className="p-4 text-sm text-zinc-400">
                      {activeTab === 'hero' && formData?.mediaType}
                      {activeTab === 'schedule' && `${item.sessions?.length || 0} sessions`}
                      {activeTab === 'partners' && <img src={item.imageUrl} alt="logo" className="h-6 object-contain bg-zinc-800 p-1" />}
                      {activeTab === 'leaders' && item.role}
                      {activeTab === 'editorials' && item.category}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-6">
                      <button onClick={() => openForm(item)} className="text-[#3b82f6] hover:text-blue-400 transition-colors" title="Edit">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="text-[#ff6b6b] hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!data[activeTab] || data[activeTab].length === 0) && (
                  <tr><td colSpan="3" className="p-8 text-center text-zinc-500">No {activeTab} found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      {editingItem && activeTab !== 'hero' && activeTab !== 'schedule' && activeTab !== 'leaders' && activeTab !== 'editorials' && activeTab !== 'partners' && activeTab !== 'event' && activeTab !== 'users' && renderForm()}
    </AdminLayout>
  );
};

export default Admin;
