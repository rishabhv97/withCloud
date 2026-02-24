import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <Shield className="text-brand-green h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>At Kiwi Sqft, we collect information you provide directly to us, including but not limited to your name, email address, phone number, and property details when you create an account, post a listing, or submit an inquiry.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain, and improve our services. Specifically, we use it to connect buyers with sellers, process your inquiries, send you technical notices, and provide customer support.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing of Information</h2>
            <p>If you post a property, certain information (like your name and phone number) may be shared with interested buyers or renters who submit an inquiry. We do not sell your personal data to third-party advertising companies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal data against accidental or unlawful destruction, loss, alteration, or unauthorized disclosure.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;