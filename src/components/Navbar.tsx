import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Menu, X, UserCircle, LogOut, ShieldCheck, UserPlus, LogIn, Plus } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Ref for the navbar to detect clicks outside
  const navRef = useRef<HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const performLogout = async () => {
    await signOut();
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  // --- 1. Close Menu on Route Change (Link Click) ---
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // --- 2. Close Menu on Click Outside OR Scroll (With Safety Delay) ---
  useEffect(() => {
    let scrollTimer: any = null;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Wait 200ms before listening to scroll to prevent accidental closing
      scrollTimer = setTimeout(() => {
        window.addEventListener('scroll', handleScroll);
      }, 200);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [isOpen]);

  return (
    <>
      <ConfirmationModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={performLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Yes, Logout"
      />

      <nav ref={navRef} className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-brand-green p-2 rounded-lg shadow-sm group-hover:bg-emerald-800 transition-colors">
                   <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-brand-green tracking-tight">
                  Kiwi <span className="text-brand-brown">Sqft</span>
                </span>
              </Link>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex ml-10 space-x-1">
                {[
                  { path: '/', label: 'Home' },
                  { path: '/buy', label: 'Buy' },
                  { path: '/rent', label: 'Rent' },
                  { path: '/sell', label: 'Sell' },
                  { path: '/find-agent', label: 'Find Agent' },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive(link.path) 
                        ? 'bg-brand-green/10 text-brand-green font-bold' // ✅ FIXED: Green Text + Light Green BG
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-green'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                // LOGGED IN STATE
                <>
                  <Link to="/post-property" className="relative group mr-2">
                    <div className="absolute -top-3 left-0 right-0 mx-auto w-fit animate-bounce">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm tracking-wide uppercase">
                            Free
                        </span>
                        <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-red-500 mx-auto"></div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-brand-green text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <Plus size={16} strokeWidth={3} />
                        Post Property
                    </div>
                  </Link>

                  {user.role === 'Admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors border border-purple-100">
                      <ShieldCheck size={18} />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                      <Link to="/dashboard" className="text-sm font-bold text-gray-700 hover:text-brand-green transition-colors flex items-center gap-2">
                         <UserCircle size={20} className="text-gray-400"/>
                         Hi, {user.name.split(' ')[0]}
                      </Link>
                      <button 
                          onClick={() => setIsLogoutModalOpen(true)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                          title="Logout"
                      >
                          <LogOut size={20} />
                      </button>
                  </div>
                </>
              ) : (
                // LOGGED OUT STATE
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:text-brand-green transition-all"
                  >
                    <LogIn size={18} />
                    Login
                  </Link>
                  
                  <Link 
                    to="/signup" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green text-white font-bold hover:bg-emerald-800 hover:shadow-lg hover:shadow-brand-green/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <UserPlus size={18} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-xl">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-green hover:bg-gray-50">Home</Link>
              <Link to="/buy" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-green hover:bg-gray-50">Buy</Link>
              <Link to="/rent" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-green hover:bg-gray-50">Rent</Link>
              <Link to="/sell" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-green hover:bg-gray-50">Sell</Link>
              <Link to="/find-agent" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-green hover:bg-gray-50">Find Agent</Link>

              <div className="border-t border-gray-100 my-2 pt-2">
                  {user ? (
                      <>
                           <Link to="/post-property" className="block px-3 py-2 rounded-md text-base font-bold text-white bg-brand-green hover:bg-emerald-800 mb-2 flex items-center justify-between">
                              <span>+ Post Property</span>
                              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Free</span>
                           </Link>

                           <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                              My Dashboard
                           </Link>
                           {user.role === 'Admin' && (
                              <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50">Admin Dashboard</Link>
                          )}
                          <button 
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                          >
                              Logout ({user.name})
                          </button>
                      </>
                  ) : (
                      <div className="grid grid-cols-2 gap-2 px-2 mt-2">
                          <Link to="/login" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50">
                              Login
                          </Link>
                          <Link to="/signup" className="flex items-center justify-center px-4 py-2 bg-brand-green text-white rounded-lg font-bold hover:bg-emerald-800">
                              Sign Up
                          </Link>
                      </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;