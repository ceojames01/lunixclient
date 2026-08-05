import React from 'react';
import { Eye, Settings2, Type, Image as ImageIcon, Video, UploadCloud, Check, Save, X } from 'lucide-react';

const AdminHeroEditor = ({ 
  formData, 
  setFormData, 
  handleSave, 
  isUploading, 
  handleImageUpload 
}) => {
  // Helpers
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // Dynamic preview styling
  const getHeadingSizeClass = (size) => {
    switch(size) {
      case 'Small': return 'text-2xl md:text-3xl';
      case 'Medium': return 'text-3xl md:text-4xl';
      case 'Extra Large': return 'text-5xl md:text-[4rem]';
      case 'Large (Default)':
      default:
        return 'text-4xl md:text-[3rem]';
    }
  };

  const previewHeight = formData.sectionHeight || '85vh';
  const overlayOpacity = formData.overlayOpacity !== undefined ? formData.overlayOpacity : 50;
  
  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Live Preview */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 p-4 bg-white">
          <Eye className="w-5 h-5 text-zinc-900" />
          <h3 className="font-bold text-zinc-900">Live Preview</h3>
        </div>
        <div className="p-4 bg-white">
          <div 
            className="relative w-full rounded-[20px] overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 flex items-end max-h-[350px] sm:max-h-none"
            style={{ minHeight: '300px', height: previewHeight }}
          >
            {/* Background Media */}
            {(formData.mediaType === 'video' || (formData.mediaUrl && formData.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i))) ? (
              <video 
                src={formData.mediaUrl} 
                autoPlay loop muted playsInline 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            ) : formData.mediaUrl ? (
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${formData.mediaUrl})` }} 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-zinc-900">
                No Media URL
              </div>
            )}
            
            {/* Overlay */}
            <div 
              className="absolute inset-0" 
              style={{ background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${(overlayOpacity / 100) * 0.4}) 50%, transparent 100%)` }} 
            />
            
            {/* Content */}
            <div className="relative p-6 md:p-10 w-full z-10">
              {(formData.showBadge !== false) && formData.badgeText && (
                <span className="bg-f1-red text-white text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded inline-block mb-2">
                  {formData.badgeText}
                </span>
              )}
              <h1 className={`font-['Formula1'] uppercase font-bold text-white leading-[1.1] tracking-wide drop-shadow-lg ${getHeadingSizeClass(formData.headingSize)}`}>
                {formData.title || 'HERO TITLE'}
              </h1>

            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Appearance & Layout</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#1a2b4c] font-medium">Overlay Opacity ({overlayOpacity}%)</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={overlayOpacity} 
                onChange={e => handleChange('overlayOpacity', Number(e.target.value))} 
                className="w-full h-1.5 cursor-pointer accent-[#00b87c]"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#1a2b4c] font-medium">Section Height ({formData.sectionHeight || '85vh'})</span>
              </div>
              <input 
                type="range" 
                min="40" max="100" 
                value={parseInt(formData.sectionHeight || '85', 10)} 
                onChange={e => handleChange('sectionHeight', `${e.target.value}vh`)} 
                className="w-full h-1.5 cursor-pointer accent-[#00b87c]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Heading Size</label>
              <select 
                value={formData.headingSize || 'Large (Default)'} 
                onChange={e => handleChange('headingSize', e.target.value)} 
                className="w-full p-2.5 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#00b87c]"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large (Default)">Large (Default)</option>
                <option value="Extra Large">Extra Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-white mt-1 md:mt-7">
              <span className="text-sm text-[#1a2b4c] font-medium">Show Badge</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.showBadge !== false} onChange={e => handleChange('showBadge', e.target.checked)} />
                <div className="w-5 h-5 bg-white border-2 border-zinc-300 peer-focus:outline-none rounded peer peer-checked:bg-[#00b87c] peer-checked:border-[#00b87c] flex items-center justify-center transition-colors">
                  <svg className={`w-3.5 h-3.5 text-white ${formData.showBadge !== false ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Text Content */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Type className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Text Content</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Main Heading</label>
              <input 
                type="text"
                value={formData.title || ''} 
                onChange={e => handleChange('title', e.target.value)} 
                placeholder="ONE MORE CHANCE AT LOVE"
                className="w-full p-2.5 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] placeholder-zinc-500" 
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Badge Text</label>
              <input 
                type="text" 
                value={formData.badgeText || ''} 
                onChange={e => handleChange('badgeText', e.target.value)} 
                placeholder="NEW COLLECTION"
                className="w-full p-2.5 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#00b87c] placeholder-zinc-500" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Background Media */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-zinc-900" />
          <h3 className="font-bold text-zinc-900">Hero Background Media</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Video or Image URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={formData.mediaUrl || ''} 
                onChange={e => {
                  handleChange('mediaUrl', e.target.value);
                  if (e.target.value.match(/\.(mp4|webm|ogg|mov)$/i)) {
                    handleChange('mediaType', 'video');
                  } else {
                    handleChange('mediaType', 'image');
                  }
                }} 
                placeholder="https://..."
                className="flex-1 w-full p-3 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] placeholder-zinc-500" 
              />
              {formData.mediaUrl && (
                <button
                  type="button"
                  onClick={() => handleChange('mediaUrl', '')}
                  className="bg-[#d32f2f] hover:bg-red-600 text-white p-3 rounded-lg flex items-center justify-center transition-colors"
                  title="Clear Media URL"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="border-2 border-dashed border-zinc-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00b87c] hover:bg-zinc-50 transition-colors">
              <ImageIcon className="w-6 h-6 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-900">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              <span className="text-xs text-zinc-500">JPG, PNG, WebP</span>
              <input type="file" className="hidden" onChange={e => { handleChange('mediaType', 'image'); handleImageUpload(e, 'mediaUrl'); }} accept="image/*" disabled={isUploading} />
            </label>
            
            <label className="border-2 border-dashed border-zinc-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00b87c] hover:bg-zinc-50 transition-colors">
              <Video className="w-6 h-6 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-900">{isUploading ? 'Uploading...' : 'Upload Video'}</span>
              <span className="text-xs text-zinc-500">MP4, WebM</span>
              <input type="file" className="hidden" onChange={e => { handleChange('mediaType', 'video'); handleImageUpload(e, 'mediaUrl'); }} accept="video/*" disabled={isUploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        disabled={isUploading || !formData.title || !formData.mediaUrl}
        className="w-full bg-[#00b87c] text-white font-bold text-lg py-4 rounded-xl hover:bg-[#00a36d] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00b87c]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        <Save className="w-5 h-5" />
        Save & Publish Live
      </button>

    </div>
  );
};

export default AdminHeroEditor;
