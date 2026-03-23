import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Home, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'; // Changed PenTool to Home

const SellLanding: React.FC = () => {
  return (
    // 1. Changed bg-gray-50 to bg-brand-green
    <div className="min-h-screen bg-brand-green flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">

        <div className="text-center mb-12">
          {/* Updated text color to white for better contrast on green bg */}
          <h1 className="text-4xl font-bold text-white mb-4">How would you like to sell?</h1>
          <p className="text-lg text-emerald-100">Choose the method that suits you best. Get expert help or do it yourself.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Option 1: Find an Agent */}
          <Link to="/find-agent" className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-emerald-400 transition-all duration-300 flex flex-col items-center text-center">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-green">
              <ArrowRight size={24} />
            </div>

            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserCheck size={40} className="text-blue-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sell with an Expert</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Explore agents by local market expertise, specialties and verified reviews to find the perfect match. Already have an agent? See how we can help you get in front of the most buyers to maximize your sale
            </p>

            <div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
              <ShieldCheck size={16} /> Verified Agents
            </div>
          </Link>

          {/* Option 2: Post Yourself */}
          <Link to="/post-property" className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-emerald-400 transition-all duration-300 flex flex-col items-center text-center">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-green">
              <ArrowRight size={24} />
            </div>

            {/* 2. Changed Icon from PenTool to Home */}
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Home size={40} className="text-brand-green" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">List it Yourself</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Reach more potential buyers with a For Sale By Owner listing.
              Manage everything, from home prep to negotiations.
              Keep 100% of the proceeds.
            </p>

            <div className="mt-auto flex items-center gap-2 text-sm font-bold text-brand-green bg-green-50 px-4 py-2 rounded-full">
              <Sparkles size={16} /> Free Listing
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default SellLanding;