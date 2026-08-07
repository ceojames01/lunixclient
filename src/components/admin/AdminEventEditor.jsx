import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Calendar, MapPin, Ticket, AlignLeft, Info, 
  UploadCloud, Save, X, Image as ImageIcon, Eye, 
  Plus, Trash2, Clock, Link as LinkIcon, QrCode, Download 
} from 'lucide-react';

const AdminEventEditor = ({ 
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
      await handleImageUpload(eMock, 'posterUrl');
    }
  };

  const addTicketTier = () => {
    const newTiers = [...(formData.ticketTiers || []), { name: '', price: 0 }];
    handleChange('ticketTiers', newTiers);
  };

  const removeTicketTier = (index) => {
    const newTiers = (formData.ticketTiers || []).filter((_, i) => i !== index);
    handleChange('ticketTiers', newTiers);
  };

  const updateTicketTier = (index, field, value) => {
    const newTiers = [...(formData.ticketTiers || [])];
    newTiers[index][field] = field === 'price' ? Number(value) : value;
    handleChange('ticketTiers', newTiers);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('admin-event-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Scale up 4x for high-quality PNG
      const scale = 4;
      const width = parseInt(svg.getAttribute('width') || '160');
      const height = parseInt(svg.getAttribute('height') || '160');
      const padding = 10 * scale; // Add some white padding
      
      canvas.width = (width * scale) + (padding * 2);
      canvas.height = (height * scale) + (padding * 2);
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw scaled image
      ctx.scale(scale, scale);
      ctx.drawImage(img, padding / scale, padding / scale);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${formData.title?.replace(/\s+/g, '-') || 'event'}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-2 h-8 bg-[#00b87c] rounded-full"></div>
        <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-wide">
          {formData._id ? 'Edit Event' : 'Create New Event'}
        </h2>
      </div>
      
      {/* Top Section: Live Preview & Image Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Preview (1 col) */}
        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="flex items-center gap-2 p-4 bg-white">
            <Eye className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Event Card Preview</h3>
          </div>
          <div className="p-6 bg-zinc-100 flex-1 flex items-center justify-center">
            {/* Exact representation of the card in the grid */}
            <div className={`w-full max-w-[320px] aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden relative shadow-2xl ${!formData.isActive ? 'opacity-50 grayscale' : ''}`}>
              {formData.posterUrl ? (
                <img src={formData.posterUrl} alt="Poster" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              ) : (
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900">
                  <ImageIcon size={32} className="opacity-50 mb-2" />
                  <span className="text-xs font-bold tracking-widest uppercase">No Poster</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="absolute top-3 left-3 bg-f1-red text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-lg">
                {formData.eventCode || 'Code'}
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${formData.isActive !== false ? 'bg-[#00b87c]' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
              </div>

              <div className="absolute bottom-0 left-0 p-5 w-full">
                <h3 className="font-['Formula1'] text-white text-lg font-bold uppercase tracking-wider drop-shadow-md leading-tight mb-2">
                  {formData.title || 'Event Title'}
                </h3>
                <div className="flex flex-col gap-1 text-xs text-zinc-300 font-medium">
                  <div className="flex items-center gap-1.5"><Calendar size={12} className="text-[#00b87c]" /> {formData.dateRange || 'Date'}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#00b87c]" /> <span className="truncate">{formData.location || 'Location'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Event Poster</h3>
          </div>
          
          <div className="mb-4 relative">
            <label className="block text-sm text-[#1a2b4c] font-medium mb-2">Image URL</label>
            <div className="flex items-center">
              <input 
                type="text"
                value={formData.posterUrl || ''} 
                onChange={e => handleChange('posterUrl', e.target.value)} 
                placeholder="https://..."
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c] pr-10" 
              />
              {formData.posterUrl && (
                <button 
                  type="button"
                  onClick={() => handleChange('posterUrl', '')}
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
            <p className="text-zinc-600 mb-2">Drag and drop poster image here</p>
            <p className="text-xs text-zinc-400 mb-4">High resolution vertical image recommended (4:5 ratio)</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleImageUpload(e, 'posterUrl')}
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
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Basic Info & Date */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Basic Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Event Title</label>
              <input 
                type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)}
                placeholder="e.g. FORMULA 1 AWS HUNGARIAN GRAND PRIX" 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Event Code</label>
                <input 
                  type="text" value={formData.eventCode || ''} onChange={e => handleChange('eventCode', e.target.value)}
                  placeholder="e.g. E 1" 
                  className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                />
              </div>
              <div>
                <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Event Type</label>
                <input 
                  type="text" value={formData.eventType || ''} onChange={e => handleChange('eventType', e.target.value)}
                  placeholder="e.g. Comedy, Sports" 
                  className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Little Description</label>
              <textarea 
                value={formData.description || ''} onChange={e => handleChange('description', e.target.value)}
                placeholder="Short summary of the event..." 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c] h-24 resize-none" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 pt-6 border-t border-zinc-100">
            <Calendar className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Date & Time</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Date Range</label>
              <input 
                type="text" value={formData.dateRange || ''} onChange={e => handleChange('dateRange', e.target.value)}
                placeholder="e.g. 15 July - 17 July" 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Full Date String</label>
              <input 
                type="text" value={formData.fullDate || ''} onChange={e => handleChange('fullDate', e.target.value)}
                placeholder="e.g. 12 September 2026" 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Time Details</label>
              <input 
                type="text" value={formData.timeDetails || ''} onChange={e => handleChange('timeDetails', e.target.value)}
                placeholder="e.g. 6:00 pm 12/09/26" 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Location & Tickets */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Location</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Venue / Location Name</label>
              <input 
                type="text" value={formData.location || ''} onChange={e => handleChange('location', e.target.value)}
                placeholder="e.g. Madison Square Garden" 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">Google Maps Link</label>
              <input 
                type="url" value={formData.googleMapsLink || ''} onChange={e => handleChange('googleMapsLink', e.target.value)}
                placeholder="https://maps.google.com/..." 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 pt-6 border-t border-zinc-100">
            <Ticket className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900">Ticketing</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#1a2b4c] font-medium mb-1">External Ticket Link</label>
              <input 
                type="url" value={formData.ticketLink || ''} onChange={e => handleChange('ticketLink', e.target.value)}
                placeholder="https://ticketmaster.com/..." 
                className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00b87c]" 
              />
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <div className="bg-zinc-50 p-3 border-b border-zinc-200 flex justify-between items-center">
                <span className="font-bold text-sm text-zinc-700">Ticket Tiers</span>
                <button 
                  type="button" 
                  onClick={addTicketTier} 
                  className="flex items-center gap-1 bg-[#1a2b4c] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1a2b4c]/80 transition-colors"
                >
                  <Plus size={14} /> Add Tier
                </button>
              </div>
              <div className="p-3 space-y-3 bg-white max-h-[200px] overflow-y-auto">
                {(!formData.ticketTiers || formData.ticketTiers.length === 0) && (
                  <div className="text-center text-sm text-zinc-500 py-4">No ticket tiers added.</div>
                )}
                {(formData.ticketTiers || []).map((tier, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                    <input 
                      type="text" placeholder="Tier Name (e.g. VIP)" 
                      value={tier.name} onChange={e => updateTicketTier(idx, 'name', e.target.value)} 
                      className="flex-1 p-2 bg-white border border-zinc-300 rounded text-zinc-900 text-sm focus:outline-none focus:border-[#00b87c]" 
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                      <input 
                        type="number" placeholder="0" 
                        value={tier.price} onChange={e => updateTicketTier(idx, 'price', e.target.value)} 
                        className="w-full p-2 pl-6 bg-white border border-zinc-300 rounded text-zinc-900 text-sm focus:outline-none focus:border-[#00b87c]" 
                      />
                    </div>
                    <button 
                      type="button" onClick={() => removeTicketTier(idx)} 
                      className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-zinc-900">Active Status</h4>
              <p className="text-sm text-zinc-500">Show this event on the live site.</p>
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

          {formData._id && (
            <div className="pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-zinc-900" />
                <h3 className="font-bold text-zinc-900">Event QR Code</h3>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-zinc-200 mb-4 inline-block">
                  <QRCodeSVG 
                    id="admin-event-qr-code"
                    value={`${window.location.origin}/tickets/${formData._id}/book`} 
                    size={160}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"Q"}
                    includeMargin={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-[#00b87c] transition-colors bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-full"
                >
                  <Download size={16} /> Download QR
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-4 bg-white p-4 border border-zinc-200 rounded-xl shadow-sm">
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
              {formData._id ? 'Update Event' : 'Create Event'}
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AdminEventEditor;
