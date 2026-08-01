export type UserRole = 'farmer' | 'buyer' | 'admin' | 'cooperative';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  phone: string;
  email?: string;
  password?: string;
  district: string;
  verified: boolean;
  fullName: string;
  cooperativeId?: string; // Linked cooperative if role is 'cooperative'
  smsDemandAlerts?: boolean;
  inAppDemandAlerts?: boolean;
  smsWeatherAlerts?: boolean;
  inAppWeatherAlerts?: boolean;
  
  // Extra Profile Fields
  profilePic?: string;
  dob?: string;
  address?: string;

  // KYC Citizenship & National Identity Card Verification
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  citizenshipNumber?: string;
  citizenshipDocUrl?: string;
  nationalIdNumber?: string;
  nationalIdDocUrl?: string;
  verificationNotes?: string;
  verificationSubmittedAt?: string;

  // Security Flag
  is_first_login?: boolean;
}

export interface MarketPrice {
  id: string;
  crop: string;
  region: 'Kathmandu' | 'Terai' | 'Hill';
  price_per_unit: number;
  unit: string;
  date: string; // YYYY-MM-DD
  source_market: string; // e.g. Kalimati, Tokha, Itahari
  category?: 'vegetables' | 'fruits' | 'grains' | 'spices' | 'pulses' | string;
  district?: string;
}

export type ListingStatus = 'available' | 'reserved' | 'sold';

export interface ProduceListing {
  id: string;
  farmerId: string;
  crop: string;
  quantity: number;
  unit: string;
  target_price: number;
  status: ListingStatus;
  created_at: string;
  farmerName?: string;
  district?: string;
}

export type DemandStatus = 'active' | 'fulfilled' | 'cancelled';

export interface DemandPost {
  id: string;
  crop: string;
  quantityRequired: number;
  unit: string;
  targetPricePerUnit: number;
  requiredByDate?: string;
  buyerName: string;
  district?: string;
}

export type OrderStatus = 'pending' | 'negotiating' | 'confirmed' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  listingId: string;
  demandId: string | null;
  farmerId: string;
  buyerId: string;
  crop: string;
  quantity: number;
  unit: string;
  agreed_price: number;
  status: OrderStatus;
  created_at: string;
  farmerName?: string;
  buyerName?: string;
}

export interface Negotiation {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  message: string;
  proposed_price: number;
  created_at: string;
  qrCodeData?: string;
  qrType?: 'payment' | 'batch_tag' | 'traceability' | 'receipt' | 'verification';
  qrTitle?: string;
}

export interface Cooperative {
  id: string;
  name: string;
  district: string;
  contact_person: string;
  phone: string;
  farmerIds: string[]; // Linked farmers (M2M)
}

export interface CooperativeMessage {
  id: string;
  farmerId: string;
  farmerName: string;
  cooperativeId: string;
  cooperativeName: string;
  crop: string;
  message: string;
  created_at: string;
}

export interface SoilLog {
  id: string;
  farmerId: string;
  cropBatch: string;
  logType: 'fertilizer' | 'soil_test';
  date: string;
  details: string;
  created_at: string;
}

export interface HarvestRecord {
  id: string;
  farmerId: string;
  crop: string;
  season: string;
  acreage: number; // in Ropani
  yieldQuantity: number; // in KG
  fertilizerUsed: string;
  weatherCondition: 'optimal' | 'dry' | 'excessive';
  soilCondition: 'poor' | 'organic' | 'balanced';
  created_at: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  requestBody: any;
  responseStatus: number;
  responseBody: any;
}

export interface PriceAlert {
  id: string;
  userId: string;
  crop: string;
  criteria: 'above' | 'below';
  priceThreshold: number;
  region?: string; // Optional: specific region (Kathmandu, Terai, Hill) or all
  district?: string; // Optional: preferred district
  email?: string; // Subscribed email address
  isActive: boolean;
  created_at: string;
}

