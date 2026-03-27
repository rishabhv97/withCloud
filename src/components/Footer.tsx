import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    // Changed bg-white to bg-brand-green and text to white/emerald-100
    <footer className="bg-brand-green text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Kiwi Sqft</span>
            </Link>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Kiwi Sq.ft is the housing super app — an ecosystem of products and services designed to provide a seamless, end-to-end transaction experience for renters, shoppers, buyers and sellers, as well as the real estate professionals who serve them. Founded to empower people with information so they can find the right home
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm text-emerald-100">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/buy" className="hover:text-white transition-colors">Buy Property</Link></li>
              <li><Link to="/rent" className="hover:text-white transition-colors">Rent Property</Link></li>
              <li><Link to="/sell" className="hover:text-white transition-colors">List Your Property</Link></li>
              <li><Link to="/find-agent" className="hover:text-white transition-colors">Find an Agent</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-3 text-sm text-emerald-100">
              {/* Added link to your new Support page */}
              <li><Link to="/support" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/safety" className="hover:text-white transition-colors">Safety Guide</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact Us</h3>
            <ul className="space-y-4 text-sm text-emerald-100">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-white flex-shrink-0 mt-0.5" />
                <span>B-704, Tower-B, ATS Bouquet,<br />Sector-132, Noida-201301</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-white flex-shrink-0" />
                <span>+91 9205974843</span> 
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-white flex-shrink-0" />
                <span>support@kiwisqfeet.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider (Light transparent white) */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-emerald-100">
          <p>© 2026 Kiwi Sqft. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-emerald-200/60 flex items-center justify-center gap-1">
          Made with <Heart size={12} className="text-red-400 fill-red-400" /> in India
        </div>

      </div>
    </footer>
  );
};

export default Footer;