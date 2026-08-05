import React from 'react';
import { Eye, Settings2, Type, Image as ImageIcon, Video, Check, Save, X, MapPin, List, Plus, Trash2 } from 'lucide-react';

const AdminScheduleEditor = ({ 
  formData, 
  setFormData, 
  handleSave, 
  isUploading, 
  handleImageUpload 
}) => {
  // Helpers
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSessionChange = (index, field, value) => {
    const newSessions = [...(formData.sessions || [])];
    newSessions[index] = { ...newSessions[index], [field]: value };
    handleChange('sessions', newSessions);
  };

  const addSession = () => {
    const newSessions = [...(formData.sessions || []), { date: '', month: '', title: '' }];
    handleChange('sessions', newSessions);
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...(formData.results || [])];
    newResults[index] = { ...newResults[index], [field]: value };
    handleChange('results', newResults);
  };

  const addResult = () => {
    const newResults = [...(formData.results || []), { name: '', registrationNumber: '', phoneNumber: '' }];
    handleChange('results', newResults);
  };

  const removeResult = (index) => {
    const newResults = [...(formData.results || [])];
    newResults.splice(index, 1);
    handleChange('results', newResults);
  };

  const removeSession = (index) => {
    const newSessions = [...(formData.sessions || [])];
    newSessions.splice(index, 1);
    handleChange('sessions', newSessions);
  };

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
  const sessions = formData.sessions || [];
  const results = formData.results || [];
  
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
            className="relative w-full rounded-[20px] overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center max-h-[350px] sm:max-h-none"
            style={{ minHeight: '300px', height: previewHeight }}
          >
            {/* Background Media */}
            {(formData.mediaUrl && formData.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
              <video 
                src={formData.mediaUrl} 
                autoPlay loop muted playsInline 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            ) : formData.mediaUrl || formData.bannerImage ? (
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${formData.mediaUrl || formData.bannerImage})` }} 
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
            <div className="relative p-6 md:p-10 w-full z-10 text-center">
              <h1 className={`font-['Formula1'] uppercase font-bold text-white leading-[1.1] tracking-wide drop-shadow-lg ${getHeadingSizeClass(formData.headingSize)}`}>
                {formData.title || 'SCHEDULE TITLE'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* 2. Appearance & Layout */}
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
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Title</label>
              <input 
                type="text"
                value={formData.title || ''} 
                onChange={e => handleChange('title', e.target.value)} 
                placeholder="SCHEDULE"
                className="w-full p-2.5 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] placeholder-zinc-500" 
              />
            </div>
          </div>
        </div>

        {/* 4. Location */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Location</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Name</label>
              <input 
                type="text"
                value={formData.locationName || ''} 
                onChange={e => handleChange('locationName', e.target.value)} 
                placeholder="e.g. Silverstone Circuit"
                className="w-full p-2.5 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] placeholder-zinc-500" 
              />
            </div>
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Google Maps Embed Link</label>
              <input 
                type="text"
                value={formData.locationLink || ''} 
                onChange={e => handleChange('locationLink', e.target.value)} 
                placeholder="<iframe src='...' />"
                className="w-full p-2.5 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] placeholder-zinc-500" 
              />
            </div>
          </div>
        </div>

        {/* 5. Image Background Media */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Image Background Media</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.mediaUrl || formData.bannerImage || ''} 
                  onChange={e => { handleChange('mediaUrl', e.target.value); handleChange('bannerImage', e.target.value); }} 
                  placeholder="https://..."
                  className="flex-1 w-full p-3 bg-[#1f2430] border border-[#1f2430] rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] placeholder-zinc-500" 
                />
                {(formData.mediaUrl || formData.bannerImage) && (
                  <button
                    type="button"
                    onClick={() => { handleChange('mediaUrl', ''); handleChange('bannerImage', ''); }}
                    className="bg-[#d32f2f] hover:bg-red-600 text-white p-3 rounded-lg flex items-center justify-center transition-colors"
                    title="Clear Image URL"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="border-2 border-dashed border-zinc-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00b87c] hover:bg-zinc-50 transition-colors">
                <ImageIcon className="w-6 h-6 text-zinc-400" />
                <span className="text-sm font-bold text-zinc-900">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                <span className="text-xs text-zinc-500">JPG, PNG, WebP</span>
                <input type="file" className="hidden" onChange={e => { handleImageUpload(e, 'mediaUrl'); handleImageUpload(e, 'bannerImage'); }} accept="image/*" disabled={isUploading} />
              </label>
            </div>
          </div>
        </div>

        {/* 6. Sessions */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <List className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Sessions</h3>
          </div>
          
          <div className="space-y-6">
            {sessions.map((session, index) => (
              <div key={index} className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 space-y-4 relative">
                <button
                  type="button"
                  onClick={() => removeSession(index)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <h4 className="font-bold text-zinc-700">Session {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Date</label>
                    <input 
                      type="text"
                      value={session.date || ''} 
                      onChange={e => handleSessionChange(index, 'date', e.target.value)} 
                      placeholder="e.g. 12"
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Month</label>
                    <input 
                      type="text"
                      value={session.month || ''} 
                      onChange={e => handleSessionChange(index, 'month', e.target.value)} 
                      placeholder="e.g. AUG"
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Title</label>
                  <input 
                    type="text"
                    value={session.title || ''} 
                    onChange={e => handleSessionChange(index, 'title', e.target.value)} 
                    placeholder="e.g. Practice 1"
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addSession}
              className="w-full py-3 border-2 border-dashed border-[#00b87c] text-[#00b87c] font-bold rounded-xl hover:bg-[#00b87c]/10 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Session
            </button>
          </div>
        </div>

      </div>

      {/* 7. Results */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Check className="w-5 h-5 text-zinc-900" />
          <h3 className="font-bold text-zinc-900">Results</h3>
        </div>
        
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 space-y-4 relative">
              <button
                type="button"
                onClick={() => removeResult(index)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <h4 className="font-bold text-zinc-700">Result {index + 1}</h4>
              
              <div>
                <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Name</label>
                <input 
                  type="text"
                  value={result.name || ''} 
                  onChange={e => handleResultChange(index, 'name', e.target.value)} 
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Registration Number</label>
                <input 
                  type="text"
                  value={result.registrationNumber || ''} 
                  onChange={e => handleResultChange(index, 'registrationNumber', e.target.value)} 
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Phone Number</label>
                <input 
                  type="text"
                  value={result.phoneNumber || ''} 
                  onChange={e => handleResultChange(index, 'phoneNumber', e.target.value)} 
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addResult}
            className="w-full py-3 border-2 border-dashed border-[#00b87c] text-[#00b87c] font-bold rounded-xl hover:bg-[#00b87c]/10 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Result
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        disabled={isUploading || !formData.title}
        className="w-full bg-[#00b87c] text-white font-bold text-lg py-4 rounded-xl hover:bg-[#00a36d] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00b87c]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 mb-10"
      >
        <Save className="w-5 h-5" />
        Save & Publish Live
      </button>

    </div>
  );
};

export default AdminScheduleEditor;
