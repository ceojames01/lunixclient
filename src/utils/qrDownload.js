/**
 * Downloads a standalone high-resolution QR code image as PNG.
 * @param {string} qrValue The string encoded in the QR code
 * @param {string} ticketCode The ticket code (e.g., LUNIX-TKT-XXXX)
 * @param {string} [eventTitle] Optional event title for header/filename
 */
export const downloadStandaloneQRCode = (qrValue, ticketCode = 'TICKET', eventTitle = 'Lunix_Event') => {
  try {
    // Look for existing SVG in DOM or generate via offscreen canvas
    const svgElements = document.querySelectorAll('svg');
    let targetSvg = null;
    
    for (const svg of svgElements) {
      if (svg.id && svg.id.includes(ticketCode)) {
        targetSvg = svg;
        break;
      }
    }

    const canvas = document.createElement('canvas');
    const size = 1000; // 1000x1000 ultra crisp
    canvas.width = size;
    canvas.height = size + 200; // Extra room for brand and ticket code footer
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If we have an existing rendered SVG
    const svgNode = targetSvg || document.querySelector(`[data-qr="${qrValue}"]`) || document.querySelector('svg');
    
    const finishCanvasAndDownload = (img) => {
      // Header: LUNIX ENTERPRISES
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LUNIX ENTERPRISES', size / 2, 70);

      // Event Subtitle
      ctx.fillStyle = '#6B7280';
      ctx.font = '600 22px sans-serif';
      ctx.fillText((eventTitle || 'OFFICIAL EVENT PASS').toUpperCase(), size / 2, 110);

      // Draw QR Code in center
      const qrPadding = 140;
      const qrSize = size - 160;
      if (img) {
        ctx.drawImage(img, 80, qrPadding, qrSize, qrSize);
      }

      // Border around QR container
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, qrPadding - 20, size - 120, qrSize + 40);

      // Footer: Ticket Code Box
      ctx.fillStyle = '#111827';
      ctx.fillRect(80, size + 70, size - 160, 80);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px monospace';
      ctx.fillText(ticketCode, size / 2, size + 122);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_${ticketCode || 'Code'}.png`;
      link.href = dataUrl;
      link.click();
    };

    if (svgNode) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgNode);
      const img = new Image();
      img.onload = () => {
        finishCanvasAndDownload(img);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    } else {
      finishCanvasAndDownload(null);
    }
  } catch (err) {
    console.error('Failed to download QR code:', err);
  }
};
