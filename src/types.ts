export type PropertyType = 
  | 'Apartment' 
  | 'Villa' 
  | '1 RK/Studio' 
  | 'House' 
  | 'Residential Land' 
  | 'Penthouse' 
  | 'Kothi' 
  | 'Builder Floor' 
  | 'Farm House' 
  | 'Others';

export type ListingType = 'sale' | 'rent';
export type ConstructionStatus = 'New Launch' | 'Ready to Move' | 'Under Construction';
export type FurnishedStatus = 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
export type ListedBy = 'Agent' | 'Owner' | 'Builder';
export type Facing = 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
export type ViewType = 'Road' | 'Park' | 'Corner' | 'City';
export type ParkingType = 'Open' | 'Covered';
export type OwnershipType = 'Freehold' | 'Leasehold' | 'Co-operative society' | 'Power of Attorney';
export type BrokerageType = 'Fixed' | 'Percentage of Price' | 'None';

export type PropertyStatus = 'Pending' | 'Approved' | 'Rejected' | 'Sold' | 'Draft';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  type: PropertyType;
  listingType: ListingType;
  
  // --- UPDATED: Support multiple images ---
  images: string[]; 
  
  // Room Details
  bedrooms: number;
  bathrooms: number;
  balconies?: number; 
  
  // Area Details
  area: number; // Primary display area
  carpetArea?: number; 
  builtUpArea?: number; 
  superBuiltUpArea?: number; 
  
  // Amenities & Contact
  amenities: string[];
  ownerContact: string;
  isFeatured?: boolean;
  datePosted: string;
  
  // Features
  constructionStatus?: ConstructionStatus;
  furnishedStatus?: FurnishedStatus;
  listedBy?: ListedBy;
  ownershipType?: OwnershipType;
  facing?: Facing; 
  exitFacing?: Facing; 
  floor?: number;
  totalFloors?: number;
  reraApproved?: boolean;
  parkingSpaces?: number;
  yearBuilt?: number;
  
  // Extra Arrays
  additionalRooms?: string[]; 
  
  // Price Details
  priceNegotiable?: boolean; 
  allInclusivePrice?: boolean; 
  taxExcluded?: boolean; 
  pricePerSqft?: number; 
  
  // Brokerage
  brokerageType?: BrokerageType; 
  brokerageAmount?: number; 
  brokerageNegotiable?: boolean; 
  
  // Media Flags
  hasShowcase?: boolean;
  has3DVideo?: boolean;
  parkingType?: ParkingType;
  views?: ViewType[];
  
  // Legal
  documents?: string[];
  
  // Admin & System Fields
  isVerified?: boolean;
  status?: PropertyStatus; 
  pageViews?: number;
  leads?: number;
  ownerId?: string; 
}

export interface FilterState {
  search: string;
  listingType: ListingType;
  propertyType: PropertyType[];
  minPrice: number;
  maxPrice: number;
  constructionStatus: ConstructionStatus[];
  furnishedStatus: FurnishedStatus[];
  listedBy: ListedBy[];
  amenities: string[];
}

// --- Admin Specific Types ---

export type LeadStatus = 'New' | 'Contacted' | 'Follow-up' | 'Closed' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Ads' | 'Referral';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId?: string;
  interest: 'Buy' | 'Rent' | 'Sell';
  source: LeadSource;
  status: LeadStatus;
  date: string;
  assignedAgent?: string;
  notes?: string;
}

export type UserRole = 'Admin' | 'Broker' | 'Seller' | 'Buyer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  joinDate: string;
  isVerified: boolean;
  status: 'Active' | 'Inactive' | 'Suspended';
  propertiesListed?: number;
  companyName?: string;
  licenseNumber?: string;
}