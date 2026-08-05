import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CalendarModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const options = [
    { name: 'Google', iconSrc: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
    { name: 'Outlook.com (Web)', iconSrc: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018–present%29.svg' },
    { name: 'Classic Outlook (Desktop)', iconSrc: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018–present%29.svg' },
    { name: 'New Outlook (Desktop)', iconSrc: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018–present%29.svg' },
    { name: 'Microsoft 365', iconSrc: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019–present%29.svg' },
    { name: 'Other', iconSrc: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Calendar_icon_2.svg' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative overflow-visible mt-8 animate-in fade-in zoom-in duration-200 font-sans">
        
        {/* Red Header */}
        <div className="h-20 bg-[#E00613] rounded-t-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-zinc-200 transition-colors"
          >
            <div className="border border-white/30 rounded-full p-1">
              <X size={20} strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Logo Circle Overlapping */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-20 h-20 bg-black rounded-full shadow-lg flex items-center justify-center overflow-hidden border-4 border-white p-2">
          <img 
            src="/logo.png" 
            alt="Lunix Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Modal Content */}
        <div className="pt-12 pb-8 px-6">
          <h2 className="text-center text-xl font-bold font-['Formula1'] text-zinc-900 mb-6 border-b border-zinc-200 pb-3 inline-block mx-auto w-full">
            Choose your Calendar
          </h2>

          <div className="grid grid-cols-3 gap-x-3 gap-y-6">
            {options.map((opt, idx) => (
              <button 
                key={idx} 
                className="flex flex-col items-center gap-3 group hover:scale-105 transition-transform"
                onClick={() => {
                  toast.success(`Event added to ${opt.name}!`);
                  onClose();
                }}
              >
                <div className="w-[60px] h-[60px] bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center justify-center p-3 group-hover:border-zinc-300 group-hover:shadow-md transition-all">
                  <img src={opt.iconSrc} alt={opt.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs text-center text-zinc-800 font-medium leading-tight max-w-[80px]">
                  {opt.name}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CalendarModal;
