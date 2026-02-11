import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, TrendingUp, ChevronRight, UserCheck, Phone, ShieldCheck, Home as HomeIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types';
import { supabase } from '../supabaseClient';

interface LocalityStats {
  name: string;
  count: number;
  avgPrice: number;
  image: string;
}

interface SellerProfile {
  id: string;
  name: string;
  role: string;
  image?: string;
  experience: string;
  propertiesCount: number;
  localities: string[];
}

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'sell'>('buy');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data States
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [localities, setLocalities] = useState<LocalityStats[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Featured Properties (Limit 8)
        const { data: featData } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'Approved')
          .order('is_featured', { ascending: false }) // Featured first
          .order('created_at', { ascending: false })  // Then newest
          .limit(8);

        if (featData) {
           const mappedFeatured: Property[] = featData.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              price: p.price,
              location: p.location,
              city: p.city,
              type: p.type,
              listingType: p.listing_type,
              images: p.images || [], 
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              balconies: p.balconies,
              area: p.area, 
              carpetArea: p.carpet_area,
              builtUpArea: p.built_up_area,
              superBuiltUpArea: p.super_built_up_area,
              amenities: p.amenities || [],
              ownerContact: p.owner_contact,
              datePosted: p.created_at,
              isFeatured: p.is_featured,
              status: p.status,
              ownerId: p.owner_id,
              furnishedStatus: p.furnished_status,
              constructionStatus: p.construction_status,
              listedBy: p.listed_by,
              ownershipType: p.ownership_type,
              facing: p.facing_entry,
              parkingType: p.parking_type,
              floor: p.floor_no,
              totalFloors: p.total_floors,
              parkingSpaces: p.parking_spaces,
              views: p.views || [],
              documents: p.available_documents || []
           }));
           setFeaturedProperties(mappedFeatured);
        }

        // 2. Fetch Sellers
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['Seller', 'Broker', 'Agent'])
          .limit(6);

        if (sellerData) {
          const formattedSellers = sellerData.map((profile) => ({
            id: profile.id,
            name: profile.name || profile.full_name || 'Verified Seller',
            role: profile.role,
            image: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.name}&background=0D8ABC&color=fff`,
            experience: `${Math.floor(Math.random() * 15) + 2} Yrs`, 
            propertiesCount: Math.floor(Math.random() * 50) + 5,
            localities: ['Noida', 'Greater Noida']
          }));
          setSellers(formattedSellers);
        }

        // 3. Calculate Popular Localities
        const { data: allProps } = await supabase
          .from('properties')
          .select('location, price, images');

        if (allProps && allProps.length > 0) {
          const locMap = allProps.reduce((acc: any, curr: any) => {
            const loc = curr.location || 'Unknown';
            if (!acc[loc]) {
              const img = (curr.images && curr.images.length > 0) ? curr.images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';
              acc[loc] = { count: 0, totalPrice: 0, image: img };
            }
            acc[loc].count += 1;
            acc[loc].totalPrice += curr.price;
            return acc;
          }, {});

          const derivedLocalities = Object.keys(locMap).map(key => ({
            name: key,
            count: locMap[key].count,
            avgPrice: Math.round(locMap[key].totalPrice / locMap[key].count),
            image: locMap[key].image
          })).sort((a, b) => b.count - a.count).slice(0, 8);

          setLocalities(derivedLocalities);
        } else {
            setLocalities([
                { name: 'Sector 150', count: 0, avgPrice: 12000, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80' },
                { name: 'Greater Noida', count: 0, avgPrice: 8500, image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80' },
            ]);
        }

      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'sell') {
        navigate('/sell');
    } else {
        navigate(`/${activeTab}?search=${searchTerm}`);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative pt-12 pb-32 md:pb-48 px-4 rounded-b-[30px] md:rounded-b-[50px] shadow-2xl overflow-hidden bg-brand-green">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Real Estate" className="w-full h-full object-cover blur-[3px] scale-105"/>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/90 via-emerald-900/80 to-brand-brown/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left">
          <div className="flex flex-col md:items-start items-center">
            <h1 className="text-white text-2xl md:text-4xl font-semibold mb-2 drop-shadow-md">
              Properties to {activeTab === 'rent' ? 'rent' : (activeTab === 'sell' ? 'sell' : 'buy')} in <span className="font-bold">Noida</span>
            </h1>
            <p className="text-brand-lightGreen/90 text-sm md:text-base mb-6 font-medium drop-shadow-sm">
              Verified listings • 50k+ added daily
            </p>
            <div className="w-full">
              <div className="grid grid-cols-3 gap-2 mb-0 pb-2 md:pb-0 w-full">
                {['buy', 'rent', 'sell'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)}
                    className={`py-3 rounded-t-lg md:rounded-lg text-sm md:text-base font-medium transition-all capitalize flex justify-center items-center ${activeTab === tab ? 'bg-white text-brand-green shadow-lg transform -translate-y-1 z-10 font-bold' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="relative group z-20">
                <div className="bg-white p-2 rounded-2xl md:rounded-xl shadow-2xl flex items-center h-16 md:h-20 transition-transform group-hover:scale-[1.01]">
                   <div className="hidden md:flex items-center justify-center w-16 text-gray-400 border-r border-gray-100"><Search size={24} /></div>
                   <input type="text" placeholder={activeTab === 'sell' ? "Enter location to post property..." : "Search 'Sector 62', '3BHK'..."}
                    className="flex-grow bg-transparent px-4 md:px-6 text-gray-800 placeholder-gray-400 text-lg outline-none w-full"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                   <button type="submit" className="bg-brand-brown hover:bg-amber-900 text-white h-12 md:h-16 px-6 md:px-10 rounded-xl md:rounded-lg font-bold text-lg shadow-lg shadow-brand-brown/20 transition-all flex items-center justify-center gap-2">
                     <Search size={22} className="md:hidden" /><span className="hidden md:inline">{activeTab === 'sell' ? 'Post' : 'Search'}</span>
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Box */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 md:-mt-32 relative z-20">
         <div className="relative rounded-3xl p-8 md:p-12 text-center shadow-xl flex flex-col items-center border border-white/20 overflow-hidden bg-gray-900 group">
            <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
              <img src="https://images.unsplash.com/photo-1600596542815-3ad19eb6a269?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80" alt="Background" className="w-full h-full object-cover blur-[3px] brightness-[0.5]"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
            </div>
            <div className="relative z-10 w-full flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">Sell your property <br className="hidden xs:block" /> or <span className="underline decoration-white/40 underline-offset-4">Get Expert Help</span></h2>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
                <Link to="/sell" className="bg-white text-brand-green text-lg font-bold px-10 py-4 rounded-xl shadow-lg hover:bg-gray-50 transition-all">Post Property</Link>
                <Link to="/find-agent" className="bg-white/10 backdrop-blur-md text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg border border-white/30 hover:bg-white/20 transition-all">Find An Agent</Link>
              </div>
            </div>
         </div>
      </div>

      {/* Popular Localities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-2">
             <TrendingUp size={24} className="text-brand-green" />
             <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular Localities</h2>
          </div>
          <Link to="/buy" className="hidden sm:flex items-center gap-2 text-brand-green font-bold hover:gap-3 transition-all">See All <ArrowRight size={20} /></Link>
        </div>
        <div className="flex overflow-x-auto pb-6 gap-5 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {localities.map((loc) => (
            <div key={loc.name} onClick={() => navigate(`/buy?search=${loc.name}`)} className="min-w-[200px] sm:min-w-[240px] flex-shrink-0 snap-start bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="relative h-32 md:h-40 overflow-hidden">
                <img src={loc.image} alt={loc.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold text-lg">{loc.name}</div>
              </div>
              <div className="p-4">
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Avg ~{formatPrice(loc.avgPrice)}</span>
                 </div>
                 <p className="text-sm font-medium text-gray-900">{loc.count}+ Properties</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-2">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 mt-1">Handpicked projects for you</p>
          </div>
          <Link to="/buy" className="hidden sm:flex items-center gap-2 text-brand-green font-bold hover:gap-3 transition-all">See All <ArrowRight size={20} /></Link>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(n => <div key={n} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>)}
           </div>
        ) : featuredProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProperties.slice(0, visibleCount).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
            {visibleCount < featuredProperties.length && (
                <div className="flex justify-center mt-8">
                    <button onClick={() => setVisibleCount(prev => prev + 4)} className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-brand-green transition-all shadow-sm">
                      Show More Properties
                    </button>
                </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">
            No properties found. <Link to="/sell" className="text-brand-green font-bold">Post one now!</Link>
          </div>
        )}
      </div>

      {/* Recommended Sellers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8">
        <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">Recommended Sellers</h2></div>
        <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {sellers.map((seller) => (
             <div key={seller.id} className="min-w-[85vw] sm:min-w-[300px] bg-white rounded-xl border border-gray-200 p-5 snap-center hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                   <img src={seller.image} alt={seller.name} className="w-14 h-14 rounded-lg object-cover border border-gray-100" />
                   <div>
                      <h3 className="font-bold text-lg text-gray-900">{seller.name}</h3>
                      <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-1">Verified {seller.role}</div>
                   </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-5 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                   <div><span className="font-bold text-gray-900">{seller.experience}</span> Exp</div>
                   <div className="h-4 w-px bg-gray-300"></div>
                   <div><span className="font-bold text-gray-900">{seller.propertiesCount}</span> Properties</div>
                </div>
                <button className="w-full py-3 rounded-lg border-2 border-brand-green text-brand-green font-bold hover:bg-brand-green hover:text-white transition-all">Show Contact</button>
             </div>
          ))}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex justify-center items-center gap-3 py-10 pb-12 bg-white/50 border-t border-gray-100">
        <span className="text-xl font-medium text-gray-900">Part of</span>
        <div className="bg-[#E4002B] rounded-full p-1.5 w-9 h-9 flex items-center justify-center shadow-sm"><HomeIcon className="text-white w-5 h-5" strokeWidth={3} /></div>
        <span className="text-xl font-bold text-gray-900">REA Group</span>
      </div>
    </div>
  );
};

export default Home;