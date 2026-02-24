import React from 'react';
import { Info } from 'lucide-react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <Info className="text-brand-green h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
        </div>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What are cookies?</h2>
            <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How we use cookies</h2>
            <p>At Kiwi Sqft, we use cookies primarily for <strong>Authentication and Security</strong>. When you log in, our secure backend (Supabase) uses cookies to keep your session active so you do not have to log in every time you visit a new page.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Managing Cookies</h2>
            <p>You can set your browser to refuse all or some browser cookies. However, if you disable or refuse cookies, please note that some parts of this website (like logging into your dashboard or posting properties) may become inaccessible or not function properly.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;