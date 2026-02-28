import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Phone, Mail, MapPin, Building2, Star, ShieldCheck, Loader2, ArrowLeft, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

interface AgentDetails {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  phone: string;
  email: string;
  verified: boolean;
}

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the agent ID from the URL
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAgentData();
  }, [id]);

  const fetchAgentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Agent Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setAgent({
          id: profileData.id,
          name: profileData.name || profileData.full_name || 'Verified Professional',
          role: profileData.role || 'Real Estate Agent',
          company: profileData.company_name || 'Independent Consultant',
          image: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=0D8ABC&color=fff&size=256`,
          phone: profileData.phone || '',
          email: profileData.email || '',
          verified: profileData.is_verified !== false // Defaults to true visually if undefined
        });
      }

      // 2. Fetch Agent's Active Properties
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', id)
        .eq('status', 'Approved') // Only show approved public listings
        .order('created_at', { ascending: false });

      if (propsError) throw propsError;

      if (propsData) {
         // Map database snake_case to frontend camelCase
         const mappedProps = propsData.map(p => ({
            ...p,
            datePosted: p.created_at,
            listingType: p.listing_type,
            listedBy: p.listed_by,
            isFeatured: p.is_featured
         }));
         setProperties(mappedProps as any[]);
      }

    } catch (error) {
      console.error("Error fetching agent profile:", error);
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-green w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Loading Profile...</h2>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-center">
        <Building2 className="text-gray-300 w-20 h-20 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Found</h2>
        <p className="text-gray-500 mb-6">The profile you are looking for does not exist or has been removed.</p>
        <Link to="/find-agent" className="bg-brand-green text-white px-6 py-3 rounded-lg font-bold">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Top Banner & Back Button */}
      <div className="bg-brand-green pt-8 pb-32 px-4 relative">
         <div className="max-w-6xl mx-auto">
            <Link to="/find-agent" className="inline-flex items-center gap-2 text-brand-lightGreen hover:text-white font-medium transition-colors mb-6">
                <ArrowLeft size={20} /> Back to Directory
            </Link>
         </div>
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
         
         {/* Agent ID Card */}
         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-10 flex flex-col md:flex-row gap-8 items-center md:items-start border border-gray-100">
            <div className="relative flex-shrink-0">
               <img src={agent.image} alt={agent.name} className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg" />
               {agent.verified && (
                  <div className="absolute bottom-2 right-2 bg-brand-green text-white p-2 rounded-full border-4 border-white shadow-sm" title="Verified Professional">
                     <ShieldCheck size={20} />
                  </div>
               )}
            </div>

            <div className="flex-grow text-center md:text-left">
               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 capitalize">{agent.name}</h1>
               <p className="text-lg text-gray-600 font-medium mb-3 flex items-center justify-center md:justify-start gap-2">
                   <Briefcase size={18} className="text-brand-brown" /> {agent.role}
               </p>
               <div className="inline-block bg-brand-brown/10 text-brand-brown font-bold px-4 py-1.5 rounded-full text-sm mb-6 capitalize">
                  {agent.company}
               </div>

               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  {agent.phone && (
                     <a href={`tel:${agent.phone}`} className="flex items-center gap-2 bg-brand-green text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-800 transition-colors shadow-md shadow-brand-green/20">
                        <Phone size={18} /> {agent.phone}
                     </a>
                  )}
                  {agent.email && (
                     <a href={`mailto:${agent.email}`} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <Mail size={18} /> Email Me
                     </a>
                  )}
               </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                </div>
                <p className="font-bold text-gray-900 text-lg">5.0 / 5.0</p>
                <p className="text-sm text-gray-500">Top Rated Seller</p>
            </div>
         </div>

         {/* Agent's Properties Section */}
         <div className="mb-8 flex items-center justify-between">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Active Listings</h2>
               <p className="text-gray-500 mt-1">Properties currently managed by {agent.name.split(' ')[0]}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg font-bold text-gray-700 border border-gray-200 shadow-sm">
                {properties.length} Properties
            </div>
         </div>

         {properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
               ))}
            </div>
         ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
               <Building2 className="mx-auto text-gray-300 w-16 h-16 mb-4" />
               <h3 className="text-xl font-bold text-gray-900 mb-2">No active listings</h3>
               <p className="text-gray-500">This professional currently has no properties listed on the market.</p>
            </div>
         )}

      </div>
    </div>
  );
};

export default AgentProfile;