import { useState } from 'react';
import { Eye, EyeOff, Check, Circle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.user.role === 'admin') {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin');
      } else {
        localStorage.setItem('userToken', res.data.token);
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!rules.every(r => r.valid)) {
      toast.error('Please ensure your password meets all requirements.');
      return;
    }
    try {
      const res = await api.post('/auth/register', { name: regName, email: regEmail, password: regPassword });
      localStorage.setItem('userToken', res.data.token);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    }
  };

  const rules = [
    { label: 'Uppercase', valid: /[A-Z]/.test(regPassword) },
    { label: 'Lowercase', valid: /[a-z]/.test(regPassword) },
    { label: 'Number', valid: /[0-9]/.test(regPassword) },
    { label: '8-30 characters', valid: regPassword.length >= 8 && regPassword.length <= 30 },
    { label: 'Any of !, @, #, %, ^, &, +, =, -', valid: /[!@#%^&+\=\-]/.test(regPassword) },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center pt-10 pb-10">
        <div className="w-full max-w-2xl bg-[#f4f4f4] shadow-md rounded-md overflow-hidden self-start mt-10">
        
        {/* Top Tabs */}
        <div className="bg-[#1e1e24] text-white flex">
          <button 
            className={`flex-1 py-4 text-center font-bold text-sm tracking-wide border-b-4 ${activeTab === 'signin' ? 'border-f1-red' : 'border-transparent text-zinc-300 hover:text-white hover:bg-zinc-800'}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign in
          </button>
          <button 
            className={`flex-1 py-4 text-center font-bold text-sm tracking-wide border-b-4 ${activeTab === 'register' ? 'border-f1-red' : 'border-transparent text-zinc-300 hover:text-white hover:bg-zinc-800'}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {/* Form Container */}
        <div className="p-10 md:p-14 bg-[#f9f9f9]">
          <h1 className="font-['Formula1'] text-[28px] font-light uppercase text-zinc-800/90 mb-6 tracking-wide">
            {activeTab === 'signin' ? 'SIGN IN' : 'REGISTER'}
          </h1>
          
          <div className="border-t border-zinc-200 mb-8"></div>

          {activeTab === 'signin' ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-zinc-700 text-[15px] mb-2 font-medium">Email address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  className="w-full p-3.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-500 bg-white text-zinc-800 placeholder-zinc-400 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 text-[15px] mb-2 font-medium">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" 
                    className="w-full p-3.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-500 bg-white text-zinc-800 placeholder-zinc-400 shadow-sm pr-12"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Link to="#" className="text-[15px] font-bold text-zinc-800 border-b-2 border-f1-red pb-0.5 hover:text-f1-red transition-colors">
                  Forgotten password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="w-full bg-f1-red text-white font-medium py-3 px-8 rounded hover:brightness-110 transition-colors mt-2"
              >
                SIGN IN
              </button>

              <div className="pt-8 text-center">
                <span className="text-zinc-600 text-[15px]">Don't have an account yet? </span>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('register')} 
                  className="text-[15px] font-bold text-zinc-800 border-b-2 border-f1-red pb-0.5 hover:text-f1-red transition-colors ml-1"
                >
                  Register
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label className="block text-zinc-700 text-[15px] mb-2 font-medium">User name</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Enter your user name" 
                  className="w-full p-3.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-500 bg-white text-zinc-800 placeholder-zinc-400 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 text-[15px] mb-2 font-medium">Email address</label>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com" 
                  className="w-full p-3.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-500 bg-white text-zinc-800 placeholder-zinc-400 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 text-[15px] mb-2 font-medium">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-3.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-500 bg-white text-zinc-800 placeholder-zinc-400 shadow-sm pr-12"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                  </button>
                </div>
                
                {/* Dynamic Password Rules Checklist */}
                <div className="mt-5 bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
                  <p className="text-[14px] font-bold text-zinc-800 mb-3 uppercase tracking-wide">Password must contain:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rules.map((rule, idx) => (
                      <li key={idx} className="flex items-center text-[13px]">
                        {rule.valid ? (
                          <Check size={16} className="text-green-500 mr-2 flex-shrink-0" strokeWidth={3} />
                        ) : (
                          <Circle size={12} className="text-zinc-300 mr-2.5 ml-0.5 flex-shrink-0" strokeWidth={3} />
                        )}
                        <span className={rule.valid ? 'text-zinc-800 font-bold' : 'text-zinc-500 font-medium'}>
                          {rule.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button 
                type="submit" 
                className="bg-f1-red text-white font-medium py-3 px-8 rounded hover:brightness-110 transition-colors mt-2"
              >
                CREATE ACCOUNT
              </button>

              <div className="pt-10">
                <span className="text-zinc-600 text-[15px]">Already have an account? </span>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('signin')} 
                  className="text-[15px] font-bold text-zinc-800 border-b-2 border-f1-red pb-0.5 hover:text-f1-red transition-colors ml-1"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
