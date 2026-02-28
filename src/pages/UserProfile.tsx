import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Phone, Mail, Building2, Star, ShieldCheck, Loader2, ArrowLeft, Briefcase, Calendar, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserDetails {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  phone: string;
  email: string;
  verified: boolean;
  joinedDate: string;
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const [profile, setProfile] = useState<UserDetails | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          id: profileData.id,
          name: profileData.name || profileData.full_name || 'Platform User',
          role: profileData.role || 'Buyer',
          company: profileData.company_name || '',
          image: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=0D8ABC&color=fff&size=256`,
          phone: profileData.phone || '',
          email: profileData.email || '',
          verified: profileData.is_verified !== false, 
          joinedDate: profileData.created_at || new Date().toISOString()
        });
      }

      // 2. If they are a Seller/Broker/Agent, fetch their active properties
      if (profileData && ['Seller', 'Broker', 'Agent'].includes(profileData.role)) {
          const { data: propsData, error: propsError } = await supabase
            .from('properties')
            .select('*')
            .eq('owner_id', id)
            .eq('status', 'Approved') 
            .order('created_at', { ascending: false });

          if (!propsError && propsData) {
             const mappedProps = propsData.map(p => ({
                ...p,
                datePosted: p.created_at,
                listingType: p.listing_type,
                listedBy: p.listed_by,
                isFeatured: p.is_featured
             }));
             setProperties(mappedProps as any[]);
          }
      }

    } catch (error) {
      console.error("Error fetching user profile:", error);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-center">
        <UserIcon className="text-gray-300 w-20 h-20 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
        <p className="text-gray-500 mb-6">The profile you are looking for does not exist or has been removed.</p>
        <Link to="/" className="bg-brand-green text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-800 transition">Go to Homepage</Link>
      </div>
    );
  }

  const isProfessional = ['Seller', 'Broker', 'Agent'].includes(profile.role);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Top Banner & Back Button */}
      <div className="bg-brand-green pt-8 pb-32 px-4 relative">
         <div className="max-w-6xl mx-auto relative z-10">
            <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-brand-lightGreen hover:text-white font-medium transition-colors mb-6">
                <ArrowLeft size={20} /> Go Back
            </button>
         </div>
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
         
         {/* Profile ID Card */}
         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-10 flex flex-col md:flex-row gap-8 items-center md:items-start border border-gray-100">
            <div className="relative flex-shrink-0">
               <img src={profile.image} alt={profile.name} className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100" />
               {profile.verified && (
                  <div className="absolute bottom-2 right-2 bg-brand-green text-white p-2 rounded-full border-4 border-white shadow-sm" title="Verified User">
                     <ShieldCheck size={20} />
                  </div>
               )}
            </div>

            <div className="flex-grow text-center md:text-left">
               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 capitalize">{profile.name}</h1>
               
               <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 mb-4">
                   <p className="text-lg text-gray-600 font-medium flex items-center justify-center md:justify-start gap-2">
                       <Briefcase size={18} className="text-brand-brown" /> {profile.role}
                   </p>
                   <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                       <Calendar size={16} /> Joined {new Date(profile.joinedDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                   </p>
               </div>

               {profile.company && (
                   <div className="inline-block bg-brand-brown/10 text-brand-brown font-bold px-4 py-1.5 rounded-full text-sm mb-6 capitalize">
                      {profile.company}
                   </div>
               )}

               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                  {profile.phone && (
                     <a href={`tel:${profile.phone}`} className="flex items-center gap-2 bg-brand-green text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-800 transition-colors shadow-md shadow-brand-green/20">
                        <Phone size={18} /> {profile.phone}
                     </a>
                  )}
                  {profile.email && (
                     <a href={`mailto:${profile.email}`} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <Mail size={18} /> Email Contact
                     </a>
                  )}
               </div>
            </div>

            {isProfessional && (
                <div className="w-full md:w-auto flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1 mb-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={24} />
                        <Star className="text-yellow-400 fill-yellow-400" size={24} />
                        <Star className="text-yellow-400 fill-yellow-400" size={24} />
                        <Star className="text-yellow-400 fill-yellow-400" size={24} />
                        <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    </div>
                    <p className="font-bold text-gray-900 text-lg">5.0 / 5.0</p>
                    <p className="text-sm text-gray-500">Top Rated {profile.role}</p>
                </div>
            )}
         </div>

         {/* Property Listings (Only show if they are a professional) */}
         {isProfessional && (
             <>
                 <div className="mb-8 flex items-center justify-between">
                    <div>
                       <h2 className="text-2xl font-bold text-gray-900">Active Listings</h2>
                       <p className="text-gray-500 mt-1">Properties currently managed by {profile.name.split(' ')[0]}</p>
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
             </>
         )}

      </div>
    </div>
  );
};

export default UserProfile;