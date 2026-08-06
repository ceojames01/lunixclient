import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fingerprint, Globe, TrendingUp, Package, Cpu, Briefcase, CalendarDays, HardHat, Clapperboard, Code, Camera, UserCog, Instagram, ExternalLink, ArrowRight } from 'lucide-react';
import api from '../services/api';




const SectionHeading = ({ children }) => (
  <h2 className="font-['Formula1'] font-bold text-2xl md:text-[32px] text-white uppercase tracking-wider">
    {children}
  </h2>
);

const MediaBlock = ({ item, className = '' }) =>
  item?.imageUrl ? (
    <img src={item.imageUrl} alt={item.title} className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div className={`h-full w-full flex items-center justify-center text-xs uppercase tracking-widest text-f1-text-muted ${className}`}>
      Image
    </div>
  );

const getHeadingSizeClass = (size) => {
  switch(size) {
    case 'Small': return 'text-xl sm:text-2xl md:text-3xl';
    case 'Medium': return 'text-2xl sm:text-3xl md:text-4xl';
    case 'Extra Large': return 'text-4xl sm:text-5xl md:text-[4rem]';
    case 'Large (Default)':
    default:
      return 'text-3xl sm:text-4xl md:text-[3rem]';
  }
};

const Dashboard = () => {
  const [picks, setPicks] = useState([]);
  const [picksDriveLink, setPicksDriveLink] = useState('');
  const [leaders, setLeaders] = useState([]);
  const [hero, setHero] = useState(null);
  const [showExecutiveBoard, setShowExecutiveBoard] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [picksRes, articlesRes, leadersRes, heroRes, configRes] = await Promise.all([
          api.get('/content/editors-picks'),
          api.get('/content/articles'),
          api.get('/content/leadership'),
          api.get('/content/hero'),
          api.get('/content/config')
        ]);
        if (!active) return;
        setPicks(picksRes.data.data?.length ? picksRes.data.data : []);
        setPicksDriveLink(picksRes.data.driveLink || '');
        setLeaders(leadersRes.data.data?.length ? leadersRes.data.data : []);
        if (heroRes.data.data) setHero(heroRes.data.data);
        if (configRes.data.data) setShowExecutiveBoard(configRes.data.data.showExecutiveBoard !== false);
      } catch {
        if (!active) return;
        setPicks([]);
        setLeaders([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="bg-f1-asphalt text-white">
      {/* Hero media canvas */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div 
          className="relative w-full rounded-[20px] overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 flex items-end min-h-[350px] h-[50vh] md:h-[var(--hero-height)] md:min-h-[400px]"
          style={{ '--hero-height': hero?.sectionHeight || '85vh' }}
        >
          {hero ? (
            <>
              {hero.mediaType === 'video' || (hero.mediaUrl && hero.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                <video 
                  src={hero.mediaUrl} 
                  autoPlay loop muted playsInline 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${hero.mediaUrl})` }} 
                />
              )}
              <div 
                className="absolute inset-0 z-0" 
                style={{ background: `linear-gradient(to top, rgba(0,0,0,${(hero.overlayOpacity !== undefined ? hero.overlayOpacity : 50) / 100}) 0%, rgba(0,0,0,${((hero.overlayOpacity !== undefined ? hero.overlayOpacity : 50) / 100) * 0.4}) 50%, transparent 100%)` }} 
              />
              <div className="relative p-6 md:p-10 w-full z-10">
                {(hero.showBadge !== false) && hero.badgeText && (
                  <span className="bg-f1-red text-white text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded inline-block mb-2">
                    {hero.badgeText}
                  </span>
                )}
                <h1 className={`font-['Formula1'] uppercase font-bold text-white leading-[1.1] tracking-wide drop-shadow-lg break-words ${getHeadingSizeClass(hero.headingSize)}`}>
                  {hero.title}
                </h1>

              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 italic">
              No hero banner configured.
            </div>
          )}
        </div>
      </section>

      {/* Main layout track */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-16">
        {/* Section A: Overview */}
        <section id="overview">
          <SectionHeading>Overview</SectionHeading>


          <div className="mt-20 flex flex-col items-center w-full">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full">
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 min-h-[320px] flex flex-col items-center justify-center text-center">
                <Fingerprint className="text-f1-red w-10 h-10 mb-6" />
                <h3 className="font-['Formula1'] text-[#eab308] text-lg font-bold uppercase tracking-widest mb-4">Identity</h3>
                <p className="text-f1-text-muted leading-relaxed text-sm md:text-base">
                  Lunix Enterprises Limited is a dynamic, multi-sector conglomerate
                  committed to delivering innovative and high-quality solutions. We
                  specialize in corporate scaling and high-level resource management.
                </p>
              </div>

              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 min-h-[320px] flex flex-col items-center justify-center text-center">
                <Globe className="text-f1-red w-10 h-10 mb-6" />
                <h3 className="font-['Formula1'] text-[#eab308] text-lg font-bold uppercase tracking-widest mb-4">Global Footprint</h3>
                <p className="text-f1-text-muted leading-relaxed text-sm md:text-base">
                  Operating with a focus on strategic market penetration, we
                  combine modern technology with professional expertise to meet
                  client needs. Our reach is defined by the development of
                  sustainable business ecosystems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section B: Corporate structure */}
        <section id="corporate-structure">
          <SectionHeading>Corporate structure</SectionHeading>


          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* LUNIX CAPITAL */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <TrendingUp className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Lunix Capital</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Driving growth through strategic financial planning and tender funding.
                  We manage investment portfolios and capital allocation to ensure large-scale
                  projects are fully resourced and sustainable.
                </p>
              </div>

              {/* LUNIX OPERATIONS */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <Package className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Lunix Operations</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  The core of our execution engine, specializing in end-to-end
                  procurement and logistics to deliver contracted tenders with administrative
                  integrity and high-level efficiency.
                </p>
              </div>

              {/* LUNIX TECHNOLOGY */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <Cpu className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Lunix Technology</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Leveraging modern technology to deliver innovative technical solutions.
                  This division handles specialized equipment supply and digital systems
                  designed to enhance operational efficiency.
                </p>
              </div>

              {/* LUNIX CONSULTING */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <Briefcase className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Lunix Consulting</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Providing professional expertise and advisory services. We guide clients
                  through complex tender applications, strategic project planning, and
                  corporate compliance frameworks.
                </p>
              </div>

              {/* LUNIX EVENTS & SERVICES */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <CalendarDays className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Lunix Events & Services</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Dedicated to comprehensive event management and general service
                  provision. We combine creative planning with reliable execution to
                  deliver high-quality event solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section C: Editors Picks */}
        <section>
          <div className="flex justify-between items-end w-full">
            <h2 className="font-['Formula1'] font-bold text-2xl md:text-[32px] text-white uppercase tracking-wider italic">
              EDITOR'S PICKS
            </h2>
            <a
              href={picksDriveLink || '#'}
              target={picksDriveLink ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="text-f1-red text-xs uppercase tracking-widest font-bold font-['Manrope'] hover:text-white transition-colors mb-1 flex items-center gap-1"
            >
              See all <ArrowRight className="w-4 h-4 text-white" />
            </a>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 ${picks.length > 0 ? 'md:grid-rows-2 md:h-[720px]' : ''}`}>
            {picks.length > 0 ? picks.slice(0, 6).map((pick, i) => {
              if (i === 0 || i === 5) {
                return (
                  <article
                    key={pick._id}
                    className="col-span-2 relative h-56 md:h-full min-h-[220px] md:min-h-[250px] overflow-hidden rounded-2xl md:rounded-3xl group cursor-pointer bg-zinc-900"
                  >
                    <MediaBlock
                      item={pick}
                      className="absolute inset-0 group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <h3 className="text-white text-base md:text-2xl font-bold leading-tight drop-shadow-md">
                        {pick.title}
                      </h3>
                    </div>
                  </article>
                );
              } else {
                return (
                  <article
                    key={pick._id}
                    className="col-span-1 relative h-56 md:h-full min-h-[220px] md:min-h-[250px] overflow-hidden rounded-2xl md:rounded-3xl group cursor-pointer bg-zinc-900"
                  >
                    <MediaBlock
                      item={pick}
                      className="absolute inset-0 group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <h3 className="text-white text-xs md:text-[15px] font-semibold leading-snug drop-shadow-md group-hover:text-f1-red transition-colors">
                        {pick.title}
                      </h3>
                    </div>
                  </article>
                );
              }
            }) : (
              <div className="col-span-full py-12 text-center text-zinc-500 italic flex items-center justify-center">No Editor's Picks available at the moment.</div>
            )}
          </div>
        </section>

        {/* Section D: Global services */}
        {/* Section C: Global services */}
        <section id="global-services">
          <SectionHeading>Global services</SectionHeading>


          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <HardHat className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Infrastructure & Civil Tenders</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  End-to-end management of construction contracts and civil engineering tenders, ensuring administrative integrity and high-quality structural delivery.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <Clapperboard className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Premium Entertainment & Show Production</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Leading the industry in conceptualizing and executing high-energy entertainment shows. Our portfolio extends to professional pageantry (Mr. & Miss) and elite fashion competitions, delivered with a focus on modern technology and creative excellence.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <Code className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Software Architecture & Engineering</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Developing and deploying bespoke digital systems and enterprise software solutions designed to enhance operational efficiency and corporate scaling.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <Camera className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Visual Content & Photography</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Delivering high-end commercial photography and professional media production for corporate branding, model portfolios, and media project headers.
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <Package className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Logistical Supply Chains</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Streamlining the procurement and delivery of specialized equipment and high-value resources across multiple sectors including technology and supply.
                </p>
              </div>

              {/* Card 6 */}
              <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="bg-[#1a1010] p-5 rounded-3xl mb-6 flex items-center justify-center">
                  <UserCog className="text-f1-red w-8 h-8" />
                </div>
                <h4 className="font-['Formula1'] text-[#eab308] text-sm font-bold uppercase tracking-widest mb-4">Welfare & Community Administration</h4>
                <p className="text-f1-text-muted text-sm leading-relaxed">
                  Professional management of community welfare group logistics and contribution sorting, maintaining high levels of transparency and administrative integrity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section E: Leadership */}
        {showExecutiveBoard && (
          <section id="leadership">
          <h2 className="font-['Formula1'] font-bold text-2xl md:text-[32px] text-white uppercase tracking-widest mb-8">
            EXECUTIVE BOARD
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {leaders.length > 0 ? leaders.map((leader) => (
              <div
                key={leader._id}
                className="bg-[#0f0a0a] border border-[#2a1515] rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="w-full aspect-[4/5] mb-5 overflow-hidden rounded-2xl bg-zinc-800">
                  {leader.imageUrl ? (
                    <img src={leader.imageUrl} alt={leader.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-f1-text-muted text-sm font-black bg-[#1a1111]">
                      {leader.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>
                <h3 className="font-['Formula1'] text-[#eab308] text-base font-bold uppercase tracking-wider">{leader.name}</h3>
                <p className="font-['Formula1'] text-f1-red text-xs font-bold uppercase mt-1.5 mb-3">{leader.role}</p>
                <p className="text-zinc-400 text-xs leading-relaxed px-2 flex-grow">{leader.bio}</p>
                
                <a
                  href={leader.instagramUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 bg-[#1a1111] hover:bg-[#2a1a1a] transition-colors border border-[#2a1515] rounded-full py-1.5 px-5"
                >
                  <Instagram className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-400 text-xs font-semibold tracking-wide">Instagram</span>
                </a>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-zinc-500 italic">No board members listed yet.</div>
            )}
          </div>
          </section>
        )}



        {/* Dual high-contrast banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <Link
            to="/betting"
            className="bg-[#c8cbf5] text-[#0f111a] rounded-lg py-5 px-6 flex justify-between items-center cursor-pointer hover:bg-[#b7bdf3] transition-colors duration-200"
          >
            <span className="font-['Formula1'] font-light uppercase tracking-wider text-[15px] opacity-90">
              Lunix Betting
            </span>
            <ExternalLink className="w-6 h-6 stroke-[2]" />
          </Link>
          <Link
            to="/tickets"
            className="bg-[#c8cbf5] text-[#0f111a] rounded-lg py-5 px-6 flex justify-between items-center cursor-pointer hover:bg-[#b7bdf3] transition-colors duration-200"
          >
            <span className="font-['Formula1'] font-light uppercase tracking-wider text-[15px] opacity-90">
              Lunix Tickets
            </span>
            <ExternalLink className="w-6 h-6 stroke-[2]" />
          </Link>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
