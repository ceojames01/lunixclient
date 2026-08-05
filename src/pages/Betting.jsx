import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
const Betting = () => {
  const navigate = useNavigate();
  const [dob, setDob] = useState('');

  const handleConfirm = (e) => {
    e.preventDefault();
    if (dob) {
      // In a real app, you would validate age here.
      // For now, we'll just navigate or show a success message.
      toast.success('Date of birth confirmed. Welcome to F1 Betting!');
    } else {
      toast.error('Please enter your date of birth.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 bg-[repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0_40px,#ffffff_40px,#ffffff_80px)]">
      
      <h1 className="font-['Formula1'] text-[32px] md:text-[40px] font-black text-black mb-8 tracking-wide text-center uppercase">
        Welcome to Lunix Betting!
      </h1>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl px-8 py-12 md:px-16 flex flex-col">
        <p className="text-zinc-700 text-[17px] mb-8">
          Please help us as a responsible sports publisher by indicating your date of birth below.
        </p>

        <form onSubmit={handleConfirm} className="flex flex-col space-y-6">
          <div className="relative">
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-4 rounded-md border border-zinc-400 focus:outline-none focus:border-zinc-600 bg-white text-zinc-800 text-lg uppercase tracking-wide"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#e10600] text-white text-[17px] font-medium py-3.5 rounded-full hover:brightness-110 transition-colors"
          >
            Confirm
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="font-['Formula1'] text-[17px] font-black text-black underline hover:text-f1-red transition-colors">
            Go to Home page
          </Link>
        </div>
      </div>

      <div className="w-full max-w-3xl mt-10 text-center border-t border-zinc-300 pt-8 px-4">
        <p className="text-[#666666] text-[14px] leading-relaxed">
          By entering this site, you agree to our <Link to="/terms" className="font-bold underline hover:text-black transition-colors">Terms of Use</Link>, and acknowledge that you have read and understood our <Link to="/cookies" className="font-bold underline hover:text-black transition-colors">Cookie Policy</Link>, <Link to="/privacy" className="font-bold underline hover:text-black transition-colors">Privacy Policy</Link> and <span className="font-bold underline cursor-pointer hover:text-black transition-colors">Disclaimer</span>.
        </p>
      </div>

    </div>
  );
};

export default Betting;
