import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize, Heart } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // 1. SAFE IMAGE HANDLING
  // Use the first image from the array, or a fallback if empty
  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
    return `₹ ${price.toLocaleString()}`;
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
      
      {/* --- CLICKABLE AREA (Wraps the whole card) --- */}
      <Link to={`/property/${property.id}`} className="flex flex-col h-full">
        
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={mainImage} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          
          {/* Price & Title Overlay (Now Clickable) */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
              <h3 className="text-xl font-bold text-white truncate">{formatPrice(property.price)}</h3>
              <p className="text-white/90 text-sm truncate">{property.title}</p>
          </div>
        </div>

        {/* Details Section (Now Clickable) */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
             <MapPin size={16} className="text-brand-green flex-shrink-0" />
             <span className="truncate">{property.location}, {property.city}</span>
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-50 mb-4">
              <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
                  <BedDouble size={20} className="text-blue-500 mb-1" />
                  <span className="text-xs font-bold text-gray-700">{property.bedrooms} Beds</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
                  <Bath size={20} className="text-brand-green mb-1" />
                  <span className="text-xs font-bold text-gray-700">{property.bathrooms} Baths</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
                  <Maximize size={20} className="text-orange-500 mb-1" />
                  <span className="text-xs font-bold text-gray-700">{property.area} sqft</span>
              </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {property.listedBy ? property.listedBy[0] : 'O'}
                   </div>
                   <span className="text-xs font-medium text-gray-500">
                      Posted by {property.listedBy || 'Owner'}
                   </span>
              </div>
              <span className="text-xs text-gray-400">
                  {new Date(property.datePosted).toLocaleDateString()}
              </span>
          </div>
        </div>
      </Link>

      {/* --- FLOATING ELEMENTS (Badges & Heart) --- */}
      {/* These sit ON TOP of the Link using Absolute Positioning */}
      
      <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-brand-green uppercase tracking-wide shadow-sm">
              {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          {property.isFeatured && (
              <span className="bg-yellow-400 px-2 py-1 rounded-md text-xs font-bold text-yellow-900 uppercase tracking-wide shadow-sm">
                  Featured
              </span>
          )}
      </div>

      <button 
        className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors shadow-sm z-10"
        onClick={(e) => {
            e.preventDefault(); // Stop the card Link from opening
            e.stopPropagation();
            // Add Favorite Logic here later
        }}
      >
          <Heart size={18} />
      </button>

    </div>
  );
};

export default PropertyCard;