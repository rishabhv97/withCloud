import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { TrendingUp, Users, CheckCircle, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [propertyStats, setPropertyStats] = useState({ total: 0, active: 0, pending: 0, soldValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Property Stats
        const { data: props } = await supabase.from('properties').select('status, price');
        if (props) {
            setPropertyStats({
                total: props.length,
                active: props.filter(p => p.status === 'Approved').length,
                pending: props.filter(p => p.status === 'Pending').length,
                soldValue: props.filter(p => p.status === 'Sold').reduce((acc, curr) => acc + (curr.price || 0), 0)
            });
        }

        // 2. Fetch Leads Count
        const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        setTotalLeads(leadsCount || 0);

        // 3. Fetch Users Count
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        setTotalUsers(usersCount || 0);

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} L`;
    return `₹ ${val.toLocaleString()}`;
  };

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {subtext && <p className="text-xs text-gray-400 flex items-center gap-1">{subtext}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Properties" 
          value={loading ? "..." : propertyStats.total} 
          subtext={`${propertyStats.pending} Pending Review`} 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Listings" 
          value={loading ? "..." : propertyStats.active} 
          subtext="Live on website" 
          icon={CheckCircle} 
          color="bg-brand-green" 
        />
        <StatCard 
          title="Total Leads" 
          value={loading ? "..." : totalLeads} 
          subtext="Buyer Enquiries" 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Est. Revenue" 
          value={loading ? "..." : formatCurrency(propertyStats.soldValue * 0.01)} 
          subtext="1% of Sold Volume" 
          icon={DollarSign} 
          color="bg-brand-brown" 
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
             <AlertCircle size={18} className="text-orange-500" /> Pending Actions
           </h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                 <span className="text-sm font-medium text-orange-800">{propertyStats.pending} Properties need approval</span>
                 <Link to="/admin/properties" className="text-xs font-bold bg-white text-orange-600 px-3 py-1 rounded border border-orange-200">Review</Link>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                 <span className="text-sm font-medium text-blue-800">{totalUsers} Registered Users</span>
                 <Link to="/admin/people" className="text-xs font-bold bg-white text-blue-600 px-3 py-1 rounded border border-blue-200">Manage</Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;