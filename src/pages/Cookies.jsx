import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cookies = () => {
  return (
    <div className="bg-[#f3f4f6] min-h-screen text-zinc-900 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <h1 className="font-['Formula1'] uppercase text-3xl md:text-4xl font-bold mb-2 tracking-tight">COOKIE POLICY</h1>
        <p className="text-[15px] text-zinc-500 mb-10">
          Last updated: 17/07/2026
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 border border-zinc-100 space-y-8">
          
          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">WHAT ARE COOKIES</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              Cookies are small text files that are stored on your device when you visit our website. They help us remember your preferences and improve your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-6">TYPES OF COOKIES WE USE</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-['Formula1'] uppercase font-bold text-zinc-900 mb-1">ESSENTIAL COOKIES</h3>
                <p className="text-zinc-600 leading-relaxed text-[15px]">
                  These cookies are necessary for the website to function properly. They enable core features like shopping cart and checkout functionality.
                </p>
              </div>

              <div>
                <h3 className="font-['Formula1'] uppercase font-bold text-zinc-900 mb-1">ANALYTICS COOKIES</h3>
                <p className="text-zinc-600 leading-relaxed text-[15px]">
                  We use analytics cookies to understand how visitors interact with our website. This helps us improve our site performance and user experience.
                </p>
              </div>

              <div>
                <h3 className="font-['Formula1'] uppercase font-bold text-zinc-900 mb-1">MARKETING COOKIES</h3>
                <p className="text-zinc-600 leading-relaxed text-[15px]">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">MANAGING COOKIES</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              You can control or disable cookies through your browser settings. However, please note that disabling essential cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">THIRD-PARTY COOKIES</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              We may use third-party services such as Google Analytics and social media platforms that set their own cookies. We have no control over these cookies.
            </p>
          </section>
          
          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">UPDATES TO THIS POLICY</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">CONTACT US</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              If you have any questions about our Cookie Policy, please contact us at lunixenterpriseslimited@gmail.com or call our customer care at +254114960030.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Cookies;
