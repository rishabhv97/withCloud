import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Property, PropertyStatus } from '../../types';
import { X, Eye, Trash2, ShieldCheck, PlusCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Ensure you have this for notifications
import ConfirmationModal from '../../components/ConfirmationModal'; // Import the new Modal

const PropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Sold'>('All');
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- HELPER: Cloudinary Thumbnails ---
  const getThumbnail = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/c_fill,w_100,h_100,q_auto,f_auto/');
    }
    return url;
  };

  const getPreviewImage = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/400x300';
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/c_fill,w_400,h_300,q_auto,f_auto/');
    }
    return url;
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Property[] = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            price: p.price,
            location: p.location,
            city: p.city,
            type: p.type,
            listingType: p.listing_type,
            status: p.status,
            listedBy: p.listed_by,
            ownerId: p.owner_id,
            images: p.images || [],
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            balconies: p.balconies || 0,
            area: p.area || 0,
            amenities: p.amenities || [],
            ownerContact: p.owner_contact || '',
            datePosted: p.created_at,
            documents: p.available_documents || [],
            isVerified: p.is_verified
        }));
        setProperties(mapped);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: PropertyStatus, isVerified: boolean) => {
    setProcessingId(id);
    try {
        const { error } = await supabase
            .from('properties')
            .update({ status: newStatus, is_verified: isVerified })
            .eq('id', id);

        if (error) throw error;

        setProperties(prev => prev.map(p => 
            p.id === id ? { ...p, status: newStatus, isVerified: isVerified } : p
        ));
        
        if (selectedProp?.id === id) {
            setSelectedProp(prev => prev ? { ...prev, status: newStatus, isVerified: isVerified } : null);
        }
        toast.success(`Property ${newStatus} successfully`);
    } catch (err) {
        console.error("Error updating status:", err);
        toast.error("Failed to update status.");
    } finally {
        setProcessingId(null);
    }
  };

  // 1. Open Modal instead of alert
  const confirmDelete = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation(); // Prevent opening the side panel
    setPropertyToDelete(property);
    setIsDeleteModalOpen(true);
  };

  // 2. Actual Delete Logic
  const handleDelete = async () => {
    if (!propertyToDelete) return;
    
    setIsDeleting(true);
    setProcessingId(propertyToDelete.id); // Show loader on button behind modal if visible

    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyToDelete.id);
      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      if (selectedProp?.id === propertyToDelete.id) setSelectedProp(null);
      
      toast.success("Property deleted successfully.");
      setIsDeleteModalOpen(false);

    } catch (err: any) {
      console.error("Error deleting property:", err);
      toast.error("Failed to delete. Check database policies.");
    } finally {
      setIsDeleting(false);
      setProcessingId(null);
      setPropertyToDelete(null);
    }
  };

  const filteredProperties = properties.filter(p => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-brown" /></div>;

  return (
    <div className="space-y-6">
      
      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Property?"
        message={`Are you sure you want to permanently delete "${propertyToDelete?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
           <p className="text-gray-500 text-sm">Manage listings and approvals.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/post-property')}
          className="bg-brand-brown text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-900 transition-colors shadow-lg shadow-brand-brown/20"
        >
            <PlusCircle size={18} /> Post New Property
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          {['All', 'Pending', 'Approved', 'Rejected', 'Sold'].map(tab => (
              <button
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === tab ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIST SECTION */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 sticky top-0">
                        <tr>
                            <th className="px-6 py-4">Property</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Listed By</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProperties.map(p => (
                            <tr key={p.id} className={`hover:bg-gray-50 cursor-pointer ${selectedProp?.id === p.id ? 'bg-blue-50/50' : ''}`} onClick={() => setSelectedProp(p)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={getThumbnail(p.images?.[0])} 
                                            alt="" 
                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100" 
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900 line-clamp-1">{p.title}</p>
                                            <p className="text-xs text-gray-500">₹{p.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                        p.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                        p.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                        p.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-600">{p.listedBy}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={(e) => confirmDelete(e, p)}
                                        disabled={processingId === p.id}
                                        className="p-2 rounded hover:bg-red-100 text-red-600 disabled:opacity-50" 
                                        title="Delete Property"
                                    >
                                        {processingId === p.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProperties.length === 0 && <div className="p-12 text-center text-gray-400">No properties found.</div>}
            </div>
        </div>

        {/* DETAILS / ACTION PANEL */}
        <div className="lg:col-span-1">
            {selectedProp ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Details & Actions</h2>
                        <button onClick={() => setSelectedProp(null)}><X size={20} className="text-gray-400" /></button>
                    </div>

                    <img 
                        src={getPreviewImage(selectedProp.images?.[0])} 
                        className="w-full h-40 object-cover rounded-lg mb-4 bg-gray-100" 
                        alt="Preview"
                    />
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-800 line-clamp-2">{selectedProp.title}</h3>
                        <p className="text-sm text-gray-500">{selectedProp.location}, {selectedProp.city}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleStatusChange(selectedProp.id, 'Approved', true)}
                                className="py-2 rounded-lg font-bold text-sm bg-green-600 text-white hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button 
                                onClick={() => handleStatusChange(selectedProp.id, 'Rejected', false)}
                                className="py-2 rounded-lg font-bold text-sm bg-red-600 text-white hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                        <Link 
                            to={`/property/${selectedProp.id}`} target="_blank"
                            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 flex items-center justify-center gap-2"
                        >
                            <Eye size={16} /> Preview
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                    <ShieldCheck size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">Select a property to moderate.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;