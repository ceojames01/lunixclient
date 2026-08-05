import { useState, useEffect, useRef } from 'react';
import { Edit2, Clock, Camera, Save, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/Footer';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data?.user) {
          setUser(res.data.user);
          
          try {
            const ordersRes = await api.get('/orders/my-orders', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (ordersRes.data?.success) {
              setOrders(ordersRes.data.data);
            }
          } catch (e) {
            console.error('Failed to fetch orders', e);
          }

          setFormData({
            name: res.data.user.name || '',
            email: res.data.user.email || '',
            phone: res.data.user.phone || '',
            address: res.data.user.address || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      const res = await api.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.user) {
        setUser(res.data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
        window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: res.data.user } }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      const uploadRes = await api.post('/admin/upload', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadRes.data?.url) {
        const updatedData = { ...formData, avatar: uploadRes.data.url };
        const profileRes = await api.put('/auth/profile', updatedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileRes.data?.user) {
          setUser(profileRes.data.user);
          toast.success('Profile photo updated!');
          window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: profileRes.data.user } }));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Navbar />
      <div className="flex-1 py-10 px-4 font-manrope">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
        <div className="bg-[#0e9f6e] rounded-t-2xl p-6 md:p-8 flex justify-between items-center text-white">
          <div>
            <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
            <p className="text-white/80 text-sm">Manage your account information and preferences</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white text-zinc-800 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-zinc-100 transition-colors"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-b-2xl p-6 md:p-10 shadow-sm border border-zinc-100 border-t-0">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-200 border-4 border-white shadow-md">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-3xl font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    className="absolute bottom-0 right-0 bg-[#0e9f6e] text-white p-2 rounded-full border-2 border-white shadow-sm hover:bg-[#0c8a5f] transition-colors z-10"
                    title="Change photo"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                  </button>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-zinc-800">{user.name}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
                  <span className="w-4 h-4 text-zinc-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full p-3.5 rounded-lg border text-zinc-900 ${isEditing ? 'border-zinc-300 bg-white focus:border-zinc-500' : 'border-zinc-100 bg-zinc-50'} disabled:cursor-not-allowed focus:outline-none transition-colors`}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
                  <span className="w-4 h-4 text-zinc-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span>
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full p-3.5 rounded-lg border text-zinc-900 ${isEditing ? 'border-zinc-300 bg-white focus:border-zinc-500' : 'border-zinc-100 bg-zinc-50'} disabled:cursor-not-allowed focus:outline-none transition-colors`}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
                  <span className="w-4 h-4 text-zinc-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
                  Phone Number
                </label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="e.g. +254..."
                  className={`w-full p-3.5 rounded-lg border text-zinc-900 ${isEditing ? 'border-zinc-300 bg-white focus:border-zinc-500' : 'border-zinc-100 bg-zinc-50'} disabled:cursor-not-allowed focus:outline-none transition-colors`}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
                  <span className="w-4 h-4 text-zinc-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
                  Address
                </label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                  className={`w-full p-3.5 rounded-lg border text-zinc-900 ${isEditing ? 'border-zinc-300 bg-white focus:border-zinc-500' : 'border-zinc-100 bg-zinc-50'} disabled:cursor-not-allowed focus:outline-none transition-colors`}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4 mb-10 pt-4 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="bg-white text-zinc-700 border border-zinc-200 px-6 py-2.5 rounded-lg font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#0e9f6e] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#0c8a5f] transition-colors flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}
          </form>

          <div className="border-t border-zinc-100 pt-8">
            <h3 className="text-lg font-bold text-zinc-800 mb-6">Account Information</h3>
            <div className="flex justify-between items-center py-4 border-b border-zinc-50">
              <span className="text-sm text-zinc-500">Account Type</span>
              <span className="text-sm font-medium text-zinc-900 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-sm text-zinc-500">Member Since</span>
              <span className="text-sm font-medium text-zinc-900">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer hideBanner />
    </div>
  );
};

export default Profile;
