import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      subject: 'General Inquiry',
      message: ''
    });
  };

  return (
    <div className="bg-[#f3f4f6] min-h-screen text-zinc-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-zinc-700 hover:text-black mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>

        <h1 className="font-['Formula1'] uppercase text-4xl md:text-5xl font-bold mb-4 tracking-tight">CONTACT US</h1>
        <p className="text-lg text-zinc-600 mb-12 max-w-2xl">
          Get in touch with our team. We're here to help with any questions or concerns.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Left Column - Contact Info */}
          <div>
            <h2 className="font-['Formula1'] uppercase text-2xl font-bold mb-8">GET IN TOUCH</h2>
            <div className="space-y-8">

              {/* Email Support */}
              <div className="flex items-start">
                <div className="bg-[#0f111a] text-white p-3.5 rounded-xl mr-5 flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-['Formula1'] uppercase text-lg font-bold mb-1">EMAIL SUPPORT</h3>
                  <p className="text-zinc-600 text-[15px] mb-1">lunixenterpriseslimited@gmail.com</p>
                  <p className="text-zinc-500 text-sm">We typically respond within 24 hours</p>
                </div>
              </div>

              {/* Phone Support */}
              <div className="flex items-start">
                <div className="bg-[#0f111a] text-white p-3.5 rounded-xl mr-5 flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-['Formula1'] uppercase text-lg font-bold mb-1">PHONE SUPPORT</h3>
                  <p className="text-zinc-600 text-[15px] mb-1">+254114960030</p>
                  <p className="text-zinc-500 text-sm">Mon-Sat: 8AM-8PM EAT</p>
                </div>
              </div>

              {/* Our Locations */}
              <div className="flex items-start">
                <div className="bg-[#0f111a] text-white p-3.5 rounded-xl mr-5 flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-['Formula1'] uppercase text-lg font-bold mb-1">OUR LOCATIONS</h3>
                  <p className="text-zinc-600 text-[15px] mb-1">Kirinyaga,Kutus</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start">
                <div className="bg-[#0f111a] text-white p-3.5 rounded-xl mr-5 flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-['Formula1'] uppercase text-lg font-bold mb-1">BUSINESS HOURS</h3>
                  <p className="text-zinc-600 text-[15px] mb-1">Monday - Saturday: 8:00 AM - 8:00 PM</p>
                  <p className="text-zinc-500 text-sm">Sunday: 10:00 AM - 5:00 PM</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-zinc-100">
              <h2 className="font-['Formula1'] uppercase text-2xl font-bold mb-8">SEND US A MESSAGE</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="w-full p-3.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-[15px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="w-full p-3.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-[15px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full p-3.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-[15px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-3.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-[15px] bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Shape Lunix Website">Shape Lunix Website</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className="w-full p-3.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-[15px] resize-y"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0f111a] text-white font-bold py-4 rounded-lg hover:bg-zinc-800 transition-colors text-[16px] mt-2"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
