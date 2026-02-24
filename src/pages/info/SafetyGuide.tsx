import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const SafetyGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <ShieldAlert className="text-amber-500 h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900">Safety Guide & Scam Prevention</h1>
        </div>
        
        <p className="text-gray-600 mb-8 text-lg">Your safety is our priority. Please read these guidelines carefully before making any financial transactions.</p>

        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
            <h3 className="text-red-800 font-bold text-lg flex items-center gap-2 mb-3">
              <AlertTriangle size={20} /> Red Flags to Watch Out For
            </h3>
            <ul className="space-y-3 text-red-700">
              <li>• The owner/agent asks for a token amount or deposit before showing the property.</li>
              <li>• The property price is unbelievably low for the area.</li>
              <li>• The seller claims to be out of the country and asks you to send money via wire transfer.</li>
              <li>• They refuse to meet in person or show you the inside of the property.</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-100 p-6 rounded-xl">
            <h3 className="text-green-800 font-bold text-lg flex items-center gap-2 mb-3">
              <CheckCircle2 size={20} /> Best Practices for Buyers & Renters
            </h3>
            <ul className="space-y-3 text-green-700">
              <li>• Always visit the property in person before paying any money.</li>
              <li>• Verify the identity of the seller or the broker's RERA registration number.</li>
              <li>• Ask to see the original property documents (Title Deed, Latest Electricity Bill, Society NOC).</li>
              <li>• Pay via bank transfer or cheque rather than cash to maintain a legal record.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyGuide;