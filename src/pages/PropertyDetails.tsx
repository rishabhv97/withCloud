import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext'; 
import { Property } from '../types';
import toast from 'react-hot-toast';
import { 
  MapPin, BedDouble, Bath, Maximize, ArrowLeft, Phone, Mail, 
  ShieldCheck, CheckCircle2, User, X, Loader2, Home, Layers, 
  Compass, Calendar, Car, FileText, Info, Camera, Edit, Film 
} from 'lucide-react';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeImage, setActiveImage] = useState<string>('');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', message: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          let contactNumber = data.owner_contact;
          let contactEmail = null;
          let contactName = null; 
          
          if (data.owner_id) {
              const { data: profileData } = await supabase
                  .from('profiles')
                  .select('phone, email, name')
                  .eq('id', data.owner_id)
                  .single();
              
              if (profileData) {
                  if (!contactNumber && profileData.phone) {
                      contactNumber = profileData.phone;
                  }
                  contactEmail = profileData.email;
                  contactName = profileData.name; 
              }
          }

          const mappedProperty: Property = {
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            location: data.location,
            city: data.city,
            type: data.type,
            listingType: data.listing_type,
            images: data.images && data.images.length > 0 
              ? data.images 
              : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'],
            videoUrl: data.video_url, 
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            balconies: data.balconies,
            area: data.area, 
            carpetArea: data.carpet_area,
            builtUpArea: data.built_up_area,
            superBuiltUpArea: data.super_built_up_area,
            amenities: data.amenities || [],
            ownerContact: contactNumber || null, 
            ownerEmail: contactEmail || null, 
            ownerName: contactName || null, 
            datePosted: data.created_at,
            isFeatured: data.is_featured,
            status: data.status,
            ownerId: data.owner_id,
            constructionStatus: data.construction_status,
            furnishedStatus: data.furnished_status,
            listedBy: data.listed_by,
            ownershipType: data.ownership_type,
            facing: data.facing_entry,
            exitFacing: data.facing_exit,
            floor: data.floor_no,
            totalFloors: data.total_floors,
            parkingSpaces: data.parking_spaces,
            yearBuilt: data.year_built,
            additionalRooms: data.additional_rooms || [],
            views: data.views || [],
            documents: data.available_documents || [],
            priceNegotiable: data.price_negotiable,
            allInclusivePrice: data.is_all_inclusive_price,
            taxExcluded: data.is_tax_excluded,
            pricePerSqft: data.price_per_sqft,
            brokerageType: data.brokerage_type,
            brokerageAmount: data.brokerage_amount,
            hasShowcase: data.is_virtual_showcase,
            has3DVideo: data.is_3d_video,
            reraApproved: data.rera_approved,
            parkingType: data.parking_type
          };
          
          setProperty(mappedProperty);
          setActiveImage(mappedProperty.images[0]);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Could not load property details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    const recordVisit = async () => {
      if (!property || !user || user.id === property.ownerId) return;
      try {
        const { error } = await supabase.from('property_visitors').upsert({
          property_id: property.id,
          seller_id: property.ownerId,
          visitor_id: user.id,
          viewed_at: new Date().toISOString()
        }, { onConflict: 'property_id, visitor_id' }); 
        if (error) console.error("Visitor tracking error:", error);
      } catch (err) {
        console.error("Failed to record visit", err);
      }
    };
    recordVisit();
  }, [property, user]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    // ✅ DEFENSIVE PROGRAMMING: Strict Validations
    if (leadForm.name.trim().length < 2) {
        toast.error("Please enter a valid name (at least 2 characters).");
        return;
    }
    
    // Validates phone has 10 to 15 digits, optionally starting with a '+'
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    const cleanPhone = leadForm.phone.replace(/[\s-]/g, ''); // Remove spaces/dashes for check
    if (!phoneRegex.test(cleanPhone)) {
        toast.error("Please enter a valid phone number (10 to 15 digits).");
        return;
    }

    if (leadForm.message && leadForm.message.length > 1000) {
        toast.error("Message is too long. Please keep it under 1000 characters.");
        return;
    }

    setSubmitLoading(true);
    try {
        const { error } = await supabase.from('leads').insert([{
            property_id: property.id,
            seller_id: property.ownerId,
            buyer_name: leadForm.name.trim(),
            buyer_phone: cleanPhone,
            message: leadForm.message.trim() || `I am interested in ${property.title}`
        }]);

        if (error) throw error;
        toast.success("Enquiry Sent! The owner will contact you shortly.");
        setIsContactOpen(false);
        setLeadForm({ name: '', phone: '', message: '' });
    } catch (err) {
        toast.error("Failed to send enquiry.");
        console.error(err);
    } finally {
        setSubmitLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
    return `₹ ${price.toLocaleString()}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-brand-green font-bold text-xl"><Loader2 className="animate-spin mr-2"/> Loading Details...</div>;
  if (error || !property) return <div className="p-10 text-center">Property Not Found</div>;

  const isOwner = user && (user.id === property.ownerId || user.role === 'Admin');

  return (
    <div className="bg-gray-50 min-h-screen pb-12 relative">
      
      {/* 1. IMAGE GALLERY HEADER */}
      <div className="relative h-[50vh] md:h-[65vh] w-full bg-gray-900 group">
        <img src={activeImage} alt={property.title} className="w-full h-full object-cover opacity-90 transition-opacity duration-300" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
        
        <button onClick={() => navigate(-1)} className="absolute top-6 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition z-20">
            <ArrowLeft size={24} />
        </button>

        {isOwner && (
            <button 
                onClick={() => navigate(`/edit-property/${property.id}`)} 
                className="absolute top-6 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-brand-green font-bold hover:bg-white transition z-20 shadow-lg flex items-center gap-2"
            >
                <Edit size={18} /> Edit Listing
            </button>
        )}

        {property.images.length > 1 && (
            <div className="absolute bottom-28 md:bottom-8 right-4 flex gap-2 overflow-x-auto max-w-full pb-2 z-20 scrollbar-hide">
                {property.images.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImage(img)} 
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img ? 'border-brand-green scale-105' : 'border-white/50 hover:border-white'}`}>
                        <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        )}

        <div className="absolute bottom-8 left-4 md:left-8 text-white max-w-3xl z-10">
           <div className="flex flex-wrap gap-2 mb-3">
               <span className="bg-brand-green px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wide">
                 For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
               </span>
               {property.reraApproved && <span className="bg-blue-600 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1"><ShieldCheck size={14}/> RERA Registered</span>}
               {property.has3DVideo && <span className="bg-purple-600 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1"><Camera size={14}/> 3D Tour</span>}
           </div>
           <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">{property.title}</h1>
           <div className="flex items-center gap-2 text-gray-200 text-lg">
             <MapPin size={20} className="text-brand-green" /> {property.location}, {property.city}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. MAIN DETAILS */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-2 md:grid-cols-4 gap-6 border border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><BedDouble size={24} /></div>
                  <div><p className="text-gray-500 text-xs font-medium">Bedrooms</p><p className="font-bold text-gray-800">{property.bedrooms} BHK</p></div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 rounded-xl text-brand-green"><Bath size={24} /></div>
                  <div><p className="text-gray-500 text-xs font-medium">Bathrooms</p><p className="font-bold text-gray-800">{property.bathrooms} Baths</p></div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600"><Maximize size={24} /></div>
                  <div><p className="text-gray-500 text-xs font-medium">Super Area</p><p className="font-bold text-gray-800">{property.superBuiltUpArea || property.area} sqft</p></div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><Layers size={24} /></div>
                  <div><p className="text-gray-500 text-xs font-medium">Floor</p><p className="font-bold text-gray-800">{property.floor} of {property.totalFloors}</p></div>
               </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-4">About this Property</h2>
               <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description || "No description provided."}</p>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mt-8 pt-8 border-t border-gray-100">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase mb-1">Property Type</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2"><Home size={16}/> {property.type}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase mb-1">Construction Status</p>
                        <p className="font-semibold text-gray-800">{property.constructionStatus}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase mb-1">Year Built</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2"><Calendar size={16}/> {property.yearBuilt}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase mb-1">Facing (Entry)</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2"><Compass size={16}/> {property.facing}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase mb-1">Furnished Status</p>
                        <p className="font-semibold text-gray-800">{property.furnishedStatus}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase mb-1">Parking</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2"><Car size={16}/> {property.parkingType} ({property.parkingSpaces || 1})</p>
                    </div>
               </div>
            </div>

            {property.videoUrl && (
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Film size={20} className="text-brand-green" /> Property Video Tour
                    </h2>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-gray-200">
                        <video 
                            src={property.videoUrl} 
                            controls 
                            controlsList="nodownload"
                            className="w-full h-full object-contain"
                            poster={property.images[0]}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Area Breakdown</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-500 text-sm">Super Built-up Area</p>
                      <p className="text-lg font-bold text-gray-900">{property.superBuiltUpArea || '-'} <span className="text-sm font-normal text-gray-500">sqft</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-500 text-sm">Built-up Area</p>
                      <p className="text-lg font-bold text-gray-900">{property.builtUpArea || '-'} <span className="text-sm font-normal text-gray-500">sqft</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-500 text-sm">Carpet Area</p>
                      <p className="text-lg font-bold text-gray-900">{property.carpetArea || '-'} <span className="text-sm font-normal text-gray-500">sqft</span></p>
                  </div>
               </div>
               
               {property.additionalRooms && property.additionalRooms.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-gray-100">
                       <p className="text-sm text-gray-500 mb-2">Additional Rooms:</p>
                       <div className="flex flex-wrap gap-2">
                           {property.additionalRooms.map(room => (
                               <span key={room} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">{room}</span>
                           ))}
                       </div>
                   </div>
               )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                   {property.amenities.length > 0 ? property.amenities.map((item, i) => (
                     <div key={i} className="flex items-center gap-2 text-gray-700">
                       <CheckCircle2 size={18} className="text-brand-green flex-shrink-0" />
                       <span className="font-medium text-sm">{item}</span>
                     </div>
                   )) : <p className="text-gray-500 italic">No specific amenities listed.</p>}
                   
                   {property.views && property.views.map((v, i) => (
                      <div key={`v-${i}`} className="flex items-center gap-2 text-gray-700">
                         <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />
                         <span className="font-medium text-sm">{v} Facing</span>
                      </div>
                   ))}
               </div>
            </div>

            {property.documents && property.documents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText size={20}/> Available Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.documents.map((doc, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                                <ShieldCheck size={20} className="text-brand-green"/>
                                <span className="text-sm font-medium text-gray-800">{doc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* 3. SIDEBAR (PRICE & CONTACT) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-brand-green/10 sticky top-24">
               <div className="mb-6">
                 <p className="text-gray-500 font-medium mb-1">Total Price</p>
                 <h2 className="text-4xl font-bold text-brand-green">{formatPrice(property.price)}</h2>
                 
                 {property.pricePerSqft && property.pricePerSqft > 0 ? (
                     <p className="text-sm text-gray-500 mt-1 font-medium">
                         ₹ {property.pricePerSqft} / sqft
                     </p>
                 ) : null}
                 
                 <div className="mt-3 flex flex-wrap gap-2">
                     {property.allInclusivePrice && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">All Inclusive</span>}
                     {property.priceNegotiable && <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">Negotiable</span>}
                 </div>
               </div>

               {property.brokerageType !== 'None' && (
                   <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm flex items-start gap-2">
                       <Info size={16} className="mt-0.5 flex-shrink-0"/>
                       <div>
                           <p className="font-bold">Brokerage Applicable</p>
                           <p>{property.brokerageType}: {property.brokerageAmount} {property.brokerageType === 'Percentage of Price' ? '%' : '₹'}</p>
                       </div>
                   </div>
               )}

               <div className="space-y-3">
                 {showContact ? (
                     <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-3 animate-in fade-in zoom-in duration-200">
                         <p className="text-sm font-bold text-gray-700 mb-1 border-b border-green-200 pb-2">Contact Details</p>
                         
                         {property.ownerContact ? (
                             <a href={`tel:${property.ownerContact}`} className="flex items-center gap-3 text-brand-green font-bold hover:underline">
                                 <div className="bg-white p-2 rounded-full shadow-sm"><Phone size={16} /></div>
                                 {property.ownerContact}
                             </a>
                         ) : (
                             <p className="text-sm text-gray-500 flex items-center gap-2"><Phone size={16} /> Not provided</p>
                         )}

                         {property.ownerEmail && (
                             <a href={`mailto:${property.ownerEmail}`} className="flex items-center gap-3 text-brand-green font-bold hover:underline break-all">
                                 <div className="bg-white p-2 rounded-full shadow-sm"><Mail size={16} /></div>
                                 {property.ownerEmail}
                             </a>
                         )}
                     </div>
                 ) : (
                     <button onClick={() => setShowContact(true)} className="w-full bg-white border-2 border-brand-green text-brand-green font-bold py-4 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2">
                        <Phone size={20} /> Show Contact Info
                     </button>
                 )}

                 <button onClick={() => setIsContactOpen(true)} className="w-full bg-brand-green text-white font-bold py-4 rounded-xl hover:bg-emerald-800 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20">
                    <Mail size={20} /> Send Enquiry
                 </button>
               </div>

               <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
                    <Link to={`/profile/${property.ownerId}`} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-brand-green font-bold text-lg capitalize hover:ring-2 hover:ring-brand-green transition-all shadow-sm">
                        {property.ownerName ? property.ownerName.charAt(0) : <User size={24} />}
                    </Link>
                    <div>
                        <Link to={`/profile/${property.ownerId}`} className="font-bold text-gray-900 text-lg capitalize hover:text-brand-green hover:underline">
                            {property.ownerName || 'Platform User'} 
                        </Link>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            {property.listedBy} • Verified <ShieldCheck size={14} className="text-blue-500" />
                        </p>
                    </div>
               </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- CONTACT MODAL --- */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-brand-green p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Mail size={18}/> Contact {property.ownerName || property.listedBy}</h3>
                    <button onClick={() => setIsContactOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-500 mb-2">Please fill in your details to get a callback.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input 
                            required 
                            type="text" 
                            maxLength={50} // ✅ DEFENSIVE
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" 
                            value={leadForm.name} 
                            onChange={e => setLeadForm({...leadForm, name: e.target.value})} 
                            placeholder="John Doe" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                            required 
                            type="tel" 
                            maxLength={15} // ✅ DEFENSIVE
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" 
                            value={leadForm.phone} 
                            onChange={e => setLeadForm({...leadForm, phone: e.target.value})} 
                            placeholder="+91 98765 43210" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" 
                            rows={3}
                            maxLength={1000} // ✅ DEFENSIVE
                            value={leadForm.message} 
                            onChange={e => setLeadForm({...leadForm, message: e.target.value})} 
                            placeholder="I am interested in this property..." 
                        />
                    </div>
                    <button type="submit" disabled={submitLoading} className="w-full bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-emerald-800 transition flex items-center justify-center gap-2">
                        {submitLoading ? <Loader2 className="animate-spin"/> : "Send Request"}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetails;