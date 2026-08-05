import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="bg-[#f3f4f6] min-h-screen text-zinc-900 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <h1 className="font-['Formula1'] uppercase text-3xl md:text-4xl font-bold mb-2 tracking-tight">PRIVACY POLICY</h1>
        <p className="text-[15px] text-zinc-500 mb-10">
          Last updated: 17/07/2026
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 border border-zinc-100 space-y-8">
          
          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">INFORMATION WE COLLECT</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              We collect information you provide directly to us, including name, email address, phone number, and payment information when you make a purchase. We also collect usage data and device information to improve our services.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">HOW WE USE YOUR INFORMATION</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              We use your information to provide and improve our services, process transactions, communicate with you about orders, and send you promotional content. We may also use your data for analytics and to comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">INFORMATION SHARING</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              We do not sell your personal information. We may share your information with service providers who assist us in operating our website and conducting our business. We may also share information when required by law or to protect our rights.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">DATA SECURITY</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">CONTACT US</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              If you have any questions about this Privacy Policy, please contact us at lunixenterpriseslimited@gmail.com or call our customer care at +254114960030.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
