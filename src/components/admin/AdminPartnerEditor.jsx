import React, { useRef, useState } from 'react';
import { Eye, Image as ImageIcon, UploadCloud, Save, X, Settings, Link as LinkIcon, Hash } from 'lucide-react';

const AdminPartnerEditor = ({ 
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
          {formData._id ? 'Edit Partner' : 'Create New Partner'}
        </h2>
      </div>
      
      {/* 1. Live Preview */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 p-4 bg-white">
          <Eye className="w-5 h-5 text-zinc-900" />
          <h3 className="font-bold text-zinc-900">Partner Card Preview</h3>
        </div>
        <div className="p-8 bg-zinc-100 flex items-center justify-center min-h-[300px]">
          {/* Card exactly as it appears on the frontend/admin grid */}
          <div className={`w-[300px] h-[200px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative shadow-2xl flex items-center justify-center p-6 ${!formData.isActive ? 'opacity-50 grayscale' : ''}`}>
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt={formData.name || 'Partner'} className="max-w-full max-h-full object-contain filter hover:brightness-125 transition-all duration-300" />
            ) : (
              <div className="text-zinc-600 font-bold uppercase tracking-widest text-sm flex flex-col items-center gap-2">
                <ImageIcon size={32} className="opacity-50" />
                No Logo Uploaded
              </div>
            )}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${formData.isActive !== false ? 'bg-[#00b87c]' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-zinc-700">
              Order: {formData.displayOrder || 0}
            </div>
            <div className="absolute bottom-3 right-3 text-white font-bold text-xs bg-black/60 px-2 py-1 rounded">
              {formData.name || 'Partner Name'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Image Upload */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Partner Logo</h3>
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
            <p className="text-zinc-600 mb-2">Drag and drop a logo here</p>
            <p className="text-xs text-zinc-400 mb-4">SVG, PNG or WebP with transparent background</p>
            
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
        
        {/* Right Column: Settings */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Partner Details</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Partner Name</label>
              <input 
                type="text"
                value={formData.name || ''} 
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. AWS, Microsoft" 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-[#1a2b4c] font-medium mb-2">
                <LinkIcon size={16} /> Website Link
              </label>
              <input 
                type="text"
                value={formData.link || ''} 
                onChange={e => handleChange('link', e.target.value)}
                placeholder="https://..." 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-[#1a2b4c] font-medium mb-2">
                <Hash size={16} /> Display Order
              </label>
              <input 
                type="number"
                value={formData.displayOrder || 0} 
                onChange={e => handleChange('displayOrder', e.target.value)}
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
              <p className="text-xs text-zinc-500 mt-1">Lower numbers appear first (e.g. 0, 1, 2)</p>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-zinc-900">Active Status</h4>
                <p className="text-sm text-zinc-500">Show this partner on the live site.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.isActive !== false} 
                  onChange={e => handleChange('isActive', e.target.checked)} 
                />
                <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b87c]"></div>
              </label>
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
              {formData._id ? 'Update Partner' : 'Create Partner'}
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AdminPartnerEditor;
