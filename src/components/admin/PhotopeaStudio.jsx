import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  FileCode, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEFAULT_PSD_PATH = '/Event Ticket Design onet-Recovered.psd';

const PhotopeaStudio = ({ token }) => {
  const iframeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'automation' | 'help'
  const [exportedImage, setExportedImage] = useState(null);

  // Dynamic customization state for automated ExtendScript injection
  const [customTier, setCustomTier] = useState('VIP PASS');
  const [customPrice, setCustomPrice] = useState('1000/=');
  const [customCode, setCustomCode] = useState('LUNIX-VIP-8899');
  const [customDate, setCustomDate] = useState('FRIDAY 25TH SEPTEMBER 2026');
  const [customArtist, setCustomArtist] = useState('ALL NIGHT PARTY WITH WAKADINALI');

  // Listen for exported files from Photopea via window.postMessage
  useEffect(() => {
    const handleMessage = (event) => {
      // Photopea sends ArrayBuffer when app.activeDocument.saveToOE("png") is invoked
      if (event.data instanceof ArrayBuffer) {
        const blob = new Blob([event.data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setExportedImage(url);
        toast.success('🎉 High-resolution ticket exported from Photopea!', { duration: 4000 });
      } else if (typeof event.data === 'string') {
        if (event.data === 'done') {
          // Command completed
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Construct Photopea Embed URL with the default PSD loaded
  const getPhotopeaSrc = () => {
    const origin = window.location.origin;
    const fileUrl = `${origin}${DEFAULT_PSD_PATH}`;
    
    // Environment config for Photopea API
    const config = {
      files: [fileUrl],
      environment: {
        theme: 2, // Dark Theme
        vmode: 0,
        customIO: {
          save: "app.activeDocument.saveToOE('png');"
        }
      }
    };

    return `https://www.photopea.com#${encodeURIComponent(JSON.stringify(config))}`;
  };

  // Send ExtendScript to Photopea to automate layer modifications
  const runAutomationScript = (scriptCode) => {
    if (!iframeRef.current) return;
    
    const message = scriptCode || `
      var doc = app.activeDocument;
      if (doc) {
        // Try updating known text layers
        for (var i = 0; i < doc.artLayers.length; i++) {
          var layer = doc.artLayers[i];
          if (layer.kind == LayerKind.TEXT) {
            var name = layer.name.toUpperCase();
            if (name.indexOf("PASS") !== -1 || name.indexOf("REGULAR") !== -1) {
              layer.textItem.contents = "${customTier}";
            } else if (name.indexOf("400") !== -1 || name.indexOf("PRICE") !== -1) {
              layer.textItem.contents = "${customPrice}";
            } else if (name.indexOf("2B30") !== -1 || name.indexOf("TICKET CODE") !== -1 || name.indexOf("CODE") !== -1) {
              layer.textItem.contents = "${customCode}";
            }
          }
        }
        alert("Template updated with: ${customTier} | ${customPrice} | ${customCode}");
      } else {
        alert("No active document loaded in Photopea!");
      }
    `;

    iframeRef.current.contentWindow.postMessage(message, '*');
    toast.success('Script sent to Photopea!');
  };

  // Export current document as PNG
  const requestExport = () => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow.postMessage('app.activeDocument.saveToOE("png");', '*');
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-xl text-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Photopea Ticket Template Studio
            </h2>
          </div>
          <p className="text-zinc-400 text-sm">
            Edit your live PSD template (<code className="text-amber-400">Event Ticket Design onet-Recovered.psd</code>) or automate layer batch generation directly inside your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-sm font-semibold border border-zinc-700 transition-all shadow"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>

          <button
            onClick={requestExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Export High-Res PNG
          </button>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'editor'
              ? 'bg-[#3b82f6] text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Live PSD Editor
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'automation'
              ? 'bg-[#3b82f6] text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Automated Layer Injector
        </button>
      </div>

      {/* TAB 1: LIVE PHOTOPEA IFRAME */}
      {activeTab === 'editor' && (
        <div className={`relative bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[750px] w-full'
        }`}>
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 p-2.5 bg-zinc-900/90 text-white hover:bg-zinc-800 rounded-xl border border-zinc-700 shadow-xl flex items-center gap-2 text-sm font-bold"
            >
              <Minimize2 className="w-4 h-4" /> Exit Fullscreen
            </button>
          )}

          <iframe
            ref={iframeRef}
            id="photopea-iframe"
            title="Photopea Ticket Editor"
            src={getPhotopeaSrc()}
            className="w-full h-full border-0"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      )}

      {/* TAB 2: AUTOMATION & LAYER TESTER */}
      {activeTab === 'automation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls Box */}
          <div className="bg-[#0f172a] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-zinc-800 pb-3">
              <Sliders className="w-5 h-5 text-[#3b82f6]" />
              Inject Dynamic Values into PSD
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Pass Tier Name
                </label>
                <input
                  type="text"
                  value={customTier}
                  onChange={(e) => setCustomTier(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Price Label
                </label>
                <input
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Ticket Code
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setActiveTab('editor');
                  setTimeout(() => runAutomationScript(), 300);
                }}
                className="flex-1 py-3 px-4 bg-[#3b82f6] hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Apply & Switch to Photopea
              </button>

              <button
                onClick={requestExport}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Exported Result / Preview Card */}
          <div className="bg-[#0f172a] border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="text-white font-bold text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Exported Render
              </span>
              {exportedImage && (
                <a
                  href={exportedImage}
                  download={`ticket-${customCode}.png`}
                  className="text-xs text-emerald-400 hover:underline font-bold"
                >
                  Download File
                </a>
              )}
            </div>

            {exportedImage ? (
              <div className="w-full flex flex-col items-center gap-4">
                <img
                  src={exportedImage}
                  alt="Exported Ticket"
                  className="w-full rounded-xl border border-zinc-700 shadow-2xl object-contain"
                />
                <a
                  href={exportedImage}
                  download={`ticket-${customCode}.png`}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Exported PNG
                </a>
              </div>
            ) : (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-zinc-500">
                <QrCode className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-semibold text-zinc-400 mb-1">No exported render yet</p>
                <p className="text-xs max-w-xs text-zinc-500">
                  Click "Export High-Res PNG" from the Photopea Studio or apply script to capture the modified ticket.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotopeaStudio;
