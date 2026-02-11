import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, PieChart, Settings, LogOut, Menu, X, ShieldCheck, Home } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Properties & Verify', path: '/admin/properties', icon: Building2 },
    { name: 'User Management', path: '/admin/people', icon: Users },
    { name: 'Leads & CRM', path: '/admin/leads', icon: PieChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-brand-green p-1.5 rounded text-white">
                <ShieldCheck size={20} />
            </div>
            <span>Kiwi Admin</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-1">Master Control Panel</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-brand-green text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-800">
           <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white text-sm font-medium">
             <Home size={18} /> Back to Website
           </Link>
           <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 text-sm font-medium w-full text-left">
             <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
         <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-800 capitalize">
                {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-brown text-white flex items-center justify-center font-bold text-xs">
                        AD
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">Super Admin</span>
                </div>
            </div>
         </header>
         <div className="p-6 lg:p-8">
            <Outlet />
         </div>
      </main>
    </div>
  );
};

export default AdminLayout;