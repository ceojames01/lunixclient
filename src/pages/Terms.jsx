import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="bg-[#f3f4f6] min-h-screen text-zinc-900 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <h1 className="font-['Formula1'] uppercase text-3xl md:text-4xl font-bold mb-2 tracking-tight">TERMS OF SERVICE</h1>
        <p className="text-[15px] text-zinc-500 mb-10">
          Last updated: 17/07/2026
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 border border-zinc-100 space-y-8">
          
          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">ACCEPTANCE OF TERMS</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              By accessing and using the Lunix website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">ACCOUNT RESPONSIBILITIES</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">ORDERS AND PAYMENTS</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              All orders are subject to availability. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice. Payment is required at the time of purchase unless otherwise agreed.
            </p>
          </section>


          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">INTELLECTUAL PROPERTY</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              All content on this website, including logos, images, and product descriptions, is the property of Lunix and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">LIMITATION OF LIABILITY</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              Lunix shall not be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of our services.
            </p>
          </section>

          <section>
            <h2 className="font-['Formula1'] uppercase text-xl font-bold mb-4">CONTACT US</h2>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              If you have any questions about these Terms of Service, please contact us at lunixenterpriseslimited@gmail.com or call our customer care at +254114960030.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Terms;
