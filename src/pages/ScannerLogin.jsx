import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ScannerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { user, token } = res.data;
        
        // Allow both admins and scanners to use the scanner portal
        if (user.role === 'scanner' || user.role === 'admin') {
          localStorage.setItem('scannerToken', token);
          localStorage.setItem('scannerUser', JSON.stringify(user));
          toast.success('Login successful!');
          navigate('/scanner/dashboard');
        } else {
          toast.error('Access Denied: Scanner privileges required.');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 font-inter text-base relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00b87c]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#3b82f6]/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-[#1e293b] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-zinc-800">
            <QrCode className="w-10 h-10 text-[#00b87c]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Scanner Portal</h1>
          <p className="text-zinc-400">Log in to verify event tickets.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#1e293b]/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f172a] text-white p-4 rounded-xl border border-zinc-700 focus:border-[#00b87c] focus:ring-1 focus:ring-[#00b87c] outline-none transition-all placeholder:text-zinc-600"
                placeholder="staff@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f172a] text-white p-4 rounded-xl border border-zinc-700 focus:border-[#00b87c] focus:ring-1 focus:ring-[#00b87c] outline-none transition-all placeholder:text-zinc-600"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#00b87c] text-white p-4 rounded-xl font-bold mt-4 hover:bg-[#00a36e] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 shadow-[0_0_20px_rgba(0,184,124,0.3)]"
            >
              {isLoading ? 'Authenticating...' : 'Access Scanner'}
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScannerLogin;
