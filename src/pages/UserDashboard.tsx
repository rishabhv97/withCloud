import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { Trash2, MessageSquare, Home, Calendar, Phone, Mail, Loader2, Edit, User, Save, Eye, Clock, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import PropertyCard from '../components/PropertyCard';

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

interface Visitor {
  id: string;
  property_id: string;
  visitor_id: string;
  viewed_at: string;
  property_title?: string;
  visitor?: { name: string; phone: string; email: string };
}

// Property Savers Interface
interface PropertySave {
  id: string;
  property_id: string;
  user_id: string;
  created_at: string;
  property_title?: string;
  user?: { name: string; phone: string; email: string };
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'leads' | 'visitors' | 'saved' | 'profile'>('listings');
  
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [myVisitors, setMyVisitors] = useState<Visitor[]>([]); 
  const [myPropertySavers, setMyPropertySavers] = useState<PropertySave[]>([]); 
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCompany, setProfileCompany] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name || '');
    setProfilePhone(user.phone || '');
    setProfileCompany(user.companyName || '');
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Properties
      const { data: props, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (propError) throw propError;
      
      const mappedProps = (props || []).map(p => ({
          ...p, datePosted: p.created_at, listingType: p.listing_type,
          listedBy: p.listed_by, isFeatured: p.is_featured
      }));
      setMyProperties(mappedProps as any || []);

      // 2. Fetch Leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      const formattedLeads = (leads || []).map((lead: any) => {
        const relatedProperty = props?.find(p => p.id === lead.property_id);
        return { ...lead, property_title: relatedProperty ? relatedProperty.title : 'Unknown Property' };
      });
      setMyLeads(formattedLeads);

      // 3. Fetch Visitors
      const { data: visitorsData } = await supabase
        .from('property_visitors')
        .select('*')
        .eq('seller_id', user?.id)
        .order('viewed_at', { ascending: false });

      let visitorsWithDetails: Visitor[] = [];
      if (visitorsData && visitorsData.length > 0) {
          const visitorIds = [...new Set(visitorsData.map(v => v.visitor_id))];
          const { data: profiles } = await supabase.from('profiles').select('id, name, phone, email').in('id', visitorIds);
          const profilesMap: any = {};
          if (profiles) profiles.forEach(p => profilesMap[p.id] = p);

          visitorsWithDetails = visitorsData.map(v => {
              const relatedProperty = props?.find(p => p.id === v.property_id);
              return {
                  ...v,
                  visitor: profilesMap[v.visitor_id] || { name: 'Unknown User', phone: '', email: '' },
                  property_title: relatedProperty ? relatedProperty.title : 'Unknown Property'
              };
          });
      }
      setMyVisitors(visitorsWithDetails);

      // 4. Fetch "Who Saved My Properties" (High-Intent Leads)
      let savesWithDetails: PropertySave[] = [];
      if (props && props.length > 0) {
          const myPropIds = props.map(p => p.id);
          const { data: savesData } = await supabase
              .from('saved_properties')
              .select('*')
              .in('property_id', myPropIds)
              .order('created_at', { ascending: false });

          if (savesData && savesData.length > 0) {
              const saverIds = [...new Set(savesData.map(s => s.user_id))];
              const { data: saverProfiles } = await supabase.from('profiles').select('id, name, phone, email').in('id', saverIds);
              const saversMap: any = {};
              if (saverProfiles) saverProfiles.forEach(p => saversMap[p.id] = p);

              savesWithDetails = savesData.map(s => {
                  const relatedProperty = props.find(p => p.id === s.property_id);
                  return {
                      ...s,
                      user: saversMap[s.user_id] || { name: 'Unknown User', phone: '', email: '' },
                      property_title: relatedProperty ? relatedProperty.title : 'Unknown Property'
                  };
              });
          }
      }
      setMyPropertySavers(savesWithDetails);

      // 5. Fetch My Saved Properties (Things I Favorited)
      const { data: savedData } = await supabase.from('saved_properties').select('property_id').eq('user_id', user?.id);
      if (savedData && savedData.length > 0) {
        const savedPropIds = savedData.map(s => s.property_id);
        const { data: savedPropsData } = await supabase.from('properties').select('*').in('id', savedPropIds);
        if (savedPropsData) {
            const mappedSavedProps = savedPropsData.map(p => ({
                ...p, datePosted: p.created_at, listingType: p.listing_type,
                listedBy: p.listed_by, isFeatured: p.is_featured
            }));
            setSavedProperties(mappedSavedProps as any[]);
        }
      } else {
        setSavedProperties([]);
      }

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
        const { error } = await supabase.from('profiles').update({
            name: profileName, phone: profilePhone, company_name: profileCompany
        }).eq('id', user.id);
        if (error) throw error;
        toast.success("Profile updated successfully!");
    } catch (err: any) {
        toast.error("Failed to update profile");
    } finally {
        setIsSavingProfile(false);
    }
  };

  const confirmDelete = (property: Property) => {
      setPropertyToDelete(property);
      setIsDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      if (propertyToDelete.images && propertyToDelete.images.length > 0) {
          const filesToRemove = propertyToDelete.images.map(url => {
              if (url.includes('property-images')) return url.split('property-images/')[1];
              return null;
          }).filter(Boolean) as string[];
          if (filesToRemove.length > 0) await supabase.storage.from('property-images').remove(filesToRemove);
      }
      await supabase.from('properties').delete().eq('id', propertyToDelete.id);
      setMyProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      toast.success("Property deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(`Error deleting property: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setPropertyToDelete(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-brand-green font-bold"><Loader2 className="animate-spin mr-2"/> Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <ConfirmationModal 
        isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteProperty}
        title="Delete Property?" message="Are you sure you want to delete this listing?" isLoading={isDeleting}
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
        <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
           <button onClick={() => setActiveTab('listings')} className={`pb-4 px-2 font-bold text-lg transition-all whitespace-nowrap ${activeTab === 'listings' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-400 hover:text-gray-600'}`}>
             My Listings <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-2">{myProperties.length}</span>
           </button>
           <button onClick={() => setActiveTab('leads')} className={`pb-4 px-2 font-bold text-lg transition-all whitespace-nowrap ${activeTab === 'leads' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-400 hover:text-gray-600'}`}>
             Inbox / Leads <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-2">{myLeads.length}</span>
           </button>
           
           {/* Visitors & Saves Tab */}
           <button onClick={() => setActiveTab('visitors')} className={`pb-4 px-2 font-bold text-lg transition-all whitespace-nowrap ${activeTab === 'visitors' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-400 hover:text-gray-600'}`}>
             Visitors & Saves <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs ml-2">{myVisitors.length + myPropertySavers.length}</span>
           </button>
           
           <button onClick={() => setActiveTab('saved')} className={`pb-4 px-2 font-bold text-lg transition-all whitespace-nowrap ${activeTab === 'saved' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-400 hover:text-gray-600'}`}>
             Saved Properties <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs ml-2">{savedProperties.length}</span>
           </button>
           <button onClick={() => setActiveTab('profile')} className={`pb-4 px-2 font-bold text-lg transition-all whitespace-nowrap ${activeTab === 'profile' ? 'text-brand-green border-b-4 border-brand-green' : 'text-gray-400 hover:text-gray-600'}`}>
             My Profile
           </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.length > 0 ? myProperties.map(property => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                 <div className="h-40 overflow-hidden relative">
                    <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=60'} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${property.status === 'Approved' ? 'bg-green-500' : property.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'}`}>{property.status}</div>
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
                    <Link to={`/property/${property.id}`} className="flex-1 text-center py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">View</Link>
                    <Link to={`/edit-property/${property.id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"><Edit size={18} /></Link>
                    <button onClick={() => confirmDelete(property)} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                 </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed">
                 <Home size={40} className="mx-auto text-gray-300 mb-3" />
                 <h3 className="text-lg font-bold text-gray-600">No properties posted yet</h3>
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
                     </div>
                  </div>
                  <div className="md:w-64 flex-shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="text-xs text-gray-500 font-bold uppercase mb-2">Interested In</p>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-brand-green shadow-sm"><Home size={20}/></div>
                        {lead.property_id ? <Link to={`/property/${lead.property_id}`} className="font-bold text-sm text-gray-800 hover:underline line-clamp-2">{lead.property_title}</Link> : <span className="text-sm text-gray-400 italic">Deleted</span>}
                     </div>
                  </div>
               </div>
             )) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                 <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                 <h3 className="text-lg font-bold text-gray-600">No messages yet</h3>
              </div>
             )}
          </div>
        )}

        {/* Combined Visitors & Saves Tab */}
        {activeTab === 'visitors' && (
          <div className="space-y-10">
             
             {/* SECTION 1: People who Saved Properties (High Intent) */}
             <div>
                 <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Heart className="text-red-500" size={24} fill="currentColor" /> 
                     Users Who Saved Your Properties
                 </h2>
                 <div className="space-y-4">
                     {myPropertySavers.length > 0 ? myPropertySavers.map(save => (
                       <div key={`save-${save.id}`} className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col md:flex-row gap-6 items-center">
                          <div className="flex-grow w-full md:w-auto">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Heart size={12} fill="currentColor"/> Property Saved</span>
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                    <Clock size={12}/> {new Date(save.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                </span>
                             </div>
                             <h3 className="font-bold text-lg text-gray-900 mb-1 capitalize">{save.user?.name}</h3>
                             <div className="flex flex-wrap gap-3 mt-3">
                                {save.user?.phone ? (
                                    <a href={`tel:${save.user.phone}`} className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-brand-green bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition">
                                       <Phone size={14} className="text-brand-green"/> {save.user.phone}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No phone linked</span>
                                )}
                             </div>
                          </div>
                          <div className="w-full md:w-72 flex-shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                             <p className="text-xs text-gray-500 font-bold uppercase mb-2">Saved Property</p>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-brand-green shadow-sm"><Home size={20}/></div>
                                {save.property_id ? <Link to={`/property/${save.property_id}`} className="font-bold text-sm text-gray-800 hover:underline line-clamp-2">{save.property_title}</Link> : <span className="text-sm text-gray-400 italic">Deleted</span>}
                             </div>
                          </div>
                       </div>
                     )) : (
                      <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                         <Heart size={32} className="mx-auto text-gray-300 mb-2" />
                         <p className="text-gray-500 font-medium">No one has saved your properties yet.</p>
                      </div>
                     )}
                 </div>
             </div>

             {/* SECTION 2: Profile Views (Browsing Intent) */}
             <div>
                 <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Eye className="text-blue-500" size={24} /> 
                     Recent Profile Views
                 </h2>
                 <div className="space-y-4">
                     {myVisitors.length > 0 ? myVisitors.map(visitor => (
                       <div key={`view-${visitor.id}`} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
                          <div className="flex-grow w-full md:w-auto">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Eye size={12}/> Profile View</span>
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                    <Clock size={12}/> {new Date(visitor.viewed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                </span>
                             </div>
                             <h3 className="font-bold text-lg text-gray-900 mb-1 capitalize">{visitor.visitor?.name}</h3>
                             <div className="flex flex-wrap gap-3 mt-3">
                                {visitor.visitor?.phone ? (
                                    <a href={`tel:${visitor.visitor.phone}`} className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-brand-green bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition">
                                       <Phone size={14} className="text-brand-green"/> {visitor.visitor.phone}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No phone linked</span>
                                )}
                             </div>
                          </div>
                          <div className="w-full md:w-72 flex-shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                             <p className="text-xs text-gray-500 font-bold uppercase mb-2">Viewed Property</p>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-brand-green shadow-sm"><Home size={20}/></div>
                                {visitor.property_id ? <Link to={`/property/${visitor.property_id}`} className="font-bold text-sm text-gray-800 hover:underline line-clamp-2">{visitor.property_title}</Link> : <span className="text-sm text-gray-400 italic">Deleted</span>}
                             </div>
                          </div>
                       </div>
                     )) : (
                      <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                         <Eye size={32} className="mx-auto text-gray-300 mb-2" />
                         <p className="text-gray-500 font-medium">No recent visitors.</p>
                      </div>
                     )}
                 </div>
             </div>

          </div>
        )}

        {/* Saved Properties Tab */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.length > 0 ? savedProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
            )) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed">
                 <Heart size={40} className="mx-auto text-gray-300 mb-3" />
                 <h3 className="text-lg font-bold text-gray-600">No saved properties yet</h3>
                 <p className="text-gray-400">Properties you heart will appear here so you can easily find them later.</p>
                 <Link to="/buy" className="inline-block mt-4 bg-brand-green text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-800 transition">
                    Browse Properties
                 </Link>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-brand-green/10 p-3 rounded-full text-brand-green">
                        <User size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                        <p className="text-sm text-gray-500">Update your personal information.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                            placeholder="Your Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={user?.email}
                                disabled
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed pl-10"
                            />
                            <Mail size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all pl-10"
                                placeholder="+91 9876543210"
                            />
                            <Phone size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Company Name (Optional)</label>
                        <input 
                            type="text" 
                            value={profileCompany}
                            onChange={(e) => setProfileCompany(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                            placeholder="e.g. Dream Homes Realty"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button 
                            onClick={handleUpdateProfile}
                            disabled={isSavingProfile}
                            className="bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-brand-green/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;