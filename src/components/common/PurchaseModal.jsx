import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
const FloatingInput = ({ label, type = "text", ...props }) => (
  <div className="relative w-full group">
    <input 
      type={type} 
      className="peer w-full h-[50px] border border-zinc-300 rounded p-3 text-base outline-none focus:border-[#DA1A21] bg-transparent placeholder-transparent font-['Manrope']" 
      placeholder={label}
      {...props}
    />
    <label 
      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 bg-white px-1 transition-all duration-200 pointer-events-none font-['Manrope']
                 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#DA1A21] 
                 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
    >
      {label}
    </label>
  </div>
);

const PurchaseModal = ({ isOpen, onClose, event, ticketCounts, totalAmount }) => {
  if (!isOpen) return null;

  const [selectedMethod, setSelectedMethod] = useState('CARDS');
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    cardNumber: '',
    cardCvv: '',
    cardExpiry: '',
    cardHolder: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const countryOptions = useMemo(() => countryList().getData(), []);

  const paymentMethods = ['MPESA', 'CARDS'];

  const selectedTickets = event.ticketTiers?.map((tier, idx) => {
    return {
      name: tier.name,
      count: ticketCounts[idx] || 0
    };
  }).filter(t => t.count > 0) || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-['Manrope']">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-black text-zinc-900 mb-6 uppercase tracking-wide font-['Manrope']">Purchase tickets for</h2>
          
          {/* Stepper */}
          <div className="flex justify-between items-start relative px-4">
            {/* Connecting Line */}
            <div className="absolute top-4 left-12 right-12 h-px bg-zinc-300 z-0"></div>
            
            <div className="flex flex-col items-center relative z-10 w-1/4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-3 ${step >= 1 ? 'bg-[#DA1A21] text-white' : 'bg-zinc-400 text-white'}`}>
                {step > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
              </div>
              <p className={`text-sm text-center leading-tight ${step >= 1 ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>Choose payment<br/>method</p>
            </div>
            <div className="flex flex-col items-center relative z-10 w-1/4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-3 ${step >= 2 ? 'bg-[#DA1A21] text-white' : 'bg-zinc-400 text-white'}`}>
                {step > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
              </div>
              <p className={`text-sm text-center leading-tight ${step >= 2 ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>Billing Information</p>
            </div>
            <div className="flex flex-col items-center relative z-10 w-1/4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-3 ${step >= 3 ? 'bg-[#DA1A21] text-white' : 'bg-zinc-400 text-white'}`}>
                {step > 3 ? <Check size={16} strokeWidth={3} /> : '3'}
              </div>
              <p className={`text-sm text-center leading-tight ${step >= 3 ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>Payment Details</p>
            </div>
            <div className="flex flex-col items-center relative z-10 w-1/4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-3 ${step >= 4 ? 'bg-[#DA1A21] text-white' : 'bg-zinc-400 text-white'}`}>
                {step > 4 ? <Check size={16} strokeWidth={3} /> : '4'}
              </div>
              <p className={`text-sm text-center leading-tight ${step >= 4 ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>Confirm Order</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto border-t border-zinc-200 mt-4 flex flex-col md:flex-row">
          
          {/* Left Column - Dynamic Content based on Step */}
          <div className="flex-1 p-6 pr-10">
            {step === 1 && (
              <>
                <h3 className="text-zinc-500 mb-4 text-xl font-black uppercase tracking-wide font-['Manrope']">Payment method</h3>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <label 
                      key={method} 
                      className="flex items-center gap-4 cursor-pointer group"
                      onClick={() => setSelectedMethod(method)}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMethod === method ? 'border-[#DA1A21]' : 'border-zinc-500 group-hover:border-zinc-700'}`}>
                        {selectedMethod === method && (
                          <div className="w-3 h-3 rounded-full bg-[#DA1A21]"></div>
                        )}
                      </div>
                      <span className="text-lg text-zinc-800">{method}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput label="First Name *" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                  <FloatingInput label="Last Name *" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput label="Email *" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                  <div className="relative w-full group">
                    <span className="absolute -top-3 left-4 bg-white px-1 text-sm text-zinc-600 z-10">Phone</span>
                    <PhoneInput
                      country={'ke'}
                      value={formData.phone}
                      onChange={(phone) => handleInputChange('phone', phone)}
                      enableSearch={true}
                      disableSearchIcon={true}
                      buttonClass="!bg-transparent !border-y !border-l !border-r-0 !border-zinc-300 !rounded-l !px-2 group-focus-within:!border-[#DA1A21] !hover:bg-transparent"
                      dropdownClass="!w-72 !max-h-60 !rounded-lg !shadow-xl !border-zinc-200"
                      inputClass="!w-full !h-[50px] !border !border-zinc-300 !rounded !p-3 !pl-14 focus:!outline-none focus:!border-[#DA1A21] !text-base !font-['Manrope']"
                      searchClass="!w-[90%] !mx-auto !my-2 !p-2 !border !border-zinc-300 !rounded"
                    />
                  </div>
                </div>
                {selectedMethod === 'CARDS' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        options={countryOptions}
                        value={selectedCountry}
                        onChange={setSelectedCountry}
                        placeholder="Country"
                        isClearable
                        className="w-full font-['Manrope']"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            height: '50px',
                            borderColor: state.isFocused ? '#DA1A21' : '#d4d4d8',
                            boxShadow: state.isFocused ? '0 0 0 1px #DA1A21' : 'none',
                            borderRadius: '0.25rem',
                            '&:hover': {
                              borderColor: state.isFocused ? '#DA1A21' : '#d4d4d8',
                            }
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 50
                          })
                        }}
                      />
                      <FloatingInput label="State/County *" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                      <FloatingInput label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Postal Code" value={formData.postalCode} onChange={(e) => handleInputChange('postalCode', e.target.value)} />
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 mt-2">
                {selectedMethod === 'MPESA' ? (
                  <>
                    <h3 className="text-xl text-zinc-900 mb-6 font-['Manrope']">Confirm your mobile number</h3>
                    <div className="relative w-full group">
                      <span className="absolute -top-3 left-4 bg-white px-1 text-sm text-zinc-600 z-10">Phone</span>
                      <PhoneInput
                        country={'ke'}
                        value="254723444567"
                        enableSearch={true}
                        disableSearchIcon={true}
                        buttonClass="!bg-transparent !border-y !border-l !border-r-0 !border-zinc-300 !rounded-l !px-2 group-focus-within:!border-[#DA1A21] !hover:bg-transparent"
                        dropdownClass="!w-72 !max-h-60 !rounded-lg !shadow-xl !border-zinc-200"
                        inputClass="!w-full !h-[50px] !border !border-zinc-300 !rounded !p-3 !pl-14 focus:!outline-none focus:!border-[#DA1A21] !text-base !font-['Manrope']"
                        searchClass="!w-[90%] !mx-auto !my-2 !p-2 !border !border-zinc-300 !rounded"
                      />
                    </div>
                    <p className="text-zinc-900 mt-6 font-medium text-lg">We will send a payment request to this phone number</p>
                  </>
                ) : (
                  <>
                    <FloatingInput label="Card Number" value={formData.cardNumber} onChange={(e) => handleInputChange('cardNumber', e.target.value)} />
                    <FloatingInput label="Card CVV" value={formData.cardCvv} onChange={(e) => handleInputChange('cardCvv', e.target.value)} />
                    <FloatingInput label="Card expiry" value={formData.cardExpiry} onChange={(e) => handleInputChange('cardExpiry', e.target.value)} />
                    <FloatingInput label="Card holder name" value={formData.cardHolder} onChange={(e) => handleInputChange('cardHolder', e.target.value)} />
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="mt-2 font-['Manrope']">
                <h3 className="text-2xl text-zinc-900 mb-8 font-black uppercase tracking-wide font-['Manrope']">CONFIRM YOUR DETAILS</h3>
                
                <h4 className="text-xl text-zinc-900 mb-4 font-black uppercase tracking-wide font-['Manrope']">BILLING INFORMATION:</h4>
                <div className="flex flex-col mb-10">
                  <div className="flex border-b border-zinc-100 py-4">
                    <span className="w-1/3 text-zinc-900">First Name:</span>
                    <span className="w-2/3 text-zinc-900">{formData.firstName}</span>
                  </div>
                  <div className="flex border-b border-zinc-100 py-4">
                    <span className="w-1/3 text-zinc-900">Last Name:</span>
                    <span className="w-2/3 text-zinc-900">{formData.lastName}</span>
                  </div>
                  <div className="flex border-b border-zinc-100 py-4">
                    <span className="w-1/3 text-zinc-900">Email:</span>
                    <span className="w-2/3 text-zinc-900">{formData.email}</span>
                  </div>
                  <div className="flex border-b border-zinc-100 py-4">
                    <span className="w-1/3 text-zinc-900">Phone:</span>
                    <span className="w-2/3 text-zinc-900">{formData.phone}</span>
                  </div>
                  {selectedMethod === 'CARDS' && formData.address && (
                    <div className="flex border-b border-zinc-100 py-4">
                      <span className="w-1/3 text-zinc-900">Address:</span>
                      <span className="w-2/3 text-zinc-900">{formData.address}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-xl text-zinc-900 mb-4 font-black uppercase tracking-wide font-['Manrope']">PAYMENT INFORMATION:</h4>
                <div className="flex flex-col">
                  <div className="flex border-b border-zinc-100 py-4">
                    <span className="w-1/3 text-zinc-900">Payment Method:</span>
                    <span className="w-2/3 text-zinc-900">{selectedMethod}</span>
                  </div>
                  {selectedMethod === 'MPESA' && (
                    <div className="flex border-b border-zinc-100 py-4">
                      <span className="w-1/3 text-zinc-900">Mobile number:</span>
                      <span className="w-2/3 text-zinc-900">{formData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-zinc-200 my-8"></div>

          {/* Right Column - Order Summary */}
          <div className="w-full md:w-2/5 p-6 bg-white">
            <div className="rounded-xl overflow-hidden mb-4 shadow-sm">
              {event.posterUrl ? (
                <img src={event.posterUrl} alt={event.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold">No Poster</div>
              )}
            </div>
            
            <h3 className="font-bold text-xl text-zinc-900 mb-4">Your order:</h3>
            
            <div className="space-y-1 mb-4">
              {selectedTickets.map((ticket, i) => (
                <p key={i} className="text-zinc-800">{ticket.count} {ticket.name} ticket{ticket.count > 1 ? 's' : ''}</p>
              ))}
            </div>

            <p className="font-bold text-xl text-zinc-900">Total: KES {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-200 flex justify-end items-center gap-4">
          <button 
            onClick={onClose}
            className="text-[#DA1A21] font-bold uppercase tracking-wide hover:underline mr-2"
          >
            CANCEL
          </button>
          
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="border border-[#DA1A21] text-[#DA1A21] px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-red-50 transition-colors"
            >
              BACK
            </button>
          )}
          <button 
            onClick={() => {
              if (step === 2) {
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
                  toast.error('Please fill all required fields (First Name, Last Name, Email, Phone)');
                  return;
                }
                if (selectedMethod === 'CARDS') {
                  if (!selectedCountry || !formData.state) {
                    toast.error('Please fill all required billing fields (Country, State/County)');
                    return;
                  }
                }
              } else if (step === 3 && selectedMethod === 'CARDS') {
                if (!formData.cardNumber || !formData.cardCvv || !formData.cardExpiry || !formData.cardHolder) {
                  toast.error('Please fill all card details');
                  return;
                }
              } else if (step === 4) {
                const handlePurchase = async () => {
                  try {
                    setIsSubmitting(true);
                    
                    const ticketsPayload = selectedTickets.map(t => ({
                      name: t.name,
                      quantity: t.count,
                      price: event.ticketTiers.find(tier => tier.name === t.name)?.price || 0
                    }));

                    const payload = {
                      eventId: event._id,
                      tickets: ticketsPayload,
                      totalAmount,
                      paymentMethod: selectedMethod,
                      billingInfo: {
                        ...formData,
                        country: selectedCountry?.label
                      }
                    };

                    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
                    if (!token) {
                      toast.error('Please login to purchase tickets');
                      return;
                    }

                    const res = await api.post('/orders', payload, {
                      headers: { Authorization: `Bearer ${token}` }
                    });

                    if (selectedMethod === 'MPESA') {
                      await api.post('/mpesa/stk-push', {
                        orderId: res.data.data._id,
                        phone: formData.phone,
                        amount: totalAmount
                      }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      toast.success('Please check your phone for the M-PESA prompt.');
                    } else {
                      toast.success('Payment confirmed successfully!');
                    }
                    
                    onClose();
                    navigate('/profile');
                  } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to process purchase');
                  } finally {
                    setIsSubmitting(false);
                  }
                };
                
                handlePurchase();
                return;
              }
              if (step < 4) setStep(step + 1);
            }}
            disabled={isSubmitting}
            className="bg-[#DA1A21] text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {step === 4 ? (isSubmitting ? 'PROCESSING...' : 'CONFIRM ORDER') : 'NEXT'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PurchaseModal;
