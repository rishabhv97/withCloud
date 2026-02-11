import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression'; // <--- NEW IMPORT
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { PropertyType, ListingType, OwnershipType, ConstructionStatus, FurnishedStatus, Facing, ParkingType, ViewType, BrokerageType, ListedBy } from '../types';
import { Sparkles, Upload, Loader2, CheckCircle, Home, X, AlertCircle, Trash2, Camera, FileText, Dumbbell } from 'lucide-react';

const PostProperty: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // <--- NEW STATE
  const [error, setError] = useState<string | null>(null);

  // --- 1. Image State (Up to 6) ---
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // --- 2. Form Data State ---
  const [formData, setFormData] = useState({
    // Basic
    listingType: 'sale' as ListingType,
    ownershipType: 'Freehold' as OwnershipType,
    propertyType: 'Apartment' as PropertyType,
    listedBy: 'Owner' as ListedBy,
    city: '',
    location: '',
    title: '',
    description: '',

    // Room Details
    bedrooms: 1,
    bathrooms: 1,
    balconies: 0,
    
    // Area (At least one mandatory)
    carpetArea: '',
    builtUpArea: '',
    superBuiltUpArea: '',
    
    // Other Rooms & Furnishing
    additionalRooms: [] as string[],
    furnishedStatus: 'Unfurnished' as FurnishedStatus,
    
    // Features
    constructionStatus: 'Ready to Move' as ConstructionStatus,
    yearBuilt: '',
    floorNo: '',
    totalFloors: '',
    facingEntry: 'North-East' as Facing,
    facingExit: 'South-West' as Facing,
    parkingType: 'Covered' as ParkingType,
    views: [] as ViewType[],
    
    // Media & Legal
    reraApproved: false,
    virtualShowcase: false,
    video3d: false,
    amenities: [] as string[],
    documents: [] as string[],
    
    // Price
    expectedPrice: '',
    pricePerSqft: '', 
    allInclusive: false,
    priceNegotiable: false,
    taxExcluded: false,
    
    // Brokerage
    brokerageType: 'None' as BrokerageType,
    brokerageAmount: '',
  });

  // --- Constants ---
  const additionalRoomOpts = ['Pooja Room', 'Study Room', 'Servant Room', 'Others'];
  const viewOptions: ViewType[] = ['Road', 'Park', 'Corner'];
  
  const amenityOptions = [
    'Club House', 'Swimming Pool', 'Kids Play Area', 'Lift', 
    'Power Backup', 'Gym', 'Vaastu Compliant', 'Security Personnel', 
    'Gas Pipeline', 'Park', 'Intercom', 'Fire Safety'
  ];

  const documentOptions = [
    'Sale Deed / Ownership Title', 'Society/Authority Transfer Letter', 'Occupancy Certificate (OC)',
    'Completion Certificate (CC)', 'Encumbrance Certificate (EC)', 'Property Tax Receipts',
    'NOC from Society/Builder', 'RERA Registration', 'Allotment Letter', 'Possession Letter'
  ];

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayToggle = (field: 'additionalRooms' | 'views' | 'documents' | 'amenities', value: string) => {
    setFormData(prev => {
        const arr = prev[field] as string[];
        const newArr = arr.includes(value) 
            ? arr.filter(item => item !== value) 
            : [...arr, value];
        return { ...prev, [field]: newArr };
    });
  };

  // --- UPDATED: Image Selection with Compression ---
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        // Explicitly type files as an array of File objects
        const files: File[] = Array.from(e.target.files);
        
        if (imageFiles.length + files.length > 6) {
            toast.error("You can only upload up to 6 images.");
            return;
        }

        setIsCompressing(true);
        const loadingToast = toast.loading("Optimizing images...");

        try {
            const options = {
                maxSizeMB: 0.8,          // Compress to ~800KB max
                maxWidthOrHeight: 1920,  // Resize large photos to HD
                useWebWorker: true,      // Run in background to avoid freezing UI
                fileType: 'image/webp'   // Convert to WebP (smaller & faster)
            };

            const compressedFiles = await Promise.all(
                files.map(async (file: File) => {
                    // Try/Catch per file to avoid one bad apple failing the whole batch
                    try {
                        return await imageCompression(file, options);
                    } catch (error) {
                        console.error("Compression failed for", file.name, error);
                        return file; // Fallback to original if compression fails
                    }
                })
            );

            // Create previews from the COMPRESSED files
            const newPreviews = compressedFiles.map((file: File) => URL.createObjectURL(file));
            
            setImageFiles(prev => [...prev, ...compressedFiles]);
            setPreviews(prev => [...prev, ...newPreviews]);
            toast.success("Images optimized!");

        } catch (err) {
            console.error("Image processing error:", err);
            toast.error("Some images could not be optimized, but we added them.");
        } finally {
            toast.dismiss(loadingToast);
            setIsCompressing(false);
        }
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (formData.expectedPrice && formData.superBuiltUpArea) {
        const price = parseFloat(formData.expectedPrice);
        const area = parseFloat(formData.superBuiltUpArea);
        if (price && area) {
            setFormData(prev => ({ ...prev, pricePerSqft: (price / area).toFixed(0) }));
        }
    }
  }, [formData.expectedPrice, formData.superBuiltUpArea]);

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("Please login to post a property");
        return navigate('/login');
    }
    
    setIsSubmitting(true);
    setError(null);

    if (!formData.carpetArea && !formData.builtUpArea && !formData.superBuiltUpArea) {
        const areaMsg = "At least one area type (Carpet, Built-up, or Super Built-up) is mandatory.";
        setError(areaMsg);
        toast.error(areaMsg);
        setIsSubmitting(false);
        return;
    }

    try {
        const imageUrls: string[] = [];
        
        // New Cloudinary Logic
for (const file of imageFiles) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); 
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    formData.append("folder", "real-estate-app"); // Optional: Organize files in a folder

    try {
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!res.ok) throw new Error("Image upload failed");

        const data = await res.json();
        imageUrls.push(data.secure_url); // Push the Cloudinary URL
    } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        toast.error(`Failed to upload ${file.name}`);
        setIsSubmitting(false); // Stop submission if critical image fails
        return; 
    }
}

        if (imageUrls.length === 0) {
            imageUrls.push('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80');
        }

        const initialStatus = (user.role === 'Admin' || user.role === 'Broker') ? 'Approved' : 'Pending';

        const propertyPayload = {
            owner_id: user.id,
            title: formData.title || `${formData.bedrooms} BHK ${formData.propertyType} in ${formData.location}`,
            description: formData.description,
            price: parseFloat(formData.expectedPrice),
            location: formData.location,
            city: formData.city,
            type: formData.propertyType,
            listing_type: formData.listingType,
            images: imageUrls, 
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            balconies: formData.balconies,
            carpet_area: parseFloat(formData.carpetArea) || 0,
            built_up_area: parseFloat(formData.builtUpArea) || 0,
            super_built_up_area: parseFloat(formData.superBuiltUpArea) || 0,
            area: parseFloat(formData.superBuiltUpArea || formData.builtUpArea || formData.carpetArea),
            additional_rooms: formData.additionalRooms,
            furnished_status: formData.furnishedStatus,
            construction_status: formData.constructionStatus,
            year_built: parseInt(formData.yearBuilt) || new Date().getFullYear(),
            floor_no: parseInt(formData.floorNo) || 0,
            total_floors: parseInt(formData.totalFloors) || 0,
            facing_entry: formData.facingEntry,
            facing_exit: formData.facingExit,
            parking_type: formData.parkingType,
            views: formData.views,
            rera_approved: formData.reraApproved,
            is_virtual_showcase: formData.virtualShowcase,
            is_3d_video: formData.video3d,
            amenities: formData.amenities, 
            available_documents: formData.documents,
            price_per_sqft: parseFloat(formData.pricePerSqft) || 0,
            is_all_inclusive_price: formData.allInclusive,
            is_tax_excluded: formData.taxExcluded,
            brokerage_type: formData.brokerageType,
            brokerage_amount: parseFloat(formData.brokerageAmount) || 0,
            status: initialStatus,
            listed_by: user.role === 'Broker' ? 'Agent' : 'Owner'
        };

        const { error: dbError } = await supabase.from('properties').insert([propertyPayload]);
        if (dbError) throw dbError;

        if (initialStatus === 'Approved') {
            toast.success("Property Posted Successfully! It is now Live.");
        } else {
            toast.success("Property Posted! It is pending Admin Approval.");
        }
        navigate('/');

    } catch (err: any) {
        console.error(err);
        const msg = err.message || "Failed to upload property.";
        setError(msg);
        toast.error(msg);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-green p-6 text-white text-center">
            <h1 className="text-3xl font-bold">Post Your Property</h1>
            <p className="opacity-90">Fill in the details to reach millions of buyers</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* SECTION 1: BASIC INFO */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Home size={20}/> Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">I want to</label>
                        <div className="flex gap-4">
                            {['sale', 'rent'].map(opt => (
                                <button type="button" key={opt} 
                                    onClick={() => setFormData(prev => ({...prev, listingType: opt as ListingType}))}
                                    className={`flex-1 py-2 rounded-lg font-medium border capitalize ${formData.listingType === opt ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-600'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ownership Type</label>
                        <select name="ownershipType" value={formData.ownershipType} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                            {['Freehold', 'Leasehold', 'Co-operative society', 'Power of Attorney'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                        <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                            {['Apartment', 'Villa', 'House', 'Builder Floor', 'Residential Land', 'Penthouse', '1 RK/Studio'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Listed By</label>
                        <div className="flex gap-2">
                            {['Owner', 'Agent', 'Builder'].map(opt => (
                                <button type="button" key={opt} 
                                    onClick={() => setFormData(prev => ({...prev, listedBy: opt as ListedBy}))}
                                    className={`flex-1 py-2 rounded-lg text-sm border ${formData.listedBy === opt ? 'bg-brand-brown text-white border-brand-brown' : 'bg-white text-gray-600'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                        <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Locality / Area</label>
                        <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                    </div>
                </div>
            </section>

            {/* SECTION 2: ROOM DETAILS */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Room Details</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                        <div className="flex flex-wrap gap-3">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button type="button" key={num} onClick={() => setFormData(p => ({...p, bedrooms: num}))}
                                    className={`w-12 h-12 rounded-full border font-bold ${formData.bedrooms === num ? 'bg-brand-green text-white' : 'bg-white text-gray-600 hover:border-brand-green'}`}>
                                    {num}{num === 5 ? '+' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Bathrooms Pill */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                        <div className="flex flex-wrap gap-3">
                            {[1, 2, 3, 4].map(num => (
                                <button type="button" key={num} onClick={() => setFormData(p => ({...p, bathrooms: num}))}
                                    className={`w-12 h-12 rounded-full border font-bold ${formData.bathrooms === num ? 'bg-brand-green text-white' : 'bg-white text-gray-600 hover:border-brand-green'}`}>
                                    {num}{num === 4 ? '+' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Balconies Pill */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Balconies</label>
                        <div className="flex flex-wrap gap-3">
                            {[0, 1, 2, 3].map(num => (
                                <button type="button" key={num} onClick={() => setFormData(p => ({...p, balconies: num}))}
                                    className={`w-12 h-12 rounded-full border font-bold ${formData.balconies === num ? 'bg-brand-green text-white' : 'bg-white text-gray-600 hover:border-brand-green'}`}>
                                    {num}{num === 3 ? '+' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: AREA DETAILS */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Area Details <span className="text-xs font-normal text-red-500">(At least one mandatory)</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Carpet Area (sq.ft)</label>
                        <input type="number" name="carpetArea" value={formData.carpetArea} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. 1200"/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Built-up Area (sq.ft)</label>
                        <input type="number" name="builtUpArea" value={formData.builtUpArea} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. 1400"/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Super Built-up Area</label>
                        <input type="number" name="superBuiltUpArea" value={formData.superBuiltUpArea} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. 1650"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Other Rooms (Optional)</label>
                    <div className="flex flex-wrap gap-3">
                        {additionalRoomOpts.map(room => (
                            <button type="button" key={room} onClick={() => handleArrayToggle('additionalRooms', room)}
                                className={`px-4 py-2 rounded-full text-sm border ${formData.additionalRooms.includes(room) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white text-gray-600'}`}>
                                {formData.additionalRooms.includes(room) && <CheckCircle size={14} className="inline mr-1"/>} {room}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing Status</label>
                     <div className="flex gap-4 max-w-lg">
                        {['Unfurnished', 'Semi-Furnished', 'Furnished'].map(opt => (
                            <button type="button" key={opt} 
                                onClick={() => setFormData(p => ({...p, furnishedStatus: opt as FurnishedStatus}))}
                                className={`flex-1 py-2 rounded-lg border text-sm ${formData.furnishedStatus === opt ? 'bg-brand-green text-white' : 'bg-white'}`}>
                                {opt}
                            </button>
                        ))}
                     </div>
                </div>
            </section>

            {/* SECTION 4: FEATURES & AMENITIES */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Construction Status</label>
                        <select name="constructionStatus" value={formData.constructionStatus} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                            {['Ready to Move', 'Under Construction', 'New Launch'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year Built</label>
                        <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. 2022"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-2">Floor No.</label>
                             <input type="number" name="floorNo" value={formData.floorNo} onChange={handleChange} className="w-full p-2.5 border rounded-lg"/>
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-2">Total Floors</label>
                             <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} className="w-full p-2.5 border rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Facing (Entry)</label>
                        <select name="facingEntry" value={formData.facingEntry} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                            {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Facing (Exit) - Vaastu</label>
                        <select name="facingExit" value={formData.facingExit} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                             {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Parking</label>
                        <div className="flex gap-2">
                             {['Covered', 'Open'].map(opt => (
                                 <button type="button" key={opt} onClick={() => setFormData(p => ({...p, parkingType: opt as ParkingType}))}
                                     className={`flex-1 py-2 rounded-lg border text-sm ${formData.parkingType === opt ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                     {opt}
                                 </button>
                             ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Views</label>
                        <div className="flex flex-wrap gap-2">
                            {viewOptions.map(view => (
                                <button type="button" key={view} onClick={() => handleArrayToggle('views', view)}
                                    className={`px-3 py-1.5 rounded-md border text-sm ${formData.views.includes(view) ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white'}`}>
                                    {view}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="reraApproved" checked={formData.reraApproved} onChange={handleChange} className="w-5 h-5 text-brand-green rounded"/>
                            <span className="text-gray-700">RERA Approved Project</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="virtualShowcase" checked={formData.virtualShowcase} onChange={handleChange} className="w-5 h-5 text-brand-green rounded"/>
                            <span className="text-gray-700">Virtual Showcase Available</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="video3d" checked={formData.video3d} onChange={handleChange} className="w-5 h-5 text-brand-green rounded"/>
                            <span className="text-gray-700">3D Video Available</span>
                         </label>
                    </div>
                </div>
                
                {/* --- UPDATED AMENITIES SECTION --- */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Dumbbell size={16} /> Amenities Available
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {amenityOptions.map(item => (
                            <label key={item} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={formData.amenities.includes(item)} 
                                    onChange={() => handleArrayToggle('amenities', item)}
                                    className="mt-1 w-4 h-4 text-brand-green rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </section>

             {/* SECTION 5: LEGAL DOCUMENTS */}
             <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2"><FileText size={20} className="inline mr-2"/>Legal Documents Available</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documentOptions.map(doc => (
                        <label key={doc} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input type="checkbox" checked={formData.documents.includes(doc)} onChange={() => handleArrayToggle('documents', doc)}
                                className="mt-1 w-4 h-4 text-brand-green rounded border-gray-300"/>
                            <span className="text-sm text-gray-700">{doc}</span>
                        </label>
                    ))}
                </div>
            </section>

             {/* SECTION 6: PRICE */}
             <section className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Sparkles size={20}/> Price Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Price (₹)</label>
                        <input required type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} className="w-full p-3 border rounded-lg text-lg font-bold" placeholder="e.g. 7500000"/>
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price per sq.ft</label>
                        <input type="number" name="pricePerSqft" value={formData.pricePerSqft} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100" readOnly placeholder="Auto-calculated"/>
                        <p className="text-xs text-gray-500 mt-1">Based on Super built-up Area</p>
                     </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="allInclusive" checked={formData.allInclusive} onChange={handleChange} className="w-5 h-5 text-brand-green rounded"/>
                        <span className="text-gray-700">All inclusive price</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="priceNegotiable" checked={formData.priceNegotiable} onChange={handleChange} className="w-5 h-5 text-brand-green rounded"/>
                        <span className="text-gray-700">Price Negotiable</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="taxExcluded" checked={formData.taxExcluded} onChange={handleChange} className="w-5 h-5 text-brand-green rounded"/>
                        <span className="text-gray-700">Tax and Govt. charges excluded</span>
                    </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Do you charge brokerage?</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select name="brokerageType" value={formData.brokerageType} onChange={handleChange} className="p-2.5 border rounded-lg bg-white">
                             <option value="None">None</option>
                             <option value="Fixed">Fixed</option>
                             <option value="Percentage of Price">Percentage of Price</option>
                        </select>
                        {formData.brokerageType !== 'None' && (
                             <input type="number" name="brokerageAmount" value={formData.brokerageAmount} onChange={handleChange} 
                                className="col-span-2 p-2.5 border rounded-lg" placeholder={formData.brokerageType === 'Fixed' ? 'Amount (₹)' : 'Percentage (%)'} />
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION 7: IMAGES (Max 6) */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Camera size={20}/> Photos <span className="text-sm font-normal text-gray-500">(Max 6)</span></h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={src} alt="Preview" className="w-full h-full object-cover"/>
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={14}/>
                            </button>
                        </div>
                    ))}
                    
                    {previews.length < 6 && !isCompressing && (
                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                            <Upload className="text-gray-400 mb-2"/>
                            <span className="text-sm text-gray-500 font-medium">Add Photo</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                        </label>
                    )}
                    {isCompressing && (
                        <div className="aspect-square flex flex-col items-center justify-center border-2 border-gray-100 bg-gray-50 rounded-lg">
                            <Loader2 className="animate-spin text-brand-green mb-2"/>
                            <span className="text-xs text-gray-500">Optimizing...</span>
                        </div>
                    )}
                </div>
            </section>

             {/* SECTION 8: DESCRIPTION */}
             <section>
                 <label className="block text-xl font-bold text-gray-800 mb-2">Description</label>
                 <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} 
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-brand-green outline-none" 
                    placeholder="Describe your property in detail (e.g. nearby landmarks, reason for selling)..."></textarea>
            </section>

            <div className="flex justify-end pt-6">
                <button type="submit" disabled={isSubmitting || isCompressing} className="bg-brand-green text-white text-lg font-bold py-4 px-10 rounded-xl hover:bg-emerald-800 transition flex items-center gap-2 shadow-lg shadow-brand-green/20 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? <><Loader2 className="animate-spin"/> Publishing...</> : <><CheckCircle/> Post Property</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default PostProperty;