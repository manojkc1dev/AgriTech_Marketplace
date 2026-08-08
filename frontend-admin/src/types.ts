export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Cooperative' | 'Farmer' | 'B2B Buyer';
  organization: string;
  district: string;
  status: 'Active' | 'Pending Verification' | 'Suspended';
  joinedDate: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export type Role = 'admin' | 'coop_lead' | 'wholesaler' | 'auditor';

export interface CropPriceIndex {
  id: string;
  cropName: string;
  cropNepaliName?: string;
  region: string;
  rateNrs: number;
  sourceMarket: string;
  loggingDate: string;
  unit: string;
  previousRate?: number;
}

export interface MarketHistoryPoint {
  date: string;
  rate: number;
  volumeTons: number;
}

export interface ForwardContractRequirement {
  id: string;
  code: string; // e.g. #demand_seed_1
  cropName: string;
  cropNepaliName: string;
  quantityKg: number;
  targetPriceCeiling: number;
  buyerName: string;
  buyerOrg: string;
  buyerLocation: string;
  targetDays: number;
  category: string;
  bidsCount: number;
  status: 'Open' | 'In Negotiations' | 'Fulfilled' | 'Closed';
  createdDate: string;
  description?: string;
  bids?: BidProposal[];
}

export interface BidProposal {
  id: string;
  contractId: string;
  sellerName: string;
  cooperativeName: string;
  region: string;
  priceOfferedNrs: number;
  quantityKg: number;
  deliveryDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  submittedAt: string;
  notes?: string;
}

export interface ColdChainRoute {
  id: string;
  truckNumber: string;
  driverName: string;
  origin: string;
  destination: string;
  currentLocation: string;
  tempCelsius: number;
  targetTempCelsius: number;
  humidityPercent: number;
  capacityKg: number;
  cargoDescription: string;
  etaMinutes: number;
  status: 'On Route' | 'Loading' | 'Delivered' | 'Alert';
}

export interface KycVerificationUser {
  id: string;
  fullName: string;
  entityName: string;
  roleType: 'Farmer Co-op' | 'Wholesaler' | 'Institutional Buyer';
  citizenshipNumber: string;
  district: string;
  panNumber: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  submittedDate: string;
  documents: string[];
}

export interface PlatformFeedbackItem {
  id: string;
  userName: string;
  userRole: string;
  rating: number;
  category: 'Price Entry UI' | 'Logistics' | 'Payment' | 'General';
  message: string;
  date: string;
  resolved: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface ApiLogItem {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  durationMs: number;
  payloadSize: string;
}

export interface FilterOptions {
  searchQuery: string;
  selectedCrop: string;
  selectedRegion: string;
  pricingTier: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}
