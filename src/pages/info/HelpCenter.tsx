import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter: React.FC = () => {
  const faqs = [
    {
      q: "How do I list my property?",
      a: "Simply create an account, click on the 'Sell' or 'Post Property' button in the navigation bar, and fill in your property details. It's completely free for owners!"
    },
    {
      q: "How can I contact a seller?",
      a: "Go to any property details page and click the 'Send Enquiry' button. The seller will receive your details and contact you directly."
    },
    {
      q: "Is there any brokerage fee?",
      a: "If the property is listed by an 'Owner', there is usually zero brokerage. If listed by an 'Agent', the brokerage fee will be clearly mentioned on the property page."
    },
    {
      q: "How do I edit my property listing?",
      a: "Go to your 'Dashboard', find the property you want to edit, and click the 'Edit' button. You can update price, description, and images anytime."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <HelpCircle className="text-brand-green h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900">Help Center & FAQ</h1>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-brand-lightGreen p-6 rounded-xl text-center border border-brand-green/20">
            <h3 className="font-bold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">Our support team is always ready to assist you.</p>
            <Link to="/support" className="inline-block bg-brand-green text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-800 transition">
                Contact Support
            </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;