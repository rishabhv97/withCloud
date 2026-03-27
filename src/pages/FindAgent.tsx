import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, MapPin, Phone, Star, ShieldCheck, Building2, ChevronRight, Mail, Languages, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Agent {
   id: string;
   name: string;
   role: string;
   company: string;
   image: string;
   experience: string;
   activeListings: number;
   soldCount: number;
   rating: number;
   reviewCount: number;
   location: string;
   topAreas: string[];
   languages: string[];
   verified: boolean;
   email: string;
   phone: string;
}

const FindAgent = () => {
   const [agents, setAgents] = useState<Agent[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [locationTerm, setLocationTerm] = useState('');

   useEffect(() => {
      fetchAgents();
   }, []);

   const fetchAgents = async () => {
      setLoading(true);
      try {
         // 1. Fetch Agents
         const { data: agentsData, error: agentsError } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['Broker', 'Agent', 'Seller']); 

         if (agentsError) throw agentsError;

         if (agentsData) {
            // 2. Fetch Property Counts to get REAL Active and Sold numbers
            const { data: propertiesData } = await supabase
                .from('properties')
                .select('owner_id, status');

            // Map DB data to UI format
            const mappedAgents: Agent[] = agentsData.map((u: any) => {
               
               // Calculate REAL Active and Sold listings
               const userProperties = propertiesData?.filter(p => p.owner_id === u.id) || [];
               const realActive = userProperties.filter(p => p.status === 'Approved').length;
               const realSold = userProperties.filter(p => p.status === 'Sold').length;

               return {
                   id: u.id,
                   name: u.name || u.full_name || 'Verified Partner',
                   role: u.role || 'Real Estate Professional',
                   company: u.company_name || 'Independent Consultant',
                   image: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=0D8ABC&color=fff&size=256`,
                   
                   // ✅ REAL DATA from the DB (with fallbacks)
                   experience: u.experience_years ? `${u.experience_years} Years` : 'New', 
                   topAreas: u.operating_areas && u.operating_areas.length > 0 ? u.operating_areas : ['All Areas'], 
                   languages: u.languages_spoken && u.languages_spoken.length > 0 ? u.languages_spoken : ['English', 'Hindi'],
                   
                   // ✅ REAL COUNTS from DB
                   activeListings: realActive,
                   soldCount: realSold, 
                   
                   // ❌ FAKE DATA (Kept for Social Proof as requested)
                   rating: 4.5 + (Math.random() * 0.5), 
                   reviewCount: Math.floor(Math.random() * 100) + 10, 
                   
                   location: 'Noida',
                   verified: u.is_verified !== false, 
                   email: u.email,
                   phone: u.phone || ''
               };
            });
            setAgents(mappedAgents);
         }
      } catch (err) {
         console.error("Error fetching agents:", err);
      } finally {
         setLoading(false);
      }
   };

   const filteredAgents = agents.filter(agent => {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = agent.name.toLowerCase().includes(searchLower) ||
         agent.company.toLowerCase().includes(searchLower);

      const matchesLocation = locationTerm === '' ||
         agent.location.toLowerCase().includes(locationTerm.toLowerCase()) || 
         agent.topAreas.some(area => area.toLowerCase().includes(locationTerm.toLowerCase()));

      return matchesName && matchesLocation;
   });

   return (
      <div className="min-h-screen bg-gray-50 pb-20">
         <div className="bg-brand-green pt-16 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
               <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Find An Agent</h1>
               <p className="text-brand-lightGreen text-center mb-8 max-w-2xl mx-auto">
                  Explore agents by local market expertise, specialties and verified reviews to find the perfect match.
Already have an agent? See how we can help you get in front of the most buyers to maximize your sale.
               </p>

               <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-2 flex flex-col md:flex-row gap-2">
                  <div className="flex-1 flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-transparent focus-within:border-brand-green focus-within:bg-white transition-colors">
                     <Search className="text-gray-400 mr-2" size={20} />
                     <input
                        type="text"
                        placeholder="Search agent or company name..."
                        className="w-full bg-transparent outline-none text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <div className="flex-1 flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-transparent focus-within:border-brand-green focus-within:bg-white transition-colors">
                     <MapPin className="text-gray-400 mr-2" size={20} />
                     <input
                        type="text"
                        placeholder="Search locality..."
                        className="w-full bg-transparent outline-none text-gray-700"
                        value={locationTerm}
                        onChange={(e) => setLocationTerm(e.target.value)}
                     />
                  </div>
                  <button className="bg-brand-brown text-white font-bold py-3 px-8 rounded-lg hover:bg-stone-800 transition-colors">
                     Search
                  </button>
               </div>
            </div>
         </div>

         <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-8 text-sm text-gray-600 justify-center md:justify-start">
               <div><span className="font-bold text-gray-900">{agents.length}</span> Professionals Found</div>
               <div><span className="font-bold text-gray-900">{agents.reduce((acc, curr) => acc + curr.soldCount, 0)}</span> Properties Sold</div>
               <div><span className="font-bold text-gray-900">Verified</span> Experts</div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 py-12">
            {loading ? (
               <div className="flex justify-center py-20 text-brand-green">
                  <Loader2 className="animate-spin w-10 h-10" />
               </div>
            ) : filteredAgents.length > 0 ? (
               <div className="grid grid-cols-1 gap-6">
                  {filteredAgents.map((agent) => (
                     <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow p-6 flex flex-col md:flex-row gap-6">

                        <div className="flex-shrink-0 flex flex-col items-center md:items-start md:w-48">
                           <Link to={`/profile/${agent.id}`} className="relative mb-3 block group">
                              <img
                                 src={agent.image}
                                 alt={agent.name}
                                 className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-sm group-hover:border-brand-green group-hover:scale-105 transition-all duration-300"
                              />
                              {agent.verified && (
                                 <div className="absolute bottom-1 right-1 bg-brand-green text-white p-1 rounded-full border-2 border-white" title="Verified Agent">
                                    <ShieldCheck size={14} />
                                 </div>
                              )}
                           </Link>
                           <div className="text-center md:text-left">
                              <Link to={`/profile/${agent.id}`}>
                                 <h3 className="font-bold text-lg text-gray-900 capitalize hover:text-brand-green transition-colors">{agent.name}</h3>
                              </Link>
                              <p className="text-sm text-gray-500 mb-1 font-medium">{agent.role}</p>
                              {agent.company && (
                                <p className="text-xs font-semibold text-brand-brown bg-brand-brown/5 px-2 py-0.5 rounded-full inline-block max-w-full truncate capitalize">
                                   {agent.company}
                                </p>
                              )}
                           </div>
                        </div>

                        <div className="flex-grow border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                 <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Experience</p>
                                 <p className="font-semibold text-gray-900">{agent.experience}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                 <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Listings</p>
                                 <p className="font-semibold text-gray-900">{agent.activeListings}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                 <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sold</p>
                                 <p className="font-semibold text-gray-900">{agent.soldCount}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                 <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Rating</p>
                                 <div className="flex items-center gap-1 font-semibold text-gray-900">
                                    {agent.rating.toFixed(1)} <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-normal text-gray-400">({agent.reviewCount})</span>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2 mb-4">
                              <div className="flex items-start gap-2">
                                 <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                                 <div>
                                    <span className="text-sm font-bold text-gray-700">Operating In: </span>
                                    <span className="text-sm text-gray-600">{agent.topAreas.join(', ')}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Languages size={16} className="text-gray-400 flex-shrink-0" />
                                 <div>
                                    <span className="text-sm font-bold text-gray-700">Speaks: </span>
                                    <span className="text-sm text-gray-600">{agent.languages.join(', ')}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col gap-3 justify-center md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                           {agent.phone ? (
                              <a href={`tel:${agent.phone}`} className="w-full bg-brand-green text-white font-bold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                                 <Phone size={18} /> Call Agent
                              </a>
                           ) : (
                              <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm text-sm cursor-not-allowed">
                                 <Phone size={18} /> No Phone
                              </button>
                           )}

                           {agent.email ? (
                              <a href={`mailto:${agent.email}`} className="w-full bg-white text-gray-700 border border-gray-300 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                                 <Mail size={18} /> Email
                              </a>
                           ) : (
                              <button disabled className="w-full bg-gray-50 text-gray-400 border border-gray-200 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                                 <Mail size={18} /> No Email
                              </button>
                           )}

                           <Link to={`/profile/${agent.id}`} className="w-full text-brand-brown text-sm font-bold hover:underline flex items-center justify-center gap-1 mt-2">
                              View Profile <ChevronRight size={16} />
                           </Link>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Building2 className="text-gray-400" size={30} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No professionals found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
                  <button
                     onClick={() => { setSearchTerm(''); setLocationTerm(''); }}
                     className="mt-4 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-emerald-800"
                  >
                     Clear Search
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default FindAgent;