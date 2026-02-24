import React from 'react';
import { FileText } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <FileText className="text-brand-green h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        </div>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Kiwi Sqft, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. User Responsibilities</h2>
            <p>You agree to provide accurate and truthful information when posting property listings. You are strictly prohibited from posting fake properties, misleading prices, or fraudulent contact information. We reserve the right to remove any listing or suspend any account that violates this rule.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Platform Role</h2>
            <p>Kiwi Sqft acts as an intermediary platform to connect buyers, renters, owners, and brokers. We are not a real estate agency, and we do not participate in the actual transaction or guarantee the accuracy of any listing.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Liability</h2>
            <p>Kiwi Sqft shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our platform or any real estate transactions initiated through our service.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;