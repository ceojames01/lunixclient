import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Calendar, MapPin, Ticket, AlignLeft, Info, 
  UploadCloud, Save, X, Image as ImageIcon, Eye, 
  Plus, Trash2, Clock, Link as LinkIcon, QrCode, Download,
  FileCode, Layers, Sparkles, ExternalLink, CheckCircle2, FileText, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import TicketPass from '../ticket/TicketPass';

const AdminEventEditor = ({ 
  formData, 
  setFormData, 
  handleSave, 
  isUploading, 
  handleImageUpload,
  onCancel,
  token,
  eventsCount = 0,
  onVenueBannerChange
}) => {
  const fileInputRef = useRef(null);
  const psdFileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [psdDragActive, setPsdDragActive] = useState(false);
  const [isPsdProcessing, setIsPsdProcessing] = useState(false);
  const [psdStatusText, setPsdStatusText] = useState('');
  const [psdUploadProgress, setPsdUploadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState('pass'); // 'pass' | 'raw'

  const isSingleEvent = eventsCount === 1;
  const isCurrentBanner = Boolean(formData.isVenueBanner || (isSingleEvent && formData.isActive !== false));

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleVenueBannerToggle = async (checked) => {
    if (isSingleEvent) {
      toast('Single event is automatically the default banner.', { icon: 'ℹ️' });
      return;
    }
    handleChange('isVenueBanner', checked);
    if (formData._id && token) {
      try {
        if (checked) {
          await api.put(`/admin/event/${formData._id}/set-banner`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('⭐ Navbar Venue Banner updated to this event!', { style: { background: '#333', color: '#fff' } });
        } else {
          await api.put(`/admin/event/${formData._id}`, { ...formData, isVenueBanner: false }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Venue Banner unset for this event.', { style: { background: '#333', color: '#fff' } });
        }
        if (onVenueBannerChange) {
          onVenueBannerChange(formData._id, checked);
        }
      } catch (err) {
        console.error('Failed to update venue banner:', err);
        toast.error('Failed to update venue banner');
      }
    }
  };

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

  const handlePsdDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPsdDragActive(true);
    } else if (e.type === "dragleave") {
      setPsdDragActive(false);
    }
  };

  const handlePsdDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPsdDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processPsdOrLayoutFile(e.dataTransfer.files[0]);
    }
  };

  const handlePsdFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processPsdOrLayoutFile(e.target.files[0]);
    }
  };

  const processPsdOrLayoutFile = async (file) => {
    if (!file) return;
    const isPsd = file.name.toLowerCase().endsWith('.psd') || file.type.includes('photoshop') || file.type.includes('psd');
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);

    try {
      setIsPsdProcessing(true);
      setPsdUploadProgress(0);

      let extractedBlob = null;

      // STEP 1: INSTANT CLIENT-SIDE PREVIEW (under 200ms)
      if (isPsd) {
        setPsdStatusText('Parsing PSD layers for instant preview...');
        try {
          const { readPsd, initializeCanvas } = await import('ag-psd');
          initializeCanvas((width, height) => {
            const c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            return c;
          });

          const buffer = await file.arrayBuffer();
          const psd = readPsd(buffer, { skipLayerImageData: true });

          if (psd && psd.canvas) {
            // High-quality JPEG blob (usually 300KB-600KB vs 20MB raw PNG)
            extractedBlob = await new Promise(res => psd.canvas.toBlob(res, 'image/jpeg', 0.92));
            if (extractedBlob) {
              const localUrl = URL.createObjectURL(extractedBlob);
              // Instantly update ticket layout preview!
              handleChange('ticketTemplateUrl', localUrl);
              handleChange('psdFileName', file.name);
              handleChange('psdFileSize', `${fileSizeMb} MB`);
            }
          }
        } catch (parseError) {
          console.warn('Instant PSD preview notice:', parseError);
        }
      } else {
        // Direct image (PNG, JPG, WEBP)
        const localUrl = URL.createObjectURL(file);
        handleChange('ticketTemplateUrl', localUrl);
        handleChange('psdFileName', file.name);
        handleChange('psdFileSize', `${fileSizeMb} MB`);
      }

      // STEP 2: UPLOAD MASTER FILE TO SERVER WITH REAL-TIME PROGRESS
      setPsdStatusText(`Uploading ${isPsd ? 'PSD layout master' : 'template image'} (${fileSizeMb} MB)...`);
      const form = new FormData();
      form.append('image', file);

      const uploadRes = await api.post('/admin/upload?isLayout=true', form, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPsdUploadProgress(percent);
          }
        }
      });

      const uploadedMasterUrl = uploadRes.data?.url;
      const finalFileSize = uploadRes.data?.fileSize || `${fileSizeMb} MB`;

      if (isPsd) {
        handleChange('psdUrl', uploadedMasterUrl);
        handleChange('psdFileName', file.name);
        handleChange('psdFileSize', finalFileSize);

        // STEP 3: UPLOAD OPTIMIZED EXTRACTED TICKET TEMPLATE IF AVAILABLE
        if (extractedBlob) {
          setPsdStatusText('Saving extracted ticket template...');
          setPsdUploadProgress(95);
          const templateFile = new File([extractedBlob], `${file.name.replace(/\.[^/.]+$/, "")}-template.jpg`, { type: 'image/jpeg' });
          const tplForm = new FormData();
          tplForm.append('image', templateFile);
          const tplRes = await api.post('/admin/upload?isLayout=true', tplForm);
          if (tplRes.data?.url) {
            handleChange('ticketTemplateUrl', tplRes.data.url);
          }
        } else if (!formData.ticketTemplateUrl) {
          handleChange('ticketTemplateUrl', uploadedMasterUrl);
        }

        toast.success(`🎉 Attached PSD ticket layout: ${file.name}`);
      } else {
        handleChange('ticketTemplateUrl', uploadedMasterUrl);
        handleChange('psdFileName', file.name);
        handleChange('psdFileSize', finalFileSize);
        toast.success(`🎉 Attached ticket template image: ${file.name}`);
      }

      setPsdUploadProgress(100);
    } catch (err) {
      console.error('PSD / layout upload error:', err);
      toast.error('Failed to upload layout file: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPsdProcessing(false);
      setPsdStatusText('');
      setPsdUploadProgress(0);
      if (psdFileInputRef.current) psdFileInputRef.current.value = '';
    }
  };

  const handleRemoveLayout = () => {
    handleChange('ticketTemplateUrl', '');
    handleChange('psdUrl', '');
    handleChange('psdFileName', '');
    handleChange('psdFileSize', '');
    toast.success('Reverted to default Lunix ticket template');
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

            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-zinc-50 p-3 border-b border-zinc-200 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-zinc-800">Ticket Tiers & Pricing</span>
                  <span className="text-[11px] text-zinc-500 font-medium">({formData.ticketTiers?.length || 0})</span>
                </div>
                <button 
                  type="button" 
                  onClick={addTicketTier} 
                  className="flex items-center gap-1.5 bg-[#1a2b4c] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1a2b4c]/85 transition-colors shadow-sm"
                >
                  <Plus size={14} /> Add Tier
                </button>
              </div>
              <div className="p-3 space-y-2.5 bg-white max-h-[260px] overflow-y-auto">
                {(!formData.ticketTiers || formData.ticketTiers.length === 0) && (
                  <div className="text-center text-xs text-zinc-500 py-6">
                    No ticket tiers added. Click "+ Add Tier" to create pricing categories (e.g. Regular, VIP).
                  </div>
                )}
                {(formData.ticketTiers || []).map((tier, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors">
                    <div className="flex-1 min-w-0">
                      <input 
                        type="text" 
                        placeholder="Tier Name (e.g. Regular, VIP, Early Bird)" 
                        value={tier.name} 
                        onChange={e => updateTicketTier(idx, 'name', e.target.value)} 
                        className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#00b87c]" 
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative flex-1 sm:w-36 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-[11px] select-none">
                          KSh
                        </span>
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          value={tier.price} 
                          onChange={e => updateTicketTier(idx, 'price', e.target.value)} 
                          className="w-full p-2 pl-10 bg-white border border-zinc-300 rounded-lg text-zinc-900 text-xs sm:text-sm font-bold focus:outline-none focus:border-[#00b87c]" 
                        />
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeTicketTier(idx)} 
                        className="text-red-500 hover:text-red-700 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                        title="Remove tier"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h4 className="font-bold text-zinc-900">Venue Banner Event</h4>
                {isCurrentBanner && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Current Banner
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">
                Display this event's venue in the client top ribbon below the navbar. If only 1 event exists, it is the automatic default.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                disabled={isSingleEvent}
                checked={isCurrentBanner} 
                onChange={e => handleVenueBannerToggle(e.target.checked)} 
              />
              <div className={`w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 ${isSingleEvent ? 'opacity-60 cursor-not-allowed' : ''}`}></div>
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

      {/* Ticket Layout & PSD Template Master Section */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                Event Ticket PSD & Layout Template
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-zinc-500">
                Drop or add a Photoshop (.psd) or template image for this event. Generated orders and passes will automatically adopt this layout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formData.ticketTemplateUrl || formData.psdUrl ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Custom Event Layout Active
              </span>
            ) : (
              <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                Using Default Lunix Template
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Drag & Drop Area + File Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div 
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                psdDragActive ? "border-indigo-500 bg-indigo-50/40" : "border-zinc-300 hover:border-zinc-400 bg-zinc-50/60"
              }`}
              onDragEnter={handlePsdDrag}
              onDragLeave={handlePsdDrag}
              onDragOver={handlePsdDrag}
              onDrop={handlePsdDrop}
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-100/60 flex items-center justify-center text-indigo-600 shadow-sm">
                <FileCode className="w-7 h-7" />
              </div>

              <h4 className="font-bold text-zinc-800 text-sm mb-1">
                Drop your Photoshop (.psd) file here
              </h4>
              <p className="text-xs text-zinc-500 mb-4 max-w-xs mx-auto">
                Supports Adobe Photoshop <strong>.psd</strong> files, as well as high-res <strong>.png</strong> or <strong>.jpg</strong> ticket template layouts.
              </p>

              <input 
                type="file"
                ref={psdFileInputRef}
                onChange={handlePsdFileChange}
                accept=".psd,image/*"
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => psdFileInputRef.current?.click()}
                  disabled={isPsdProcessing || isUploading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <UploadCloud size={16} /> Browse PSD / Image
                </button>
              </div>

              {isPsdProcessing && (
                <div className="mt-4 p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-2 text-left shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <span className="font-semibold truncate">{psdStatusText || 'Processing layout file...'}</span>
                    </div>
                    {psdUploadProgress > 0 && (
                      <span className="font-mono text-indigo-700 font-bold shrink-0">{psdUploadProgress}%</span>
                    )}
                  </div>
                  {psdUploadProgress > 0 && (
                    <div className="w-full bg-indigo-200/70 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${psdUploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Attached Layout Card */}
            {(formData.psdUrl || formData.ticketTemplateUrl) && (
              <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      PSD
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 text-xs truncate">
                        {formData.psdFileName || (formData.psdUrl ? formData.psdUrl.split('/').pop() : 'Custom Ticket Layout')}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {formData.psdFileSize || 'Master Layout Attached'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {formData.psdUrl && (
                      <a
                        href={formData.psdUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Download PSD file"
                      >
                        <Download size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveLayout}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove custom layout"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Direct layout URL */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Template Image URL (Rendered Layer)</label>
                  <input 
                    type="text" 
                    value={formData.ticketTemplateUrl || ''} 
                    onChange={e => handleChange('ticketTemplateUrl', e.target.value)} 
                    placeholder="https://res.cloudinary.com/... or /uploads/..."
                    className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Live Ticket Preview (7 Cols) */}
          <div className="lg:col-span-7 bg-zinc-950 rounded-2xl border border-zinc-800 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#00b87c]" />
                <span className="font-['Formula1'] font-bold text-xs uppercase text-white tracking-wider">
                  Live Ticket Layout Preview
                </span>
              </div>

              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-[11px] font-medium text-zinc-400">
                <button
                  type="button"
                  onClick={() => setPreviewMode('pass')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    previewMode === 'pass' ? 'bg-[#00b87c] text-white font-bold' : 'hover:text-white'
                  }`}
                >
                  Pass with QR
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('raw')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    previewMode === 'raw' ? 'bg-[#00b87c] text-white font-bold' : 'hover:text-white'
                  }`}
                >
                  Raw Layout
                </button>
              </div>
            </div>

            <div className="w-full flex items-center justify-center py-2 overflow-x-auto">
              {previewMode === 'pass' ? (
                <div className="w-full max-w-[560px]">
                  <TicketPass 
                    order={{
                      event: formData,
                      ticketCode: formData.eventCode ? `${formData.eventCode.replace(/\s+/g, '')}-VIP-77` : 'E1-VIP-77',
                      tickets: [{ 
                        name: formData.ticketTiers?.[0]?.name || 'REGULAR PASS', 
                        price: formData.ticketTiers?.[0]?.price || 400,
                        quantity: 1 
                      }],
                      totalAmount: formData.ticketTiers?.[0]?.price || 400
                    }}
                    className="w-full shadow-2xl"
                  />
                </div>
              ) : (
                <div className="w-full max-w-[560px] aspect-[1650/600] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative bg-black flex items-center justify-center">
                  <img 
                    src={formData.ticketTemplateUrl || '/images/ticket-psd-template-clean.png'} 
                    alt="Ticket Layout" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-3">
              <span>Layout aspect ratio: <strong>1650 × 600 px</strong> (A4 4-per-page printable)</span>
              <span className="text-zinc-500">QR & codes will be dynamically placed</span>
            </div>
          </div>

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
