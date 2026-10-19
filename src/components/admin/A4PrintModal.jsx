import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Printer, Download, FileText, ChevronLeft, ChevronRight, Scissors, Sparkles, CheckCircle2, AlertCircle, Calendar, ChevronDown, Ticket, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import TicketPass from '../ticket/TicketPass';
import { TICKET_TEMPLATE_DATA_URI } from '../../assets/ticketTemplate';

const TICKETS_PER_PAGE = 4;

// Direct synchronous non-tainting Image loader from embedded base64
const loadTemplateImage = async () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = TICKET_TEMPLATE_DATA_URI;
  });
};

const templateCache = new Map();
const getOrderTemplateImage = async (order, defaultBgImg) => {
  const url = order.event?.ticketTemplateUrl || order.event?.psdUrl;
  if (!url) return defaultBgImg;
  if (templateCache.has(url)) return templateCache.get(url);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      templateCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => resolve(defaultBgImg);
    img.src = url;
  });
};

const A4PrintModal = ({ orders = [], events = [], initialEventId = '', onClose }) => {
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [includeCutLines, setIncludeCutLines] = useState(true);
  const [exportScope, setExportScope] = useState('all'); // 'all' | 'current'
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const templateImgRef = useRef(null);

  // Preload template image safely from data-URL
  useEffect(() => {
    let isMounted = true;
    loadTemplateImage().then((img) => {
      if (isMounted && img) {
        templateImgRef.current = img;
        setTemplateLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Build complete list of unique available events from props and orders
  const availableEvents = useMemo(() => {
    const map = new Map();
    
    // 1. Add from events prop
    (events || []).forEach(ev => {
      if (ev && ev._id) {
        const idStr = ev._id.toString();
        map.set(idStr, {
          _id: idStr,
          title: ev.title || 'Untitled Event',
          eventCode: ev.eventCode || '',
          ticketTemplateUrl: ev.ticketTemplateUrl || '',
          psdUrl: ev.psdUrl || '',
          isCustomLayout: !!(ev.ticketTemplateUrl || ev.psdUrl)
        });
      }
    });

    // 2. Add from populated orders
    (orders || []).forEach(ord => {
      const ev = ord.event;
      if (ev && typeof ev === 'object' && ev._id) {
        const idStr = ev._id.toString();
        if (!map.has(idStr)) {
          map.set(idStr, {
            _id: idStr,
            title: ev.title || 'Untitled Event',
            eventCode: ev.eventCode || '',
            ticketTemplateUrl: ev.ticketTemplateUrl || '',
            psdUrl: ev.psdUrl || '',
            isCustomLayout: !!(ev.ticketTemplateUrl || ev.psdUrl)
          });
        }
      }
    });

    return Array.from(map.values());
  }, [events, orders]);

  // Compute ticket counts per event
  const eventTicketCounts = useMemo(() => {
    const counts = {};
    (orders || []).forEach(ord => {
      const evId = ord.event?._id?.toString() || (typeof ord.event === 'string' ? ord.event : null);
      if (evId) {
        counts[evId] = (counts[evId] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  // Filter orders by the selected event
  const activeOrders = useMemo(() => {
    if (selectedEventId === 'all') return orders;
    return orders.filter(ord => {
      const evId = ord.event?._id?.toString() || (typeof ord.event === 'string' ? ord.event : null);
      return evId === selectedEventId;
    });
  }, [orders, selectedEventId]);

  const selectedEventObj = availableEvents.find(e => e._id === selectedEventId);

  // Group tickets into chunks of 4 for A4 pages
  const totalTickets = activeOrders.length;
  const totalPages = Math.ceil(totalTickets / TICKETS_PER_PAGE) || 1;

  const pages = useMemo(() => {
    const p = [];
    for (let i = 0; i < totalTickets; i += TICKETS_PER_PAGE) {
      p.push(activeOrders.slice(i, i + TICKETS_PER_PAGE));
    }
    return p;
  }, [activeOrders, totalTickets]);

  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const currentTickets = pages[safeCurrentPage - 1] || [];

  // Direct native browser print dialog
  const handlePrint = () => {
    window.print();
  };

  // Render a single ticket on an offscreen canvas (1650 x 600 px)
  const renderTicketCanvas = async (order, bgImg) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1650;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // 1. Draw PSD Background Template (event custom layout or default)
    const activeBg = await getOrderTemplateImage(order, bgImg);
    if (activeBg && activeBg.complete && activeBg.naturalWidth !== 0) {
      try {
        ctx.drawImage(activeBg, 0, 0, 1650, 600);
      } catch (err) {
        console.warn('Could not draw bg template, using fallback black background:', err);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1650, 600);
      }
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1650, 600);
    }

    const ticketItem = order.tickets?.[0] || { name: 'REGULAR PASS', price: order.totalAmount || 400 };
    const ticketCode = order.ticketCode || (order.qrCodeData ? order.qrCodeData.split('-').slice(-2).join('-') : order._id?.slice(-8).toUpperCase() || 'LUNIX-TKT');
    const qrData = order.qrCodeData || `LUNIX-TKT-${ticketCode}`;
    const rawTier = ticketItem.name ? ticketItem.name.toUpperCase() : 'REGULAR PASS';
    const passType = rawTier.includes('PASS') || rawTier.includes('TICKET') ? rawTier : `${rawTier} PASS`;
    const price = ticketItem.price || order.totalAmount || 400;

    // 2. Draw Dynamic QR Code inside White Stub Box (x: 1341, y: 66, w: 286, h: 282)
    try {
      let qrDataUrl = null;
      const fn = (QRCode && typeof QRCode.toDataURL === 'function') 
        ? QRCode.toDataURL 
        : (QRCode && QRCode.default && typeof QRCode.default.toDataURL === 'function')
          ? QRCode.default.toDataURL
          : null;

      if (fn) {
        qrDataUrl = await fn(qrData, {
          margin: 0,
          width: 270,
          color: { dark: '#000000', light: '#ffffff' }
        });
      }

      if (qrDataUrl) {
        const qrImg = await new Promise((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = () => res(null);
          i.src = qrDataUrl;
        });

        if (qrImg) {
          // Fill clean white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(1341, 66, 286, 282);
          // Draw QR image centered
          ctx.drawImage(qrImg, 1349, 72, 270, 270);
        }
      }
    } catch (e) {
      console.warn('QR Code render fallback:', e);
    }

    // 3. Draw Dynamic Pass Tier at top of stub (x: 1345 to 1630, y: 15 to 55)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Michroma", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(passType, 1484, 34);

    // 4. Draw Vertical Gold Price on Stub (x: 1490, y: 470)
    ctx.save();
    ctx.translate(1490, 475);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#f3cb4d';
    ctx.font = '900 36px "Orbitron", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${price}/=`, 0, 0);
    ctx.restore();

    // 5. Draw Vertical Ticket Code on Stub Pill (x: 1581, y: 475)
    ctx.save();
    ctx.translate(1581, 475);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 15px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ticketCode, 0, 0);
    ctx.restore();

    // 6. Draw Price Pill on Main Card (x: 95, y: 544)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Orbitron", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${price}/=`, 95, 544);

    // 7. Draw Ticket Code on Main Card (x: 1092, y: 547)
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ticketCode, 1092, 547);

    return canvas;
  };

  const MAX_PAGES_PER_PDF = 25; // Safe maximum pages per PDF (100 tickets) to prevent browser memory & string limits

  // Render a full A4 sheet canvas (1240 x 1754 px at crisp 150 DPI)
  const renderA4PageCanvas = async (pageTickets, pIdx, totalPgs, bgImg, withCutLines) => {
    const a4Width = 1240;
    const a4Height = 1754;
    const a4Canvas = document.createElement('canvas');
    a4Canvas.width = a4Width;
    a4Canvas.height = a4Height;
    const a4Ctx = a4Canvas.getContext('2d');

    // Fill clean white background
    a4Ctx.fillStyle = '#ffffff';
    a4Ctx.fillRect(0, 0, a4Width, a4Height);

    // Header info
    a4Ctx.fillStyle = '#666666';
    a4Ctx.font = 'bold 15px monospace, sans-serif';
    a4Ctx.textAlign = 'left';
    a4Ctx.fillText(`LUNIX ENTERPRISES • ${selectedEventObj?.title ? selectedEventObj.title.toUpperCase() : 'A4 PRINT BATCH'}`, 35, 30);
    a4Ctx.textAlign = 'right';
    a4Ctx.fillText(`PAGE ${pIdx + 1} OF ${totalPgs}`, a4Width - 35, 30);

    // Line under header
    a4Ctx.strokeStyle = '#dddddd';
    a4Ctx.lineWidth = 1;
    a4Ctx.beginPath();
    a4Ctx.moveTo(35, 42);
    a4Ctx.lineTo(a4Width - 35, 42);
    a4Ctx.stroke();

    // 4 Tickets stacked vertically
    const marginX = 35;
    const startY = 52;
    const ticketW = 1170; // 1240 - 70
    const ticketH = 390;  // 1170 / 3 = 390 (3:1 ratio)
    const spacingY = 22;

    for (let tIdx = 0; tIdx < pageTickets.length; tIdx++) {
      const tOrder = pageTickets[tIdx];
      const ticketCanvas = await renderTicketCanvas(tOrder, bgImg);

      const curY = startY + tIdx * (ticketH + spacingY);

      // Draw ticket card
      a4Ctx.drawImage(ticketCanvas, marginX, curY, ticketW, ticketH);

      // Free individual ticket canvas memory immediately
      ticketCanvas.width = 0;
      ticketCanvas.height = 0;

      // Draw border around ticket
      a4Ctx.strokeStyle = '#222222';
      a4Ctx.lineWidth = 1.5;
      a4Ctx.strokeRect(marginX, curY, ticketW, ticketH);

      // Cutting guides between tickets
      if (withCutLines && tIdx < pageTickets.length - 1) {
        const cutY = curY + ticketH + (spacingY / 2);
        a4Ctx.save();
        a4Ctx.setLineDash([8, 8]);
        a4Ctx.strokeStyle = '#888888';
        a4Ctx.lineWidth = 1.5;
        a4Ctx.beginPath();
        a4Ctx.moveTo(marginX, cutY);
        a4Ctx.lineTo(a4Width - marginX, cutY);
        a4Ctx.stroke();

        a4Ctx.fillStyle = '#888888';
        a4Ctx.font = 'bold 11px monospace, sans-serif';
        a4Ctx.textAlign = 'left';
        a4Ctx.fillText('✂ CUT HERE', marginX + 10, cutY - 4);
        a4Ctx.textAlign = 'right';
        a4Ctx.fillText('✂ CUT HERE', a4Width - marginX - 10, cutY - 4);
        a4Ctx.restore();
      }
    }

    // Footer info
    a4Ctx.fillStyle = '#888888';
    a4Ctx.font = '13px monospace, sans-serif';
    a4Ctx.textAlign = 'center';
    a4Ctx.fillText(`Printed via Lunix Enterprise Portal • Standard A4 4-Up Layout`, a4Width / 2, a4Height - 16);

    return a4Canvas;
  };

  const savePdfBlob = (doc, fileName) => {
    let blobUrl = null;
    try {
      const arrayBuffer = doc.output('arraybuffer');
      const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
      blobUrl = URL.createObjectURL(pdfBlob);
    } catch (err1) {
      try {
        blobUrl = doc.output('bloburl');
      } catch (err2) {
        const raw = doc.output('blob');
        const pdfBlob = raw instanceof Blob ? raw : new Blob([raw], { type: 'application/pdf' });
        blobUrl = URL.createObjectURL(pdfBlob);
      }
    }

    if (blobUrl) {
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      }, 10000);
    }
  };

  // Safe Multi-Page A4 PDF Generation with Automatic Batching
  const handleDownloadPdf = async () => {
    if (activeOrders.length === 0) {
      toast.error('No tickets available to export');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setPdfProgress(0);

      // Ensure template image is ready
      let bgImg = templateImgRef.current;
      if (!bgImg || !bgImg.complete || bgImg.naturalWidth === 0) {
        bgImg = await loadTemplateImage();
      }

      let targetPages = [];
      if (exportScope === 'current') {
        targetPages = [pages[safeCurrentPage - 1]].filter(Boolean);
      } else if (exportScope.startsWith('batch_')) {
        const bIdx = parseInt(exportScope.split('_')[1], 10);
        targetPages = pages.slice(bIdx * MAX_PAGES_PER_PDF, (bIdx + 1) * MAX_PAGES_PER_PDF);
      } else {
        targetPages = pages;
      }

      const totalTargetPages = targetPages.length;
      if (totalTargetPages === 0) {
        toast.error('No pages selected to export');
        return;
      }

      const eventTitleSanitized = selectedEventObj?.title 
        ? selectedEventObj.title.replace(/[^a-zA-Z0-9_-]/g, '_') 
        : 'All_Events';
      const eventCodeSanitized = selectedEventObj?.eventCode ? `_${selectedEventObj.eventCode}` : '';

      // Partition target pages into safe chunks of MAX_PAGES_PER_PDF (100 tickets per file max)
      const batches = [];
      for (let i = 0; i < totalTargetPages; i += MAX_PAGES_PER_PDF) {
        batches.push({
          pages: targetPages.slice(i, i + MAX_PAGES_PER_PDF),
          startPageIdx: i,
          batchNum: Math.floor(i / MAX_PAGES_PER_PDF) + 1
        });
      }

      const totalBatches = batches.length;

      for (let b = 0; b < totalBatches; b++) {
        const curBatch = batches[b];
        const batchPages = curBatch.pages;
        const startPgNum = curBatch.startPageIdx + 1;
        const endPgNum = curBatch.startPageIdx + batchPages.length;

        if (totalBatches > 1) {
          toast.loading(`Compiling Part ${b + 1} of ${totalBatches} (Pages ${startPgNum}–${endPgNum})...`, { id: 'pdf-toast' });
        } else {
          toast.loading(`Compiling A4 PDF (${totalTargetPages} pages)...`, { id: 'pdf-toast' });
        }

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        for (let pIdx = 0; pIdx < batchPages.length; pIdx++) {
          const pageTickets = batchPages[pIdx];
          if (!pageTickets || pageTickets.length === 0) continue;

          // Track overall progress across all batches
          const overallDone = curBatch.startPageIdx + pIdx + 1;
          setPdfProgress(Math.round((overallDone / totalTargetPages) * 100));

          if (pIdx > 0) {
            doc.addPage('a4', 'portrait');
          }

          const a4Canvas = await renderA4PageCanvas(
            pageTickets, 
            curBatch.startPageIdx + pIdx, 
            totalTargetPages, 
            bgImg, 
            includeCutLines
          );

          // Convert canvas to optimized JPEG (0.82 quality) to avoid huge string memory limits
          const pageJpeg = a4Canvas.toDataURL('image/jpeg', 0.82);
          doc.addImage(pageJpeg, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

          // Immediately clear canvas to free GPU/RAM memory
          a4Canvas.width = 0;
          a4Canvas.height = 0;
        }

        let fileName = '';
        if (exportScope === 'current') {
          fileName = `Lunix_Tickets_${eventTitleSanitized}${eventCodeSanitized}_A4_Page_${safeCurrentPage}.pdf`;
        } else if (totalBatches > 1) {
          fileName = `Lunix_Tickets_${eventTitleSanitized}${eventCodeSanitized}_Part_${b + 1}_of_${totalBatches}_Pgs_${startPgNum}-${endPgNum}.pdf`;
        } else {
          fileName = `Lunix_Tickets_${eventTitleSanitized}${eventCodeSanitized}_A4_${batchPages.length * 4}tkts_${batchPages.length}pgs.pdf`;
        }

        savePdfBlob(doc, fileName);

        // Pause briefly between downloading multiple files to allow browser file stream to flush
        if (b < totalBatches - 1) {
          await new Promise(r => setTimeout(r, 700));
        }
      }

      if (totalBatches > 1) {
        toast.success(`🎉 Downloaded all ${totalBatches} PDF parts (${totalTargetPages} pages total)!`, { id: 'pdf-toast', duration: 5000 });
      } else {
        toast.success(`🎉 PDF downloaded successfully (${totalTargetPages} pages)!`, { id: 'pdf-toast', duration: 4000 });
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error(`PDF notice: ${err?.message || 'Export error'}. You can also use the browser "Print A4 Sheet" button!`, { id: 'pdf-toast', duration: 7000 });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(0);
    }
  };

  return (
    <>
      {/* ================= MODAL OVERLAY (Screen View) ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto no-print">
        <div className="bg-[#0f172a] w-full max-w-5xl rounded-2xl border border-zinc-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-[#1e293b]/50 shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 text-[#00b87c] border border-[#00b87c]/30 rounded-xl">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  A4 Ticket Sheet Print & PDF Export (4 per Page)
                </h3>
                <p className="text-xs text-zinc-400">
                  Total: <strong className="text-white">{totalTickets} tickets</strong> divided into <strong className="text-[#00b87c]">{totalPages} A4 Pages</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isGeneratingPdf}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Selector Toolbar */}
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-[#00b87c]" />
                <span>Select Event:</span>
              </div>

              <div className="relative min-w-[240px]">
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setCurrentPage(1);
                    setExportScope('all');
                  }}
                  className="w-full bg-[#1e293b] text-white text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-zinc-700 focus:border-[#00b87c] outline-none cursor-pointer appearance-none transition-colors"
                >
                  <option value="all">
                    All Events ({orders.length} tickets)
                  </option>
                  {availableEvents.map(ev => {
                    const count = eventTicketCounts[ev._id] || 0;
                    return (
                      <option key={ev._id} value={ev._id}>
                        {ev.eventCode ? `[${ev.eventCode}] ` : ''}{ev.title} ({count} tickets){ev.isCustomLayout ? ' • 🎨 Custom PSD' : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5 pointer-events-none" />
              </div>

              {/* Event Layout Badge */}
              {selectedEventObj ? (
                <div className="flex items-center gap-2">
                  {selectedEventObj.isCustomLayout ? (
                    <span className="bg-emerald-500/10 text-[#00b87c] border border-[#00b87c]/30 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <Sparkles size={12} className="text-amber-400" />
                      Custom PSD Layout Active
                    </span>
                  ) : (
                    <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[11px] font-medium px-2.5 py-1 rounded-lg">
                      Default Clean Template
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">
                    <strong className="text-white font-bold">{totalTickets}</strong> tickets found
                  </span>
                </div>
              ) : (
                <span className="text-xs text-zinc-400">
                  Showing all <strong className="text-white font-bold">{totalTickets}</strong> tickets across events
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700">
              {totalPages} A4 Sheet{totalPages === 1 ? '' : 's'} (4 tickets/sheet)
            </div>
          </div>

          {/* Action & Configuration Controls */}
          <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
            
            {/* Cut Lines & Export Scope */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCutLines}
                  onChange={(e) => setIncludeCutLines(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00b87c] bg-zinc-800 border-zinc-700 focus:ring-0"
                />
                <Scissors className="w-3.5 h-3.5 text-zinc-400" />
                Cutting Guides
              </label>

              <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-lg border border-zinc-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    exportScope === 'all' ? 'bg-[#00b87c] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({totalPages} pgs{totalPages > 25 ? ` • ${Math.ceil(totalPages / 25)} Parts` : ''})
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('current')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    exportScope === 'current' ? 'bg-[#00b87c] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Current Pg ({safeCurrentPage})
                </button>
              </div>

              {totalPages > 25 && (
                <div className="relative">
                  <select
                    value={exportScope.startsWith('batch_') ? exportScope : ''}
                    onChange={(e) => {
                      if (e.target.value) setExportScope(e.target.value);
                    }}
                    className={`bg-zinc-800 text-xs font-semibold pl-2.5 pr-7 py-1 rounded-lg border focus:border-[#00b87c] outline-none cursor-pointer appearance-none transition-colors ${
                      exportScope.startsWith('batch_') ? 'text-[#00b87c] border-[#00b87c]' : 'text-zinc-300 border-zinc-700'
                    }`}
                  >
                    <option value="" disabled>Select Batch (100 tkts/batch)...</option>
                    {Array.from({ length: Math.ceil(totalPages / 25) }).map((_, bIdx) => {
                      const startP = bIdx * 25 + 1;
                      const endP = Math.min((bIdx + 1) * 25, totalPages);
                      const tStart = (startP - 1) * 4 + 1;
                      const tEnd = Math.min(endP * 4, totalTickets);
                      return (
                        <option key={`batch_${bIdx}`} value={`batch_${bIdx}`}>
                          Batch {bIdx + 1}: Pgs {startP}–{endP} (Tickets {tStart}–{tEnd})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 w-3 h-3 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isGeneratingPdf || totalPages <= 1}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-300 px-2">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isGeneratingPdf || totalPages <= 1}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Print & Download Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isGeneratingPdf || totalTickets === 0}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-zinc-700 transition-all shadow disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-[#00b87c]" />
                Print (Browser)
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || totalTickets === 0}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf 
                  ? `Generating PDF (${pdfProgress}%)...` 
                  : exportScope === 'current' 
                    ? `Download Page ${safeCurrentPage} PDF` 
                    : exportScope.startsWith('batch_')
                      ? `Download Batch ${parseInt(exportScope.split('_')[1], 10) + 1} PDF (25 pgs)`
                      : totalPages > 25
                        ? `Download All (${totalPages} pgs in ${Math.ceil(totalPages / 25)} Parts)`
                        : `Download All A4 PDF (${totalPages} pgs)`}
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview: Shows Current A4 Page */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-950/70 flex justify-center items-start">
            {totalTickets === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
                  <Ticket size={28} />
                </div>
                <h4 className="text-white font-bold text-base mb-1">No Tickets Found for this Event</h4>
                <p className="text-xs text-zinc-400 max-w-sm mb-4">
                  There are currently no orders or generated tickets allocated to "{selectedEventObj?.title || 'this event'}".
                </p>
                <button
                  onClick={() => setSelectedEventId('all')}
                  className="px-4 py-2 bg-[#1e293b] hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all border border-zinc-700"
                >
                  Show All Events
                </button>
              </div>
            ) : (
            <div className="bg-white text-black w-full max-w-[620px] aspect-[210/297] rounded-lg shadow-2xl p-4 sm:p-5 flex flex-col justify-between border border-zinc-400">
              <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest flex justify-between border-b border-zinc-200 pb-1 mb-2">
                <span>Lunix Enterprises • {selectedEventObj?.title || 'A4 Print Batch'}</span>
                <span>Page {safeCurrentPage} of {totalPages}</span>
              </div>

              {/* 4 Tickets Stack */}
              <div className="flex-1 flex flex-col justify-between gap-2.5">
                {currentTickets.map((order, idx) => (
                  <div key={order._id || idx} className="relative flex-1 flex flex-col justify-center">
                    <TicketPass order={order} className="w-full shadow-md" />
                    {includeCutLines && idx < currentTickets.length - 1 && (
                      <div className="w-full flex items-center justify-between my-1 border-t border-dashed border-zinc-400">
                        <span className="text-[8px] text-zinc-400 font-mono -mt-2 bg-white px-1">✂ CUT HERE</span>
                        <span className="text-[8px] text-zinc-400 font-mono -mt-2 bg-white px-1">✂ CUT HERE</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Placeholders if less than 4 on final page */}
                {Array.from({ length: Math.max(0, TICKETS_PER_PAGE - currentTickets.length) }).map((_, pIdx) => (
                  <div key={`empty-${pIdx}`} className="flex-1 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 text-xs font-mono">
                    Empty Slot
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-zinc-400 text-center pt-2 border-t border-zinc-200 mt-2 font-mono">
                Printed via Lunix Enterprise Portal • Standard A4 4-Up Layout
              </div>
            </div>
            )}
          </div>

        </div>
      </div>

      {/* ================= COMPLETE PRINT DOM (For Browser Ctrl+P / Window.print()) ================= */}
      <div id="a4-print-container" className="hidden print:block fixed inset-0 bg-white z-[999999]">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 5mm;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .a4-page-sheet {
              width: 200mm !important;
              height: 287mm !important;
              page-break-after: always !important;
              break-after: page !important;
              margin: 0 auto !important;
              padding: 2mm !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              background: white !important;
            }
            .a4-page-sheet:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
          }
        `}} />

        {pages.map((pageOrders, pIdx) => (
          <div 
            key={`print-sheet-${pIdx}`} 
            className="a4-page-sheet"
          >
            {pageOrders.map((order, tIdx) => (
              <div 
                key={order._id || tIdx} 
                style={{ 
                  flex: '1', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  padding: '2mm 0',
                  position: 'relative'
                }}
              >
                <TicketPass order={order} className="w-full" />
                {includeCutLines && tIdx < pageOrders.length - 1 && (
                  <div style={{
                    width: '100%',
                    borderTop: '1px dashed #888888',
                    marginTop: '2mm',
                    marginBottom: '1mm',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '8px', color: '#888', fontFamily: 'monospace' }}>✂ CUT HERE</span>
                    <span style={{ fontSize: '8px', color: '#888', fontFamily: 'monospace' }}>✂ CUT HERE</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default A4PrintModal;
