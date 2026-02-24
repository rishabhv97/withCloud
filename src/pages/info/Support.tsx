import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Support: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        toast.success("Message sent! Our team will get back to you within 24 hours.");
        setLoading(false);
        (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <div className="bg-brand-green text-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="opacity-90 mb-12 text-lg">Have questions about a property or need help with your account? We are here to help.</p>
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full"><Phone size={24} /></div>
                    <div>
                        <p className="text-sm opacity-70">Call Us</p>
                        <p className="font-bold text-lg">+91 98765 43210</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full"><Mail size={24} /></div>
                    <div>
                        <p className="text-sm opacity-70">Email Us</p>
                        <p className="font-bold text-lg">support@kiwisqft.com</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full"><MapPin size={24} /></div>
                    <div>
                        <p className="text-sm opacity-70">Office</p>
                        <p className="font-bold text-lg">Noida, Uttar Pradesh, India</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input required type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none bg-white">
                        <option>General Enquiry</option>
                        <option>Account Issue</option>
                        <option>Report a Listing</option>
                        <option>Feedback</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                    <textarea required rows={4} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-brand-brown text-white font-bold py-3 rounded-lg hover:bg-yellow-900 transition flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Send Message</>}
                </button>
            </form>
        </div>
        
      </div>
    </div>
  );
};

export default Support;