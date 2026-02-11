import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, MapPin, Phone, Star, ShieldCheck, Building2, ChevronRight, Mail, Languages, Loader2 } from 'lucide-react';

// Define the interface for the Agent display
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
      // 1. Fetch profiles where role is 'Broker'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Broker');

      if (error) throw error;

      if (data) {
        // 2. Map DB data to UI format
        // Note: We use placeholders for data not yet in the database (like Ratings/Images)
        const mappedAgents: Agent[] = data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown Agent',
          role: 'Real Estate Agent',
          company: u.company_name || 'Independent Consultant',
          // Use a consistent avatar generator based on name
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0D8ABC&color=fff&size=256`, 
          experience: '5+ Years', // Placeholder
          activeListings: Math.floor(Math.random() * 20) + 1, // Mock Data
          soldCount: Math.floor(Math.random() * 50) + 10, // Mock Data
          rating: 4.5 + (Math.random() * 0.5), // Mock Rating (4.5 - 5.0)
          reviewCount: Math.floor(Math.random() * 100) + 10, // Mock Data
          location: 'Noida', // Default
          topAreas: ['Sector 150', 'Sector 137', 'Greater Noida'], // Placeholder
          languages: ['English', 'Hindi'],
          verified: u.is_verified || false,
          email: u.email,
          phone: u.phone || ''
        }));
        setAgents(mappedAgents);
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Filter Logic
  const filteredAgents = agents.filter(agent => {
    const matchesName = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        agent.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For now, location matches loosely since we don't have real location data in DB
    const matchesLocation = locationTerm === '' || 
                            agent.location.toLowerCase().includes(locationTerm.toLowerCase());
    
    return matchesName && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Header */}
      <div className="bg-brand-green pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
           <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Find An Agent</h1>
           <p className="text-brand-lightGreen text-center mb-8 max-w-2xl mx-auto">
             Connect with verified experts who can help you navigate the real estate market.
           </p>

           <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-transparent focus-within:border-brand-green focus-within:bg-white transition-colors">
                 <Search className="text-gray-400 mr-2" size={20} />
                 <input 
                    type="text" 
                    placeholder="Search agent name..." 
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

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
         <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-8 text-sm text-gray-600 justify-center md:justify-start">
            <div><span className="font-bold text-gray-900">{agents.length}</span> Agents Found</div>
            <div><span className="font-bold text-gray-900">{agents.reduce((acc, curr) => acc + curr.soldCount, 0)}+</span> Properties Sold</div>
            <div><span className="font-bold text-gray-900">Verified</span> Professionals</div>
         </div>
      </div>

      {/* Agent List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
         {loading ? (
            <div className="flex justify-center py-20 text-brand-green">
                <Loader2 className="animate-spin w-10 h-10" />
            </div>
         ) : filteredAgents.length > 0 ? (
           <div className="grid grid-cols-1 gap-6">
             {filteredAgents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow p-6 flex flex-col md:flex-row gap-6">
                   
                   {/* Left: Image & Basics */}
                   <div className="flex-shrink-0 flex flex-col items-center md:items-start md:w-48">
                      <div className="relative mb-3">
                         <img 
                          src={agent.image} 
                          alt={agent.name} 
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                         />
                         {agent.verified && (
                            <div className="absolute bottom-1 right-1 bg-brand-green text-white p-1 rounded-full border-2 border-white" title="Verified Agent">
                               <ShieldCheck size={14} />
                            </div>
                         )}
                      </div>
                      <div className="text-center md:text-left">
                         <h3 className="font-bold text-lg text-gray-900">{agent.name}</h3>
                         <p className="text-sm text-gray-500 mb-1">{agent.role}</p>
                         <p className="text-xs font-semibold text-brand-brown bg-brand-brown/5 px-2 py-0.5 rounded-full inline-block max-w-full truncate">
                           {agent.company}
                         </p>
                      </div>
                   </div>

                   {/* Middle: Stats & Bio */}
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

                   {/* Right: Actions */}
                   <div className="flex flex-col gap-3 justify-center md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <a href={`tel:${agent.phone}`} className="w-full bg-brand-green text-white font-bold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                         <Phone size={18} /> Call Agent
                      </a>
                      <a href={`mailto:${agent.email}`} className="w-full bg-white text-gray-700 border border-gray-300 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                         <Mail size={18} /> Email
                      </a>
                      <button className="w-full text-brand-brown text-sm font-bold hover:underline flex items-center justify-center gap-1 mt-2">
                         View Profile <ChevronRight size={16} />
                      </button>
                   </div>

                </div>
             ))}
           </div>
         ) : (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Building2 className="text-gray-400" size={30} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No agents found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search criteria or invite agents to join.</p>
              <button 
                onClick={() => {setSearchTerm(''); setLocationTerm('');}}
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