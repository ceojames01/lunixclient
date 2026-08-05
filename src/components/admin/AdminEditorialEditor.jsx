import React, { useRef, useState } from 'react';
import { Eye, Type, Image as ImageIcon, UploadCloud, Save, X, Info, LayoutList, AlignLeft } from 'lucide-react';

const AdminEditorialEditor = ({ 
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
          {formData._id ? 'Edit Editorial' : 'Create New Editorial'}
        </h2>
      </div>
      
      {/* 1. Live Preview */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 p-4 bg-white">
          <Eye className="w-5 h-5 text-zinc-900" />
          <h3 className="font-bold text-zinc-900">Article Card Preview</h3>
        </div>
        <div className="p-8 bg-zinc-100 flex items-center justify-center min-h-[400px]">
          {/* Card exactly as it appears on the frontend */}
          <div className="w-[400px] bg-black border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-colors shadow-2xl flex flex-col">
            <div className="h-56 relative overflow-hidden bg-zinc-900">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt={formData.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm font-bold tracking-widest uppercase">No Image</span>
                </div>
              )}
              {formData.isEditorsPick && (
                <div className="absolute top-4 left-4 bg-f1-red text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-10 shadow-lg">
                  Editor's Pick
                </div>
              )}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-zinc-800 z-10">
                {formData.category || 'Category'}
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1 bg-[#15151e]">
              <h3 className="font-['Formula1'] font-bold text-white text-lg leading-snug mb-3 line-clamp-2">
                {formData.title || 'Editorial Title Preview'}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                {formData.excerpt || 'Write a short excerpt here to grab the reader\'s attention before they click the article.'}
              </p>
              
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  {formData.author || 'Author Name'}
                </span>
                <span className="text-[#00b87c] text-xs font-bold uppercase tracking-wider hover:text-[#00a36d] cursor-pointer flex items-center gap-1">
                  Read Article →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Image & Settings */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-zinc-900" />
              <h3 className="font-bold text-zinc-900">Cover Image</h3>
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
              <h3 className="font-bold text-zinc-900">Article Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Category</label>
                <input 
                  type="text"
                  value={formData.category || ''} 
                  onChange={e => handleChange('category', e.target.value)}
                  placeholder="e.g. News, Press Release, Corporate" 
                  className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                />
              </div>

              <div>
                <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Author</label>
                <input 
                  type="text"
                  value={formData.author || ''} 
                  onChange={e => handleChange('author', e.target.value)}
                  placeholder="e.g. Lunix Team" 
                  className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900">Editor's Pick</h4>
                  <p className="text-sm text-zinc-500">Highlight this article with a special badge.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isEditorsPick || false} 
                    onChange={e => handleChange('isEditorsPick', e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b87c]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Type className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Article Content</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Headline / Title</label>
              <input 
                type="text"
                value={formData.title || ''} 
                onChange={e => handleChange('title', e.target.value)} 
                placeholder="Catchy article headline..."
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Excerpt (Short Summary)</label>
              <textarea 
                rows="3"
                value={formData.excerpt || ''} 
                onChange={e => handleChange('excerpt', e.target.value)} 
                placeholder="A brief summary that appears on the card..."
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#00b87c] resize-none" 
              />
              <p className="text-xs text-zinc-500 mt-1 flex justify-end">{formData.excerpt?.length || 0} / 500</p>
            </div>
            
            <div className="flex flex-col flex-1">
              <label className="flex items-center gap-2 text-sm text-[#1a2b4c] font-medium mb-2">
                <AlignLeft size={16} /> Full Content
              </label>
              <textarea 
                rows="15"
                value={formData.content || ''} 
                onChange={e => handleChange('content', e.target.value)} 
                placeholder="Write the full article here..."
                className="w-full flex-1 min-h-[300px] p-4 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#00b87c] focus:bg-white resize-y" 
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
              {formData._id ? 'Update Editorial' : 'Create Editorial'}
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AdminEditorialEditor;
