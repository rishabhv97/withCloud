import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Menu, X, UserCircle, LogOut, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-green/10 p-2 rounded-lg group-hover:bg-brand-green/20 transition-colors">
                 <Home className="h-6 w-6 text-brand-green" />
              </div>
              <span className="text-2xl font-bold text-brand-green tracking-tight">Kiwi Sqft</span>
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
                      ? 'bg-brand-green text-white shadow-md shadow-brand-green/20' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-brand-green'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions (Login/Signup/Profile) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              // LOGGED IN STATE
              <>
                {user.role === 'Admin' && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors border border-purple-100">
                    <ShieldCheck size={18} />
                    <span>Admin</span>
                  </Link>
                )}
                
                <div className="flex items-center gap-3 pl-2 border-l border-gray-200 ml-2">
                    <span className="text-sm font-semibold text-gray-700">Hi, {user.name.split(' ')[0]}</span>
                    <button 
                        onClick={handleLogout}
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
            
            <div className="border-t border-gray-100 my-2 pt-2">
                {user ? (
                    <>
                         {user.role === 'Admin' && (
                            <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50">Admin Dashboard</Link>
                        )}
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
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
  );
};

export default Navbar;