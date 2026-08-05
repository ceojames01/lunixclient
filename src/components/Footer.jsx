import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import api from '../services/api';

const TikTok = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512" 
    className={className} 
    fill="currentColor"
  >
    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
  </svg>
);

const XLogo = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512" 
    className={className} 
    fill="currentColor"
  >
    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
  </svg>
);

const Footer = () => {
  const [partners, setPartners] = useState([]);
  const location = useLocation();
  const hideBanner = ['/contact', '/privacy', '/cookies', '/terms', '/about', '/schedule', '/profile', '/wishlist'].includes(location.pathname) || location.pathname.startsWith('/tickets') || location.pathname.startsWith('/schedule');

  useEffect(() => {
    let active = true;
    const fetchPartners = async () => {
      try {
        const res = await api.get('/content/partners');
        if (active && res.data?.data) {
          setPartners(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch partners', error);
      }
    };
    fetchPartners();
    return () => { active = false; };
  }, []);

  const exploreLinks = [
    { name: 'Overview', path: '/#overview' },
    { name: 'Corporate structure', path: '/#corporate-structure' },
    { name: 'Global services', path: '/#global-services' },
    { name: 'Executive Board', path: '/#leadership' }
  ];
  const companyLinks = [{ label: 'About Lunix', path: '/about' }];

  return (
    <footer className="w-full">
      {/* Block Tier 1: Feedback callout strip */}
      {!hideBanner && (
        <div className="bg-[#000000] pt-12 pb-6 px-4 md:px-8 border-b border-f1-black">
          <div className="bg-f1-red text-white rounded-xl py-12 md:py-20 px-8 md:px-16 flex flex-col items-start max-w-7xl mx-auto">
            <h2 className="font-['Formula1'] text-4xl md:text-[4rem] font-bold uppercase leading-[0.95] tracking-tight">
              HELP SHAPE THE LUNIX<br className="hidden md:block" /> WEBSITE
            </h2>
            <p className="mt-6 mb-8 text-[15px] font-medium tracking-wide">
              Take a few minutes to tell us what you think.
            </p>
            <button className="font-['Formula1'] tracking-wider bg-white text-black font-bold text-[15px] py-2.5 px-8 rounded-full hover:bg-zinc-200 transition-colors">
              Let's go
            </button>
          </div>
        </div>
      )}

      {/* Block Tier 2: Partners */}
      <div className="bg-[#111115] py-12 px-4 md:px-8 border-b border-f1-border-grey">
        <div className="max-w-7xl mx-auto flex flex-col">
          <h2 className="font-['Formula1'] font-bold text-2xl md:text-[32px] text-white uppercase tracking-wider">OUR PARTNERS</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
            {partners.map((partner) => {
              const Wrapper = partner.link ? 'a' : 'div';
              const linkProps = partner.link ? { href: partner.link, target: "_blank", rel: "noopener noreferrer" } : {};
              
              return (
                <Wrapper 
                  key={partner._id} 
                  {...linkProps}
                  className="bg-[#111111] border border-zinc-800 rounded-xl aspect-[3/2] p-4 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                >
                  {partner.imageUrl ? (
                    <img src={partner.imageUrl} alt={partner.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-sm">{partner.name}</span>
                  )}
                </Wrapper>
              );
            })}
          </div>
          {partners.length === 0 && (
            <p className="text-f1-text-muted mt-4 italic">No partners to display yet.</p>
          )}
        </div>
      </div>

      {/* Block Tier 3: Primary links base */}
      <div className="bg-[#000000] py-14 px-8 text-[13px] text-f1-text-muted font-medium font-sans border-t border-f1-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Contact */}
          <div>
            <h4 className="font-['Formula1'] text-white font-bold uppercase mb-4 tracking-wider">Lunix Enterprise Limited</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:lunixenterpriseslimited@gmail.com" className="hover:text-white transition-colors">lunixenterpriseslimited@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+254114960030" className="hover:text-white transition-colors">+254 114 960 030</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Kirinyaga, Kutus</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="font-['Formula1'] text-white font-bold uppercase mb-4 tracking-wider">Explore</h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.path} className="hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-['Formula1'] text-white font-bold uppercase mb-4 tracking-wider">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="max-w-7xl mx-auto border-t border-f1-border-grey mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Socials */}
          <div className="flex items-center gap-4 text-zinc-400">
            <a href="https://www.facebook.com/share/1BJowsamSs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><XLogo className="w-4 h-4 mx-0.5" /></a>
            <a href="https://www.instagram.com/lunixenterprises" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="https://www.tiktok.com/@lunixenterprises" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><TikTok className="w-5 h-5" /></a>
          </div>

          {/* Copyright and Legal */}
          <div className="flex flex-col md:items-end text-center md:text-right">
            <div>&copy; {new Date().getFullYear()} Lunix Enterprise Limited All rights reserved.</div>
            <div className="mt-2 flex items-center justify-center md:justify-end gap-2 text-xs">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span>&bull;</span>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <span>&bull;</span>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
