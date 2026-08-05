import { ArrowLeft, Heart, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-[#f3f4f6] min-h-screen text-zinc-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-zinc-900 hover:text-black mb-12 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="bg-black text-white p-4 rounded-2xl mb-6">
            <Heart size={32} />
          </div>
          <h1 className="font-['Formula1'] uppercase text-4xl md:text-5xl font-bold mb-4 tracking-tight">ABOUT LUNIX</h1>
          <p className="text-[13px] font-bold text-zinc-500 tracking-widest uppercase mb-6">
            PRESTIGE. POWER. PROGRESS.
          </p>
          <div className="w-16 h-0.5 bg-green-500"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-zinc-100 flex flex-col h-full">
            <h2 className="font-['Formula1'] uppercase text-2xl font-bold mb-6">IDENTITY</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px] mb-8 flex-grow">
              Lunix Enterprises Limited is a dynamic, multi-sector conglomerate committed to delivering innovative and high-quality solutions. We specialize in corporate scaling and high-level resource management.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-zinc-100 flex flex-col h-full">
            <h2 className="font-['Formula1'] uppercase text-2xl font-bold mb-6">GLOBAL FOOTPRINT</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px] mb-8 flex-grow">
              Operating with a focus on strategic market penetration, we combine modern technology with professional expertise to meet client needs. Our reach is defined by the development of sustainable business ecosystems.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
