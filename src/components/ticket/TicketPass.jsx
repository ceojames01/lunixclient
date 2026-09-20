import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TicketPass = ({ order, ticketIndex = 0, id, className = '' }) => {
  if (!order) return null;

  // Extract order and event metadata
  const event = order.event || {};
  const ticketItem = order.tickets && order.tickets[ticketIndex] 
    ? order.tickets[ticketIndex] 
    : (order.tickets?.[0] || { name: 'REGULAR PASS', price: order.totalAmount || 400, quantity: 1 });
  
  const ticketCode = order.ticketCode || (order.qrCodeData ? order.qrCodeData.split('-').slice(-2).join('-') : order._id?.slice(-8).toUpperCase() || 'LUNIX-TKT');
  const qrData = order.qrCodeData || `LUNIX-TKT-${ticketCode}`;
  
  const rawTier = ticketItem.name ? ticketItem.name.toUpperCase() : 'REGULAR PASS';
  const passType = rawTier.includes('PASS') || rawTier.includes('TICKET') ? rawTier : `${rawTier} PASS`;
  const price = ticketItem.price || order.totalAmount || 400;

  return (
    <div 
      id={id}
      className={`relative w-full max-w-[950px] aspect-[1650/600] select-none overflow-hidden rounded-xl shadow-2xl border border-zinc-800 bg-black text-white font-['Titillium_Web'] ${className}`}
      style={{
        backgroundImage: "url('/images/ticket-psd-template-clean.png')",
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 1. DYNAMIC QR CODE IN WHITE STUB BOX (Top: 10.83%, Left: 81.15%, Width: 17.5%, Height: 47.5%) */}
      <div 
        className="absolute flex items-center justify-center p-1 sm:p-2 bg-white"
        style={{
          top: '11%',
          left: '81.3%',
          width: '17.3%',
          height: '47%',
          boxSizing: 'border-box'
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <QRCodeSVG 
            id={`qr-svg-${ticketCode}`}
            data-qr={qrData}
            value={qrData}
            size={256}
            style={{ width: '92%', height: '92%', objectFit: 'contain' }}
            bgColor="#ffffff"
            fgColor="#000000"
            level="Q"
            includeMargin={false}
          />
        </div>
      </div>

      {/* 2. DYNAMIC PASS TIER AT TOP OF STUB (Top: 2.5%, Left: 81.3%, Width: 17.3%) */}
      <div 
        className="absolute flex items-center justify-center text-center font-['Michroma'] font-black uppercase text-white tracking-[0.15em] overflow-hidden"
        style={{
          top: '2.5%',
          left: '81.3%',
          width: '17.3%',
          height: '6%',
          fontSize: 'clamp(8px, 1.25vw, 14px)'
        }}
      >
        <span className="truncate">{passType}</span>
      </div>

      {/* 3. DYNAMIC VERTICAL PRICE ON STUB (Top: 63%, Left: 87.5%, Width: 5.5%, Height: 33%) */}
      <div 
        className="absolute flex items-center justify-center"
        style={{
          top: '63%',
          left: '86.5%',
          width: '7%',
          height: '34%'
        }}
      >
        <span 
          className="font-['Orbitron'] font-black text-[#f3cb4d] tracking-wider whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{
            transform: 'rotate(-90deg)',
            fontSize: 'clamp(11px, 1.8vw, 22px)'
          }}
        >
          {price}/=
        </span>
      </div>

      {/* 4. DYNAMIC VERTICAL TICKET CODE PILL ON STUB (Top: 65.5%, Left: 94.6%, Width: 2.6%, Height: 28%) */}
      <div 
        className="absolute flex items-center justify-center font-mono font-black text-black tracking-widest uppercase overflow-hidden"
        style={{
          top: '65.5%',
          left: '94.3%',
          width: '2.8%',
          height: '28%'
        }}
      >
        <span 
          className="whitespace-nowrap select-all"
          style={{
            transform: 'rotate(-90deg)',
            fontSize: 'clamp(7px, 0.9vw, 11px)'
          }}
        >
          {ticketCode}
        </span>
      </div>

      {/* 5. DYNAMIC PRICE PILL ON MAIN CARD BOTTOM LEFT (Bottom: 3.5%, Left: 1.2%, Width: 9.5%, Height: 9%) */}
      <div 
        className="absolute flex items-center justify-center font-['Orbitron'] font-extrabold text-white text-center rounded-lg overflow-hidden"
        style={{
          bottom: '3.8%',
          left: '1.2%',
          width: '9.7%',
          height: '9.2%',
          fontSize: 'clamp(8px, 1.3vw, 15px)'
        }}
      >
        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{price}/=</span>
      </div>

      {/* 6. DYNAMIC TICKET CODE PILL ON MAIN CARD BOTTOM RIGHT (Bottom: 3.5%, Left: 59.8%, Width: 13.2%, Height: 8.8%) */}
      <div 
        className="absolute flex items-center justify-center font-mono font-black text-black text-center tracking-wider overflow-hidden rounded-md"
        style={{
          bottom: '3.6%',
          left: '59.6%',
          width: '13.5%',
          height: '8.8%',
          fontSize: 'clamp(7px, 1.1vw, 13px)'
        }}
      >
        <span className="select-all truncate px-1">{ticketCode}</span>
      </div>
    </div>
  );
};

export default TicketPass;
