import { useState, useRef } from 'react';
import { Upload, X, Shield, ShieldAlert, Key, User, Mail, Phone, MapPin, Scan } from 'lucide-react';

const AdminUserEditor = ({ formData, setFormData, handleSave, isUploading, handleImageUpload, onCancel }) => {
  const isNew = !formData._id;
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-[#0f172a] rounded-xl shadow-xl border border-zinc-800 p-8 text-white min-h-[70vh]">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            {isNew ? 'Create New User' : 'Edit User Profile'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Manage user account details and permissions</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className={`px-8 py-2.5 rounded-lg font-bold shadow-lg transition-all ${
              isUploading 
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                : 'bg-[#00b87c] text-white hover:bg-[#009c69] shadow-[0_4px_15px_rgba(0,184,124,0.3)]'
            }`}
            disabled={isUploading}
          >
            {isUploading ? 'Saving...' : isNew ? 'Create User' : 'Update User'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Role */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <User size={16} /> Profile Picture
            </h3>
            
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 bg-zinc-900 shadow-xl mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                    <User size={40} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                  </div>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={e => handleImageUpload(e, 'avatar')} 
                accept="image/*" 
                disabled={isUploading} 
              />
              
              <p className="text-xs text-zinc-500 text-center">Click avatar to upload new image. Recommended size: 256x256.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Shield size={16} /> Access Control
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Role</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('role', 'user')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                      formData.role === 'user' 
                        ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/50' 
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('role', 'scanner')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                      formData.role === 'scanner' 
                        ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Scanner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('role', 'admin')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                      formData.role === 'admin' 
                        ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                </div>
                {formData.role === 'admin' && (
                  <p className="text-[10px] text-[#3b82f6] mt-2 flex items-center gap-1">
                    <ShieldAlert size={12} /> Full access to LUNIX admin dashboard.
                  </p>
                )}
                {formData.role === 'scanner' && (
                  <p className="text-[10px] text-[#8b5cf6] mt-2 flex items-center gap-1">
                    <Scan size={12} /> Access to LUNIX ticket scanning interface.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('status', 'Active')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                      formData.status !== 'Inactive' 
                        ? 'bg-[#00b87c]/10 text-[#00b87c] border-[#00b87c]/50' 
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('status', 'Inactive')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                      formData.status === 'Inactive' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/50' 
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
              <Key size={16} /> Account Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-[#00b87c] focus:bg-white transition-colors"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 p-3 text-gray-900 focus:outline-none focus:border-[#00b87c] focus:bg-white transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              {isNew && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password <span className="text-red-500">*</span></label>
                  <input 
                    type="password" 
                    value={formData.password || ''} 
                    onChange={e => handleChange('password', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-[#00b87c] focus:bg-white transition-colors"
                    placeholder="Enter a secure password (min 6 characters)"
                    required={isNew}
                  />
                  <p className="text-xs text-gray-400 mt-2">Required when creating a new user.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
              <Phone size={16} /> Contact Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.phone || ''} 
                    onChange={e => handleChange('phone', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 p-3 text-gray-900 focus:outline-none focus:border-[#00b87c] focus:bg-white transition-colors"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <textarea 
                    value={formData.address || ''} 
                    onChange={e => handleChange('address', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 p-3 text-gray-900 focus:outline-none focus:border-[#00b87c] focus:bg-white transition-colors min-h-[100px] resize-y"
                    placeholder="Enter full address"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminUserEditor;
