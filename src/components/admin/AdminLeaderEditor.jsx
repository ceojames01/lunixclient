import React, { useRef, useState } from 'react';
import { Eye, Type, Image as ImageIcon, UploadCloud, Save, X, Info, LayoutList, Check } from 'lucide-react';

const AdminLeaderEditor = ({ 
  formData, 
  setFormData, 
  handleSave, 
  isUploading, 
  handleImageUpload,
  onCancel
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const eMock = { target: { files: e.dataTransfer.files } };
      await handleImageUpload(eMock, 'imageUrl');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-2 h-8 bg-[#00b87c] rounded-full"></div>
        <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-wide">
          {formData._id ? 'Edit Leader' : 'Create New Leader'}
        </h2>
      </div>
      
      {/* 1. Live Preview */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 p-4 bg-white">
          <Eye className="w-5 h-5 text-zinc-900" />
          <h3 className="font-bold text-zinc-900">Card Preview</h3>
        </div>
        <div className="p-8 bg-zinc-100 flex items-center justify-center min-h-[400px]">
          {/* Card exactly as it appears on the frontend */}
          <div className="w-[300px] group cursor-pointer perspective-1000">
            <div className="relative transform-style-3d transition-transform duration-700 w-full aspect-[3/4] group-hover:rotate-y-180">
              
              {/* Front of Card */}
              <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt={formData.name || 'Leader'} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex flex-col items-center justify-center text-zinc-500">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm">No Image</span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                {/* Text Content front */}
                <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-['Formula1'] font-bold text-xl text-white uppercase tracking-wider mb-1">
                    {formData.name || 'Leader Name'}
                  </h3>
                  <p className="text-zinc-300 font-medium tracking-wide">
                    {formData.role || 'Role / Position'}
                  </p>
                </div>
              </div>
              
              {/* Back of Card (Simulated for preview) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#15151e] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold">in</div>
                </div>
                <h4 className="font-['Formula1'] font-bold text-lg text-white uppercase tracking-wider mb-4">
                  {formData.name || 'Leader Name'}
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4">
                  {formData.bio || 'Leader biography preview goes here...'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Image & Order */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-zinc-900" />
              <h3 className="font-bold text-zinc-900">Profile Image</h3>
            </div>
            
            <div className="mb-4 relative">
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Image URL</label>
              <div className="flex items-center">
                <input 
                  type="text"
                  value={formData.imageUrl || ''} 
                  onChange={e => handleChange('imageUrl', e.target.value)} 
                  placeholder="https://..."
                  className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c] pr-10" 
                />
                {formData.imageUrl && (
                  <button 
                    type="button"
                    onClick={() => handleChange('imageUrl', '')}
                    className="absolute right-3 text-red-500 hover:text-red-700 bg-white"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-center text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">OR</div>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive ? "border-[#00b87c] bg-[#00b87c]/5" : "border-zinc-300 hover:border-zinc-400 bg-zinc-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <UploadCloud className={`w-10 h-10 mx-auto mb-4 ${dragActive ? "text-[#00b87c]" : "text-zinc-400"}`} />
              <p className="text-zinc-600 mb-2">Drag and drop an image here</p>
              <p className="text-xs text-zinc-400 mb-4">JPG, PNG or WebP (max. 5MB)</p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e, 'imageUrl')}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 font-bold rounded-lg hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Browse Files'}
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <LayoutList className="w-5 h-5 text-zinc-900" />
              <h3 className="font-bold text-zinc-900">Display Settings</h3>
            </div>
            
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Display Order (Lower numbers show first)</label>
              <input 
                type="number"
                value={formData.displayOrder || 0} 
                onChange={e => handleChange('displayOrder', parseInt(e.target.value) || 0)} 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Type className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Text Content</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Full Name</label>
              <input 
                type="text"
                value={formData.name || ''} 
                onChange={e => handleChange('name', e.target.value)} 
                placeholder="e.g. Jane Doe"
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Role / Position</label>
              <input 
                type="text"
                value={formData.role || ''} 
                onChange={e => handleChange('role', e.target.value)} 
                placeholder="e.g. Chief Executive Officer"
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Biography</label>
              <textarea 
                rows="5"
                value={formData.bio || ''} 
                onChange={e => handleChange('bio', e.target.value)} 
                placeholder="Brief background and accomplishments..."
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] resize-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Instagram Profile URL (Optional)</label>
              <input 
                type="text"
                value={formData.instagramUrl || ''} 
                onChange={e => handleChange('instagramUrl', e.target.value)} 
                placeholder="https://instagram.com/..."
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-4">
        <button 
          onClick={onCancel}
          type="button"
          disabled={isUploading}
          className="px-8 py-3 bg-white border border-zinc-300 text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isUploading}
          className="px-8 py-3 bg-[#00b87c] text-white font-bold rounded-xl shadow-lg shadow-[#00b87c]/20 hover:bg-[#00a36d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-5 h-5" />
              {formData._id ? 'Update Leader' : 'Create Leader'}
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AdminLeaderEditor;