export interface PriceNotification {
  id: string;
  userId: string;
  alertId?: string;
  title: string;
  message: string;
  crop: string;
  currentPrice: number;
  threshold: number;
  criteria: 'above' | 'below';
  region: string;
  district?: string;
  emailSentTo?: string;
  emailSubject?: string;
  emailBody?: string;
  isRead: boolean;
  created_at: string;
}

export interface CooperativeAnnouncement {
  id: string;
  cooperativeId: string;
  cooperativeName: string;
  title: string;
  content: string;
  category: 'market_update' | 'bulk_notification' | 'training' | 'weather_warning';
  created_at: string;
}

export type FeedbackType = 'feature_request' | 'bug_report' | 'usability_issue' | 'general_feedback';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'dismissed';

export interface PlatformFeedback {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: UserRole | 'guest';
  userDistrict?: string;
  userPhone?: string;
  type: FeedbackType;
  title: string;
  description: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  adminNotes?: string;
  created_at: string;
}

export type ScanType = 'member' | 'batch' | 'text' | 'unknown';

export interface ScanHistoryItem {
  id: string;
  userId: string;
  scanType: ScanType;
  scannedAt: string;
  title: string;
  details: string;
  metadata?: {
    crop?: string;
    quantity?: string;
    price?: string;
    district?: string;
    grade?: string;
    batchId?: string;
    memberId?: string;
    fullName?: string;
    cooperativeName?: string;
    phone?: string;
    rawContent?: string;
  };
}

// 1. Bulk Demand Bid & Forward Contract
export interface DemandBid {
  id: string;
  demandId: string;
  farmerId: string;
  farmerName: string;
  farmerDistrict: string;
  bidPricePerUnit: number;
  deliveryDaysRequired: number;
  depositLocked: number; // Binding deposit amount
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// 2. Cold Chain & Route Logistics
export interface LogisticsDispatch {
  id: string;
  orderId: string;
  crop: string;
  quantity: number;
  unit: string;
  originDistrict: string;
  destinationDistrict: string;
  route: 'Prithvi Highway' | 'Dhading-Kathmandu Corridor' | 'BP Highway' | 'Mahendra Highway' | 'Tribhuvan Highway' | 'Mid-Hill Highway';
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  coldChainTempC?: number; // e.g., 4.2°C for cold storage truck
  status: 'dispatched' | 'in_transit' | 'delivered' | 'delayed';
  departureTime: string;
  estimatedArrival: string;
  currentCheckpoint?: string;
}

// 3. Automated VAT Invoice & Settlement
export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., VAT-NP-2026-8491
  orderId: string;
  buyerName: string;
  farmerName: string;
  cooperativeName?: string;
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  subtotal: number;
  logisticsFee: number; // Fee to driver/logistics provider
  cooperativeServiceFee: number; // Fee to cooperative
  vatAmount: number; // 13% Nepal VAT if applicable
  totalAmount: number;
  paymentMethod: 'eSewa' | 'Khalti' | 'ConnectIPS' | 'Bank Transfer' | 'Cash on Delivery';
  status: 'issued' | 'paid' | 'settled';
  issuedAt: string;
  settledAt?: string;
}

// 4. Institutional Recurring Subscription
export interface InstitutionalSubscription {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerOrganization: string; // e.g. "Hotel Yak & Yeti", "Annapurna Hospital Canteen"
  crop: string;
  weeklyQuantity: number;
  unit: string;
  agreedPricePerUnit: number;
  deliveryDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  district: string;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextDeliveryDate: string;
}

// 5. Full Audit Trail Log
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'order' | 'inventory' | 'negotiation' | 'kyc' | 'dispatch' | 'subscription' | 'dispute';
  details: string;
  ipAddress?: string;
}

// 6. Dispute Resolution & Ticketing
export interface SupportTicketResponse {
  id: string;
  senderName: string;
  userRole: UserRole | 'admin';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  orderId?: string;
  category: 'shipping_delay' | 'quality_dispute' | 'payment_issue' | 'kyc_issue' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  responses: SupportTicketResponse[];
}



