import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { Trash2, MessageSquare, Home, Calendar, Phone, Mail, Loader2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal'; // <--- Import Modal

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

  // --- Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: props, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (propError) throw propError;
      setMyProperties(props as any || []);

      const { data: leads, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (leadError) throw leadError;

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
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // 1. Open Modal instead of confirm()
  const confirmDelete = (property: Property) => {
      setPropertyToDelete(property);
      setIsDeleteModalOpen(true);
  };

  // 2. Actual Delete Logic
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);

    try {
      // Delete Images
      if (propertyToDelete.images && propertyToDelete.images.length > 0) {
          const filesToRemove = propertyToDelete.images.map(url => {
              if (url.includes('property-images')) {
                 return url.split('property-images/')[1];
              }
              return null;
          }).filter(Boolean) as string[];

          if (filesToRemove.length > 0) {
              await supabase.storage.from('property-images').remove(filesToRemove);
          }
      }

      // Delete Record
      const { error } = await supabase.from('properties').delete().eq('id', propertyToDelete.id);
      
      if (error) throw error;
      
      setMyProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      toast.success("Property deleted successfully");
      setIsDeleteModalOpen(false);

    } catch (err: any) {
      toast.error(`Error deleting property: ${err.message}`);
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setPropertyToDelete(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-brand-green font-bold"><Loader2 className="animate-spin mr-2"/> Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      
      {/* --- ADD MODAL HERE --- */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProperty}
        title="Delete Property?"
        message="Are you sure you want to delete this listing? This action cannot be undone and all associated images will be removed."
        isLoading={isDeleting}
      />

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

        {/* Listings Tab */}
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
                    <Link 
                        to={`/edit-property/${property.id}`} 
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                        title="Edit Property"
                    >
                       <Edit size={18} />
                    </Link>
                    <button 
                        onClick={() => confirmDelete(property)} 
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

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
             {myLeads.length > 0 ? myLeads.map(lead => (
               <div key={lead.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
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