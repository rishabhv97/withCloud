import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Property, PropertyType, ConstructionStatus, FurnishedStatus, ListedBy, Facing, ParkingType, OwnershipType, ViewType } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Filter, Search, X, SlidersHorizontal, MapPin, Loader2, RotateCcw, ChevronDown, ChevronUp, Calculator } from 'lucide-react';

interface ListingsProps {
  type: 'sale' | 'rent';
}

const Listings: React.FC<ListingsProps> = ({ type }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000]); 
  
  // Basic
  const [propertyType, setPropertyType] = useState<PropertyType | 'All'>('All');
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [balconies, setBalconies] = useState<number | null>(null);
  
  // Advanced Selects
  const [constructionStatus, setConstructionStatus] = useState<ConstructionStatus | 'All'>('All');
  const [furnishedStatus, setFurnishedStatus] = useState<FurnishedStatus | 'All'>('All');
  const [listedBy, setListedBy] = useState<ListedBy | 'All'>('All');
  const [ownership, setOwnership] = useState<OwnershipType | 'All'>('All');
  const [facing, setFacing] = useState<Facing | 'All'>('All'); // Entry
  const [exitFacing, setExitFacing] = useState<Facing | 'All'>('All'); // Exit
  const [parking, setParking] = useState<ParkingType | 'All'>('All');
  
  // Ranges & Categories
  const [floorRange, setFloorRange] = useState<string>('All'); // "0-5", "5-10" etc.
  const [buildingHeight, setBuildingHeight] = useState<string>('All'); // "Low", "Mid", "High"
  
  // Area Inputs
  const [minCarpet, setMinCarpet] = useState<string>('');
  const [minBuiltUp, setMinBuiltUp] = useState<string>('');
  const [minSuper, setMinSuper] = useState<string>('');

  // Multi-Select Arrays
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Booleans
  const [onlyRera, setOnlyRera] = useState(false);
  const [onlyInclusive, setOnlyInclusive] = useState(false);
  const [onlyNegotiable, setOnlyNegotiable] = useState(false);
  const [onlyTaxExcluded, setOnlyTaxExcluded] = useState(false);

  // UI Toggles for Collapsible Sections
  const [sections, setSections] = useState({
      propertyType: true,
      rooms: true,
      area: true,
      floor: false,
      vaastu: false,
      documents: false,
      amenities: false,
      price: true,
      advanced: false
  });

  const toggleSection = (sec: keyof typeof sections) => {
      setSections(prev => ({...prev, [sec]: !prev[sec]}));
  };

  // --- OPTIONS CONSTANTS ---
  const roomOptions = ['Pooja Room', 'Study Room', 'Servant Room', 'Store Room'];
  const docOptions = ['Sale Deed / Ownership Title', 'Occupancy Certificate (OC)', 'Completion Certificate (CC)', 'RERA Registration', 'Possession Letter'];
  const amenityOptions = ['Club House', 'Swimming Pool', 'Kids Play Area', 'Lift', 'Power Backup', 'Gym', 'Vaastu Compliant', 'Security Personnel', 'Gas Pipeline', 'Park'];
  const floorOptions = [
      { label: 'Ground - 5th Floor', val: '0-5' },
      { label: '5th - 10th Floor', val: '5-10' },
      { label: '10th - 15th Floor', val: '10-15' },
      { label: '15th - 20th Floor', val: '15-20' },
      { label: '20th - 25th Floor', val: '20-25' },
      { label: 'Above 25th Floor', val: '25-100' }
  ];

  // --- FETCH & FILTER ---
  useEffect(() => {
    fetchProperties();
  }, [type, searchParams, bedrooms, bathrooms, balconies, propertyType, constructionStatus, 
      furnishedStatus, listedBy, priceRange, ownership, facing, exitFacing, parking,
      floorRange, buildingHeight, minCarpet, minBuiltUp, minSuper,
      selectedRooms, selectedDocs, selectedAmenities,
      onlyRera, onlyInclusive, onlyNegotiable, onlyTaxExcluded
  ]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'Approved')
        .eq('listing_type', type);

      // 1. Search
      const search = searchParams.get('search');
      if (search) {
        query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,city.ilike.%${search}%`);
      }

      // 2. Exact Matches
      if (propertyType !== 'All') query = query.eq('type', propertyType);
      if (bedrooms) query = query.eq('bedrooms', bedrooms);
      if (bathrooms) query = query.eq('bathrooms', bathrooms);
      if (balconies !== null) query = query.eq('balconies', balconies);
      
      // 3. Dropdown Filters
      if (constructionStatus !== 'All') query = query.eq('construction_status', constructionStatus);
      if (furnishedStatus !== 'All') query = query.eq('furnished_status', furnishedStatus);
      if (listedBy !== 'All') query = query.eq('listed_by', listedBy);
      if (ownership !== 'All') query = query.eq('ownership_type', ownership);
      if (facing !== 'All') query = query.eq('facing_entry', facing);
      if (exitFacing !== 'All') query = query.eq('facing_exit', exitFacing);
      if (parking !== 'All') query = query.eq('parking_type', parking);

      // 4. Area Filters
      if (minCarpet) query = query.gte('carpet_area', parseFloat(minCarpet));
      if (minBuiltUp) query = query.gte('built_up_area', parseFloat(minBuiltUp));
      if (minSuper) query = query.gte('super_built_up_area', parseFloat(minSuper));

      // 5. Floor Range
      if (floorRange !== 'All') {
          const [minF, maxF] = floorRange.split('-').map(Number);
          query = query.gte('floor_no', minF).lte('floor_no', maxF);
      }

      // 6. Building Height (Total Floors)
      if (buildingHeight === 'Low Rise') query = query.lte('total_floors', 4);
      if (buildingHeight === 'Mid Rise') query = query.gt('total_floors', 4).lte('total_floors', 12);
      if (buildingHeight === 'High Rise') query = query.gt('total_floors', 12);

      // 7. Arrays (Contains)
      if (selectedRooms.length > 0) query = query.contains('additional_rooms', selectedRooms);
      if (selectedDocs.length > 0) query = query.contains('available_documents', selectedDocs);
      if (selectedAmenities.length > 0) query = query.contains('amenities', selectedAmenities);

      // 8. Booleans
      if (onlyRera) query = query.eq('rera_approved', true);
      if (onlyInclusive) query = query.eq('is_all_inclusive_price', true);
      if (onlyNegotiable) query = query.eq('price_negotiable', true);
      if (onlyTaxExcluded) query = query.eq('is_tax_excluded', true);

      // 9. Price
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const mapped: Property[] = data.map((p: any) => ({
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
          exitFacing: p.facing_exit,
          parkingType: p.parking_type,
          floor: p.floor_no,
          totalFloors: p.total_floors,
          parkingSpaces: p.parking_spaces,
          views: p.views || [],
          documents: p.available_documents || [],
          reraApproved: p.rera_approved,
          allInclusivePrice: p.is_all_inclusive_price,
          priceNegotiable: p.price_negotiable,
          taxExcluded: p.is_tax_excluded
        }));
        setProperties(mapped);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchTerm });
  };

  const resetFilters = () => {
      setBedrooms(null); setBathrooms(null); setBalconies(null);
      setPropertyType('All'); setConstructionStatus('All'); setFurnishedStatus('All');
      setListedBy('All'); setOwnership('All'); setFacing('All'); setExitFacing('All'); setParking('All');
      setFloorRange('All'); setBuildingHeight('All');
      setMinCarpet(''); setMinBuiltUp(''); setMinSuper('');
      setSelectedRooms([]); setSelectedDocs([]); setSelectedAmenities([]);
      setOnlyRera(false); setOnlyInclusive(false); setOnlyNegotiable(false); setOnlyTaxExcluded(false);
      setPriceRange([0, 1000000000]);
      setSearchTerm(''); setSearchParams({});
  };

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
      setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="bg-stone-50 min-h-screen pt-4 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Toggle */}
        <div className="lg:hidden mb-4 flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="flex-1 bg-white p-3 rounded-lg shadow-sm flex items-center justify-center gap-2 font-bold text-gray-700 border border-gray-200">
            <Filter size={18} /> Filters
          </button>
          <div className="flex-1 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
             <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input type="text" placeholder="Search..." className="w-full outline-none px-2 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button type="submit"><Search size={18} className="text-gray-400" /></button>
             </form>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* --- SIDEBAR FILTERS (SCROLLABLE) --- */}
          <div className={`lg:w-[320px] flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[85vh] sticky top-24 overflow-y-auto custom-scrollbar flex flex-col">
              
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><SlidersHorizontal size={18} className="text-brand-green"/> Filters</h3>
                <button onClick={resetFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1"><RotateCcw size={12}/> Reset</button>
              </div>

              <div className="p-5 space-y-6">
                
                {/* Location */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Location</label>
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input type="text" placeholder="Sector, City..." className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-green outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </form>
                </div>

                {/* Property Type */}
                <div className="border-b border-gray-100 pb-4">
                    <button onClick={() => toggleSection('propertyType')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-2">
                        Property Type {sections.propertyType ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.propertyType && (
                        <div className="space-y-1">
                            {['All', 'Apartment', 'Villa', '1 RK/Studio', 'House', 'Residential Land', 'Penthouse', 'Builder Floor'].map(t => (
                                <label key={t} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition">
                                    <input type="radio" name="ptype" checked={propertyType === t} onChange={() => setPropertyType(t as any)} className="accent-brand-green"/>
                                    <span className="text-sm text-gray-600">{t}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rooms & Config */}
                <div className="border-b border-gray-100 pb-4">
                    <button onClick={() => toggleSection('rooms')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-3">
                        BHK & Config {sections.rooms ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.rooms && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Bedrooms</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setBedrooms(bedrooms === n ? null : n)} className={`w-8 h-8 rounded border text-xs font-bold ${bedrooms === n ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-600'}`}>{n}{n===5?'+':''}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Bathrooms</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {[1, 2, 3, 4].map(n => (
                                        <button key={n} onClick={() => setBathrooms(bathrooms === n ? null : n)} className={`w-8 h-8 rounded border text-xs font-bold ${bathrooms === n ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-600'}`}>{n}{n===4?'+':''}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Balconies</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {[0, 1, 2, 3, 4].map(n => (
                                        <button key={n} onClick={() => setBalconies(balconies === n ? null : n)} className={`w-8 h-8 rounded border text-xs font-bold ${balconies === n ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-600'}`}>{n}{n===4?'+':''}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Other Rooms</p>
                                <div className="space-y-1">
                                    {roomOptions.map(r => (
                                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={selectedRooms.includes(r)} onChange={() => toggleArrayItem(setSelectedRooms, r)} className="accent-brand-green rounded"/>
                                            <span className="text-xs text-gray-600">{r}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Floor & Height */}
                <div className="border-b border-gray-100 pb-4">
                    <button onClick={() => toggleSection('floor')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-3">
                        Floor & Height {sections.floor ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.floor && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Floor Preference</p>
                                <select className="w-full p-2 border rounded-lg text-xs bg-gray-50" value={floorRange} onChange={(e) => setFloorRange(e.target.value)}>
                                    <option value="All">Any Floor</option>
                                    {floorOptions.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Building Height</p>
                                <div className="flex gap-2">
                                    {['All', 'Low Rise', 'Mid Rise', 'High Rise'].map(h => (
                                        <button key={h} onClick={() => setBuildingHeight(h)} className={`flex-1 py-1.5 border rounded text-[10px] font-bold ${buildingHeight === h ? 'bg-gray-800 text-white' : 'text-gray-600'}`}>{h.split(' ')[0]}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Area Calculator & Filter */}
                <div className="border-b border-gray-100 pb-4">
                    <button onClick={() => toggleSection('area')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-3">
                        Area (sq.ft) {sections.area ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.area && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" placeholder="Min Carpet" className="w-full p-2 text-xs border rounded bg-gray-50" value={minCarpet} onChange={e => setMinCarpet(e.target.value)} />
                                <input type="number" placeholder="Min Built-up" className="w-full p-2 text-xs border rounded bg-gray-50" value={minBuiltUp} onChange={e => setMinBuiltUp(e.target.value)} />
                            </div>
                            <input type="number" placeholder="Min Super Built-up" className="w-full p-2 text-xs border rounded bg-gray-50" value={minSuper} onChange={e => setMinSuper(e.target.value)} />
                            
                            {/* Price/Sqft Estimator Preview */}
                            {(minSuper && priceRange[1] < 1000000000) && (
                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 flex items-start gap-2">
                                    <Calculator size={14} className="mt-0.5"/>
                                    <div>
                                        <span className="font-bold">Est. Price/Sqft:</span> <br/>
                                        ₹ {Math.round(priceRange[0] / parseFloat(minSuper))} - ₹ {Math.round(priceRange[1] / parseFloat(minSuper))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Price & Budget */}
                <div className="border-b border-gray-100 pb-4">
                    <button onClick={() => toggleSection('price')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-3">
                        Price & Budget {sections.price ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.price && (
                        <div className="space-y-3">
                            <select className="w-full p-2 border rounded-lg text-xs bg-gray-50" onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}>
                                <option value="1000000000">Any Budget</option>
                                <option value="5000000">Under ₹50 Lakh</option>
                                <option value="10000000">Under ₹1 Cr</option>
                                <option value="20000000">Under ₹2 Cr</option>
                                <option value="50000000">Under ₹5 Cr</option>
                            </select>
                            
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={onlyInclusive} onChange={() => setOnlyInclusive(!onlyInclusive)} className="accent-brand-green"/> <span className="text-xs text-gray-600">All Inclusive Price</span></label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={onlyNegotiable} onChange={() => setOnlyNegotiable(!onlyNegotiable)} className="accent-brand-green"/> <span className="text-xs text-gray-600">Price Negotiable</span></label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={onlyTaxExcluded} onChange={() => setOnlyTaxExcluded(!onlyTaxExcluded)} className="accent-brand-green"/> <span className="text-xs text-gray-600">Tax Excluded</span></label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vaastu & Facing */}
                <div className="border-b border-gray-100 pb-4">
                    <button onClick={() => toggleSection('vaastu')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-3">
                        Vaastu & Facing {sections.vaastu ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.vaastu && (
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Entry Facing</p>
                                <select className="w-full p-2 border rounded text-xs" value={facing} onChange={(e) => setFacing(e.target.value as any)}>
                                    <option value="All">Any</option>
                                    <option value="North-East">North-East (Best)</option>
                                    <option value="East">East</option>
                                    <option value="North">North</option>
                                    <option value="West">West</option>
                                    <option value="South">South</option>
                                </select>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Exit Facing</p>
                                <select className="w-full p-2 border rounded text-xs" value={exitFacing} onChange={(e) => setExitFacing(e.target.value as any)}>
                                    <option value="All">Any</option>
                                    <option value="South-East">South-East</option>
                                    <option value="South">South</option>
                                    <option value="West">West</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Documents */}
                <div className="border-b border-gray-100 pb-4">
                    <button onClick={() => toggleSection('documents')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-3">
                        Verified Docs {sections.documents ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.documents && (
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 mb-2 font-bold text-xs"><input type="checkbox" checked={onlyRera} onChange={() => setOnlyRera(!onlyRera)} className="accent-blue-600"/> <span className="text-blue-700">RERA Approved Only</span></label>
                            {docOptions.map(d => (
                                <label key={d} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedDocs.includes(d)} onChange={() => toggleArrayItem(setSelectedDocs, d)} className="accent-brand-green"/>
                                    <span className="text-xs text-gray-600">{d}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Amenities */}
                <div>
                    <button onClick={() => toggleSection('amenities')} className="flex justify-between w-full text-sm font-bold text-gray-800 mb-3">
                        Amenities {sections.amenities ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {sections.amenities && (
                        <div className="grid grid-cols-2 gap-2">
                            {amenityOptions.map(a => (
                                <label key={a} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => toggleArrayItem(setSelectedAmenities, a)} className="accent-brand-green"/>
                                    <span className="text-xs text-gray-600">{a}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

              </div>
            </div>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {type === 'sale' ? 'Properties for Sale' : 'Properties for Rent'}
                <span className="text-gray-400 text-lg font-normal ml-2">({properties.length})</span>
              </h1>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                 {[1,2,3,4].map(n => <div key={n} className="h-96 bg-gray-100 animate-pulse rounded-2xl"></div>)}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">No Properties Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
                <button onClick={resetFilters} className="mt-4 text-brand-green font-bold hover:underline">Clear all filters</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Listings;