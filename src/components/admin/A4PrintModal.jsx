import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Download, FileText, ChevronLeft, ChevronRight, Scissors, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import TicketPass from '../ticket/TicketPass';

const TICKETS_PER_PAGE = 4;
const TEMPLATE_IMAGE_SRC = '/images/ticket-psd-template-clean.png';

const A4PrintModal = ({ orders = [], onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [includeCutLines, setIncludeCutLines] = useState(true);
  const [exportScope, setExportScope] = useState('all'); // 'all' | 'current'
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const templateImgRef = useRef(null);

  // Preload template image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = TEMPLATE_IMAGE_SRC;
    img.onload = () => {
      templateImgRef.current = img;
      setTemplateLoaded(true);
    };
    img.onerror = () => {
      console.warn('Could not preload template image');
    };
  }, []);

  // Group tickets into chunks of 4 for A4 pages
  const totalTickets = orders.length;
  const totalPages = Math.ceil(totalTickets / TICKETS_PER_PAGE) || 1;

  const pages = [];
  for (let i = 0; i < totalTickets; i += TICKETS_PER_PAGE) {
    pages.push(orders.slice(i, i + TICKETS_PER_PAGE));
  }

  const currentTickets = pages[currentPage - 1] || [];

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

    // 1. Draw PSD Background Template
    if (bgImg && bgImg.complete) {
      ctx.drawImage(bgImg, 0, 0, 1650, 600);
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
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        margin: 0,
        width: 270,
        color: { dark: '#000000', light: '#ffffff' }
      });
      const qrImg = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = qrDataUrl;
      });
      // Fill clean white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1341, 66, 286, 282);
      // Draw QR image centered
      ctx.drawImage(qrImg, 1349, 72, 270, 270);
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

    // 6. Draw Price Pill on Main Card (x: 100, y: 548)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Orbitron", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${price}/=`, 100, 548);

    // 7. Draw Ticket Code on Main Card (x: 1095, y: 548)
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ticketCode, 1095, 548);

    return canvas;
  };

  // High-Quality Multi-Page A4 PDF Generation (Canvas Direct-to-PDF Method)
  const handleDownloadPdf = async () => {
    if (orders.length === 0) {
      toast.error('No tickets available to export');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setPdfProgress(0);

      // Ensure template image is ready
      let bgImg = templateImgRef.current;
      if (!bgImg || !bgImg.complete) {
        bgImg = await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = TEMPLATE_IMAGE_SRC;
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
        });
      }

      const targetPages = exportScope === 'current' 
        ? [pages[currentPage - 1]] 
        : pages;

      const totalTargetPages = targetPages.length;
      toast.loading(`Compiling A4 PDF (${totalTargetPages} pages)...`, { id: 'pdf-toast' });

      // Create PDF in A4 Portrait mode (210 x 297 mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // A4 Canvas Dimensions (1650 width x 2333 height at 200 DPI equivalent)
      const a4Width = 1650;
      const a4Height = 2333;

      for (let pIdx = 0; pIdx < totalTargetPages; pIdx++) {
        const pageTickets = targetPages[pIdx];
        if (!pageTickets || pageTickets.length === 0) continue;

        setPdfProgress(Math.round(((pIdx + 1) / totalTargetPages) * 100));

        // Create A4 Page Canvas
        const a4Canvas = document.createElement('canvas');
        a4Canvas.width = a4Width;
        a4Canvas.height = a4Height;
        const a4Ctx = a4Canvas.getContext('2d');

        // Fill White A4 Background
        a4Ctx.fillStyle = '#ffffff';
        a4Ctx.fillRect(0, 0, a4Width, a4Height);

        // Header info
        a4Ctx.fillStyle = '#666666';
        a4Ctx.font = 'bold 16px monospace, sans-serif';
        a4Ctx.textAlign = 'left';
        a4Ctx.fillText(`LUNIX ENTERPRISES • A4 PRINT BATCH`, 40, 35);
        a4Ctx.textAlign = 'right';
        a4Ctx.fillText(`PAGE ${pIdx + 1} OF ${totalTargetPages}`, a4Width - 40, 35);

        // Draw line under header
        a4Ctx.strokeStyle = '#cccccc';
        a4Ctx.lineWidth = 1;
        a4Ctx.beginPath();
        a4Ctx.moveTo(40, 48);
        a4Ctx.lineTo(a4Width - 40, 48);
        a4Ctx.stroke();

        // 4 Tickets stacked vertically
        const marginX = 40;
        const startY = 60;
        const ticketW = a4Width - marginX * 2; // 1570
        const ticketH = 530; // 1570 / (1650/600) = ~570 px
        const spacingY = 32;

        for (let tIdx = 0; tIdx < pageTickets.length; tIdx++) {
          const tOrder = pageTickets[tIdx];
          const ticketCanvas = await renderTicketCanvas(tOrder, bgImg);

          const curY = startY + tIdx * (ticketH + spacingY);

          // Draw ticket card with rounded corners
          a4Ctx.drawImage(ticketCanvas, marginX, curY, ticketW, ticketH);

          // Draw border around ticket
          a4Ctx.strokeStyle = '#222222';
          a4Ctx.lineWidth = 1.5;
          a4Ctx.strokeRect(marginX, curY, ticketW, ticketH);

          // Cutting guides between tickets
          if (includeCutLines && tIdx < pageTickets.length - 1) {
            const cutY = curY + ticketH + (spacingY / 2);
            a4Ctx.save();
            a4Ctx.setLineDash([8, 8]);
            a4Ctx.strokeStyle = '#777777';
            a4Ctx.lineWidth = 1.5;
            a4Ctx.beginPath();
            a4Ctx.moveTo(marginX, cutY);
            a4Ctx.lineTo(a4Width - marginX, cutY);
            a4Ctx.stroke();

            a4Ctx.fillStyle = '#777777';
            a4Ctx.font = 'bold 12px monospace, sans-serif';
            a4Ctx.textAlign = 'left';
            a4Ctx.fillText('✂ CUT HERE', marginX + 10, cutY - 4);
            a4Ctx.textAlign = 'right';
            a4Ctx.fillText('✂ CUT HERE', a4Width - marginX - 10, cutY - 4);
            a4Ctx.restore();
          }
        }

        // Footer info
        a4Ctx.fillStyle = '#888888';
        a4Ctx.font = '14px monospace, sans-serif';
        a4Ctx.textAlign = 'center';
        a4Ctx.fillText(`Printed via Lunix Enterprise Portal • Standard A4 4-Up Layout`, a4Width / 2, a4Height - 20);

        if (pIdx > 0) {
          doc.addPage('a4', 'portrait');
        }

        // Add A4 canvas image directly into PDF (210 x 297 mm)
        const a4DataUrl = a4Canvas.toDataURL('image/jpeg', 0.95);
        doc.addImage(a4DataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const fileName = exportScope === 'current'
        ? `Lunix_Tickets_A4_Page_${currentPage}.pdf`
        : `Lunix_Tickets_A4_${totalTickets}pcs_${totalTargetPages}pages.pdf`;

      doc.save(fileName);
      toast.success(`🎉 PDF downloaded successfully (${totalTargetPages} pages)!`, { id: 'pdf-toast', duration: 4000 });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to export PDF. Please check console or use browser Print button.', { id: 'pdf-toast', duration: 5000 });
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
              onClick={onClose}
              disabled={isGeneratingPdf}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action & Configuration Controls */}
          <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
            
            {/* Cut Lines & Export Scope */}
            <div className="flex flex-wrap items-center gap-4">
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
                  onClick={() => setExportScope('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${exportScope === 'all' ? 'bg-[#00b87c] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  All ({totalPages} pgs)
                </button>
                <button
                  onClick={() => setExportScope('current')}
                  className={`px-2.5 py-1 rounded-md transition-all ${exportScope === 'current' ? 'bg-[#00b87c] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Current Pg Only
                </button>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isGeneratingPdf}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isGeneratingPdf}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Print & Download Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-zinc-700 transition-all shadow disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-[#00b87c]" />
                Print (Browser)
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf 
                  ? `Generating PDF (${pdfProgress}%)...` 
                  : exportScope === 'current' 
                    ? `Download Page ${currentPage} PDF` 
                    : `Download All A4 PDF (${totalPages} pgs)`}
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview: Shows Current A4 Page */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-950/70 flex justify-center items-start">
            <div className="bg-white text-black w-full max-w-[620px] aspect-[210/297] rounded-lg shadow-2xl p-4 sm:p-5 flex flex-col justify-between border border-zinc-400">
              <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest flex justify-between border-b border-zinc-200 pb-1 mb-2">
                <span>Lunix Enterprises • A4 Print Batch</span>
                <span>Page {currentPage} of {totalPages}</span>
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
