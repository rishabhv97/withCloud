import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { Trash2, MessageSquare, Home, Calendar, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';

interface Lead {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  message: string;
  created_at: string;
  property_id: string;
  property_title?: string; 
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'leads'>('listings');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch My Properties
      const { data: props, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (propError) throw propError;
      setMyProperties(props as any || []);

      // 2. Fetch My Leads
      const { data: leads, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (leadError) throw leadError;

      // 3. Map Property Titles to Leads
      const formattedLeads = (leads || []).map((lead: any) => {
        const relatedProperty = props?.find(p => p.id === lead.property_id);
        return {
          ...lead,
          property_title: relatedProperty ? relatedProperty.title : 'Unknown Property'
        };
      });

      setMyLeads(formattedLeads);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    if (!confirm("Are you sure you want to delete this property? This cannot be undone.")) return;

    try {
      // 1. Delete Images from Storage (Optional, but good for cleanup)
      if (property.images && property.images.length > 0) {
          const filesToRemove = property.images.map(url => {
              const path = url.split('property-images/')[1]; // Extract path after bucket name
              return path;
          }).filter(Boolean);

          if (filesToRemove.length > 0) {
              await supabase.storage.from('property-images').remove(filesToRemove);
          }
      }

      // 2. Delete Record from Database
      // Note: Leads will be auto-deleted if you ran the SQL CASCADE command.
      const { error } = await supabase.from('properties').delete().eq('id', property.id);
      
      if (error) throw error;
      
      // 3. Update UI
      setMyProperties(prev => prev.filter(p => p.id !== property.id));
      alert("Property deleted successfully.");

    } catch (err: any) {
      alert(`Error deleting property: ${err.message}`);
      console.error("Delete error:", err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-brand-green font-bold"><Loader2 className="animate-spin mr-2"/> Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
             <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <Link to="/sell" className="bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 transition shadow-lg shadow-brand-green/20">
             + Post New Property
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-8">
           <button 
             onClick={() => setActiveTab('listings')}
             className={`pb-4 px-2 font-bold text-lg transition-all ${activeTab === 'listings' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-400 hover:text-gray-600'}`}
           >
             My Listings <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-2">{myProperties.length}</span>
           </button>
           <button 
             onClick={() => setActiveTab('leads')}
             className={`pb-4 px-2 font-bold text-lg transition-all ${activeTab === 'leads' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Inbox / Leads <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-2">{myLeads.length}</span>
           </button>
        </div>

        {/* --- LISTINGS TAB --- */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.length > 0 ? myProperties.map(property => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                 <div className="h-40 overflow-hidden relative">
                    <img 
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=60'} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${property.status === 'Approved' ? 'bg-green-500' : property.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {property.status}
                    </div>
                 </div>
                 <div className="p-5 flex-grow">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{property.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 truncate">{property.location}</p>
                    <div className="flex items-center justify-between text-sm font-bold">
                       <span className="text-brand-green">₹ {(property.price / 100000).toFixed(1)} L</span>
                       <span className="text-gray-400">{new Date(property.datePosted).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                    <Link to={`/property/${property.id}`} className="flex-1 text-center py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
                       View
                    </Link>
                    <button 
                        onClick={() => handleDeleteProperty(property)} 
                        className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                        title="Delete Property"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed">
                 <Home size={40} className="mx-auto text-gray-300 mb-3" />
                 <h3 className="text-lg font-bold text-gray-600">No properties posted yet</h3>
                 <p className="text-gray-400">Post your first property to start getting leads!</p>
              </div>
            )}
          </div>
        )}

        {/* --- LEADS TAB --- */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
             {myLeads.length > 0 ? myLeads.map(lead => (
               <div key={lead.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                  {/* Left: Lead Info */}
                  <div className="flex-grow">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">New Enquiry</span>
                        <span className="text-gray-400 text-sm flex items-center gap-1"><Calendar size={12}/> {new Date(lead.created_at).toLocaleDateString()}</span>
                     </div>
                     <h3 className="font-bold text-lg text-gray-900 mb-1">{lead.buyer_name}</h3>
                     <p className="text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{lead.message}"</p>
                     
                     <div className="flex flex-wrap gap-4">
                        <a href={`tel:${lead.buyer_phone}`} className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-brand-green bg-gray-100 px-3 py-2 rounded-lg hover:bg-green-50 transition">
                           <Phone size={16} className="text-brand-green"/> {lead.buyer_phone}
                        </a>
                        {lead.buyer_email && (
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                             <Mail size={16} className="text-brand-green"/> {lead.buyer_email}
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Right: Property Context */}
                  <div className="md:w-64 flex-shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-xs text-gray-500 font-bold uppercase mb-2">Interested In</p>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-brand-green shadow-sm"><Home size={20}/></div>
                        {lead.property_id ? (
                            <Link to={`/property/${lead.property_id}`} className="font-bold text-sm text-gray-800 hover:underline line-clamp-2">
                                {lead.property_title}
                            </Link>
                        ) : (
                            <span className="text-sm text-gray-400 italic">Property Deleted</span>
                        )}
                     </div>
                  </div>
               </div>
             )) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                 <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                 <h3 className="text-lg font-bold text-gray-600">No messages yet</h3>
                 <p className="text-gray-400">Wait for buyers to contact you.</p>
              </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;