import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom'; // ✅ Added for Property Link
import { Search, Filter, Phone, MessageSquare, Calendar, Building, ChevronDown, Loader2, User, ExternalLink } from 'lucide-react';

interface AdminLead {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  message: string;
  status: string;
  created_at: string;
  property_id: string;
  seller_id: string;
  property?: { title: string };
  seller?: { name: string; phone: string; email: string }; // ✅ Added Seller Info
}

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // 1. Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      if (!leadsData || leadsData.length === 0) {
          setLeads([]);
          setLoading(false);
          return;
      }

      // 2. Extract unique property IDs & fetch titles
      const propertyIds = [...new Set(leadsData.map(l => l.property_id).filter(Boolean))];
      let propertiesMap: Record<string, string> = {};
      if (propertyIds.length > 0) {
          const { data: propertiesData } = await supabase
              .from('properties')
              .select('id, title')
              .in('id', propertyIds);
              
          if (propertiesData) {
              propertiesData.forEach(p => { propertiesMap[p.id] = p.title; });
          }
      }

      // 3. ✅ Extract unique seller IDs & fetch profile details
      const sellerIds = [...new Set(leadsData.map(l => l.seller_id).filter(Boolean))];
      let sellersMap: Record<string, any> = {};
      if (sellerIds.length > 0) {
          const { data: sellerData } = await supabase
              .from('profiles')
              .select('id, name, phone, email')
              .in('id', sellerIds);
          
          if (sellerData) {
              sellerData.forEach(s => { sellersMap[s.id] = s; });
          }
      }

      // 4. Combine all data
      const combinedLeads = leadsData.map(lead => ({
          ...lead,
          property: { title: propertiesMap[lead.property_id] || 'Unknown Property' },
          seller: sellersMap[lead.seller_id] || { name: 'Unknown Seller', phone: '', email: '' }
      }));

      setLeads(combinedLeads as any[]);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      toast.error(error?.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Lead marked as ${newStatus}`);
      
      // ✅ FIX: Safely update previous state to ensure UI updates instantly
      setLeads(prevLeads => 
          prevLeads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead)
      );
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error?.message || "Failed to update status. Check Admin permissions.");
    }
  };

  // Filter and Search Logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
        (lead.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (lead.buyer_phone?.includes(searchTerm));
    
    // Treat null/empty status as 'New'
    const currentStatus = lead.status || 'New';
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'closed': return 'bg-green-100 text-green-700 border-green-200';
      case 'lost': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200'; // Default to New colors
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all property inquiries</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search buyer name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-brand-green outline-none"
            />
          </div>

          {/* Filter */}
          <div className="relative min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg w-full appearance-none bg-white focus:ring-2 focus:ring-brand-green outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
              <option value="Lost">Lost</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-brand-green" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Buyer Details</th>
                  <th className="p-4 font-medium">Seller Details</th> {/* ✅ Added Seller Column */}
                  <th className="p-4 font-medium">Property</th>
                  <th className="p-4 font-medium">Message</th>
                  <th className="p-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* 1. Date */}
                    <td className="p-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </td>

                    {/* 2. Buyer Info */}
                    <td className="p-4 align-top">
                      <p className="font-bold text-gray-900 capitalize">{lead.buyer_name || 'Unknown'}</p>
                      <a href={`tel:${lead.buyer_phone}`} className="flex items-center gap-1 text-sm text-brand-green hover:underline mt-1">
                          <Phone size={12} /> {lead.buyer_phone}
                      </a>
                    </td>

                    {/* 3. ✅ Seller Info */}
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900 capitalize">
                          <User size={14} className="text-gray-400" /> {lead.seller?.name || 'Unknown'}
                      </div>
                      {lead.seller?.phone && (
                          <p className="text-sm text-gray-500 mt-1">{lead.seller.phone}</p>
                      )}
                    </td>

                    {/* 4. Property Link */}
                    <td className="p-4 align-top">
                      <Link to={`/property/${lead.property_id}`} className="flex items-start gap-2 group">
                        <Building size={16} className="text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-brand-green transition-colors" />
                        <span className="text-sm font-medium text-gray-700 line-clamp-2 group-hover:text-brand-green group-hover:underline transition-colors flex items-center gap-1">
                            {lead.property?.title || 'Unknown Property'}
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                        </span>
                      </Link>
                    </td>

                    {/* 5. Message */}
                    <td className="p-4 align-top max-w-xs">
                      <div className="flex items-start gap-2">
                        <MessageSquare size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-3" title={lead.message}>
                            {lead.message || 'No message provided.'}
                        </p>
                      </div>
                    </td>

                    {/* 6. Status Dropdown */}
                    <td className="p-4 align-top text-center">
                        <select 
                            value={lead.status || 'New'} 
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-green ${getStatusColor(lead.status || 'New')}`}
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Closed">Closed</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </td>

                  </tr>
                )) : (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                            No leads found matching your criteria.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;