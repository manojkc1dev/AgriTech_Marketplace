import {
  CropPriceIndex,
  ForwardContractRequirement,
  BidProposal,
  ColdChainRoute,
  KycVerificationUser,
  PlatformFeedbackItem,
  AuditLogItem,
  ApiLogItem,
  UserAccount
} from '../types';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-1',
    fullName: 'Rameshwor Bhattarai',
    email: 'rameshwor@suryodaya.coop.np',
    phone: '+977 9851029384',
    role: 'Cooperative',
    organization: 'Suryodaya Krishi Sahakari Sanstha',
    district: 'Kavrepalanchok',
    status: 'Pending Verification',
    joinedDate: '2026-08-07',
    lastLogin: '2 hours ago'
  },
  {
    id: 'user-2',
    fullName: 'Saraswati Gurung',
    email: 'saraswati@himalayanstorage.com',
    phone: '+977 9841223344',
    role: 'B2B Buyer',
    organization: 'Himalayan Cold Storage & Wholesale',
    district: 'Kathmandu',
    status: 'Pending Verification',
    joinedDate: '2026-08-08',
    lastLogin: '30 mins ago'
  },
  {
    id: 'user-3',
    fullName: 'Hari Prasad Sharma',
    email: 'hari.sharma@kalimatimarket.gov.np',
    phone: '+977 9801998877',
    role: 'B2B Buyer',
    organization: 'Kalimati Wholesale Market Board',
    district: 'Kathmandu',
    status: 'Active',
    joinedDate: '2026-01-15',
    lastLogin: 'Just now'
  },
  {
    id: 'user-4',
    fullName: 'Gita Karki',
    email: 'gita.karki@dhadinggreen.coop',
    phone: '+977 9812345678',
    role: 'Cooperative',
    organization: 'Dhading Green Agro Produce Co-op',
    district: 'Dhading',
    status: 'Active',
    joinedDate: '2026-03-20',
    lastLogin: '1 day ago'
  },
  {
    id: 'user-5',
    fullName: 'Shyam Shrestha',
    email: 'shyam.shrestha@resort.np',
    phone: '+977 9860112233',
    role: 'B2B Buyer',
    organization: 'Kathmandu Resort & Catering Group',
    district: 'Kathmandu',
    status: 'Active',
    joinedDate: '2026-04-10',
    lastLogin: '3 hours ago'
  },
  {
    id: 'user-6',
    fullName: 'Ram Kumar Thapa',
    email: 'ram.thapa@panchkhalorganic.coop',
    phone: '+977 9841990011',
    role: 'Cooperative',
    organization: 'Panchkhal Organic Farmers Co-op',
    district: 'Kavre',
    status: 'Active',
    joinedDate: '2026-02-14',
    lastLogin: '5 hours ago'
  },
  {
    id: 'user-7',
    fullName: 'Manoj KC',
    email: 'admin@agritech.gov.np',
    phone: '+977 9851001122',
    role: 'Admin',
    organization: 'AgriTech Nepal Ministry Portal',
    district: 'Kathmandu',
    status: 'Active',
    joinedDate: '2026-01-01',
    lastLogin: 'Active now'
  }
];

// Mock Initial Data
export const INITIAL_CROPS: CropPriceIndex[] = [
  {
    id: 'crop-1',
    cropName: 'Tomato (Golbheda)',
    cropNepaliName: 'गोलभेडा (ठूलो)',
    region: 'Kathmandu',
    rateNrs: 83,
    sourceMarket: 'Kalimati Market',
    loggingDate: '2026-08-08',
    unit: 'KG',
    previousRate: 78
  },
  {
    id: 'crop-2',
    cropName: 'Ginger (Aduwa)',
    cropNepaliName: 'अदुवा',
    region: 'Dhading',
    rateNrs: 110,
    sourceMarket: 'Dhading Besi Mandi',
    loggingDate: '2026-08-08',
    unit: 'KG',
    previousRate: 115
  },
  {
    id: 'crop-3',
    cropName: 'Red Potato (Rato Aalu)',
    cropNepaliName: 'रातो आलु',
    region: 'Makwanpur',
    rateNrs: 54,
    sourceMarket: 'Palung Collection Hub',
    loggingDate: '2026-08-08',
    unit: 'KG',
    previousRate: 52
  },
  {
    id: 'crop-4',
    cropName: 'Dry Onion (Dry Pyaj)',
    cropNepaliName: 'सूखा प्याज',
    region: 'Kathmandu',
    rateNrs: 68,
    sourceMarket: 'Balkhu Wholesale Yard',
    loggingDate: '2026-08-08',
    unit: 'KG',
    previousRate: 70
  },
  {
    id: 'crop-5',
    cropName: 'Cauliflower (Local Kauli)',
    cropNepaliName: 'स्थानिय काउली',
    region: 'Chitwan',
    rateNrs: 62,
    sourceMarket: 'Narayangarh Mandi',
    loggingDate: '2026-08-08',
    unit: 'KG',
    previousRate: 58
  },
  {
    id: 'crop-6',
    cropName: 'Green Chilli (Akbare Khursani)',
    cropNepaliName: 'अकबरे खुर्सानी',
    region: 'Kavre',
    rateNrs: 220,
    sourceMarket: 'Panauti Co-op Market',
    loggingDate: '2026-08-08',
    unit: 'KG',
    previousRate: 210
  }
];

export const INITIAL_DEMAND_REQUIREMENTS: ForwardContractRequirement[] = [
  {
    id: 'demand_1',
    code: '#demand_seed_1',
    cropName: 'Tomato (Golbheda)',
    cropNepaliName: 'गोलभेडा',
    quantityKg: 2500,
    targetPriceCeiling: 78,
    buyerName: 'Shyam Shrestha',
    buyerOrg: 'Kathmandu Resort & Catering Group',
    buyerLocation: 'Kathmandu',
    targetDays: 30,
    category: 'Vegetables',
    bidsCount: 4,
    status: 'Open',
    createdDate: '2026-08-01',
    description: 'Bulk grade-A ripe tomatoes for hotel chain operations. Standard crate delivery required.',
    bids: [
      {
        id: 'bid-1',
        contractId: 'demand_1',
        sellerName: 'Ram Kumar Thapa',
        cooperativeName: 'Panchkhal Organic Farmers Co-op',
        region: 'Kavre',
        priceOfferedNrs: 76,
        quantityKg: 2500,
        deliveryDate: '2026-08-20',
        status: 'Pending',
        submittedAt: '2026-08-05'
      },
      {
        id: 'bid-2',
        contractId: 'demand_1',
        sellerName: 'Bishnu Adhikari',
        cooperativeName: 'Dhading Green Agro Produce',
        region: 'Dhading',
        priceOfferedNrs: 75,
        quantityKg: 1500,
        deliveryDate: '2026-08-18',
        status: 'Pending',
        submittedAt: '2026-08-06'
      }
    ]
  },
  {
    id: 'demand_2',
    code: '#demand_seed_2',
    cropName: 'Ginger (Aduwa)',
    cropNepaliName: 'अदुवा',
    quantityKg: 5000,
    targetPriceCeiling: 105,
    buyerName: 'Shyam Shrestha',
    buyerOrg: 'Kathmandu Resort & Catering Group',
    buyerLocation: 'Kathmandu',
    targetDays: 30,
    category: 'Spices',
    bidsCount: 2,
    status: 'Open',
    createdDate: '2026-08-03',
    description: 'High-oil content washed organic ginger roots for export processing batch.',
    bids: [
      {
        id: 'bid-3',
        contractId: 'demand_2',
        sellerName: 'Krishna Bahadur Sunuwar',
        cooperativeName: 'Makwanpur Hill Spice Syndicate',
        region: 'Makwanpur',
        priceOfferedNrs: 102,
        quantityKg: 5000,
        deliveryDate: '2026-08-25',
        status: 'Pending',
        submittedAt: '2026-08-07'
      }
    ]
  }
];

export const INITIAL_COLD_CHAIN_TRUCKS: ColdChainRoute[] = [
  {
    id: 'truck-101',
    truckNumber: 'BA 3 KHA 8892',
    driverName: 'Sujan Lama',
    origin: 'Dhading Besi Hub',
    destination: 'Kalimati Wholesale Yard',
    currentLocation: 'Prithvi Highway - Galchi',
    tempCelsius: 4.2,
    targetTempCelsius: 4.0,
    humidityPercent: 88,
    capacityKg: 8000,
    cargoDescription: 'Chilled Organic Tomatoes & Green Beans',
    etaMinutes: 45,
    status: 'On Route'
  },
  {
    id: 'truck-102',
    truckNumber: 'PRO-03-001 KHA 4110',
    driverName: 'Dipendra KC',
    origin: 'Palung Cold Storage',
    destination: 'Balkhu Produce Depot',
    currentLocation: 'Naubise Incline',
    tempCelsius: 5.8,
    targetTempCelsius: 5.0,
    humidityPercent: 82,
    capacityKg: 12000,
    cargoDescription: 'Grade-A Seed Potato & Cabbage',
    etaMinutes: 70,
    status: 'On Route'
  }
];

export const INITIAL_KYC_USERS: KycVerificationUser[] = [
  {
    id: 'kyc-1',
    fullName: 'Rameshwor Bhattarai',
    entityName: 'Suryodaya Krishi Sahakari Sanstha',
    roleType: 'Farmer Co-op',
    citizenshipNo: '27-01-72-04981',
    district: 'Kavrepalanchok',
    registrationNo: 'REG-2078-KVR-104',
    status: 'Pending',
    submittedDate: '2026-08-07',
    documents: ['Co-op Registration.pdf', 'Chairman Citizenship.jpg']
  },
  {
    id: 'kyc-2',
    fullName: 'Saraswati Gurung',
    entityName: 'Himalayan Cold Storage & Wholesale Traders',
    roleType: 'Wholesaler',
    citizenshipNo: '18-02-76-11029',
    district: 'Kathmandu',
    registrationNo: 'PAN-600293841',
    status: 'Pending',
    submittedDate: '2026-08-08',
    documents: ['PAN Certificate.pdf', 'Tax Clearance 2082.pdf']
  }
];

export const INITIAL_FEEDBACK: PlatformFeedbackItem[] = [
  {
    id: 'fb-1',
    userName: 'Hari Prasad Sharma',
    userRole: 'Kalimati Yard Supervisor',
    rating: 5,
    category: 'Price Entry UI',
    message: 'The new regional index auto-population makes morning wholesale price logging twice as fast.',
    date: '2026-08-07',
    resolved: true
  },
  {
    id: 'fb-2',
    userName: 'Gita Karki',
    userRole: 'Dhading Co-op Secretary',
    rating: 4,
    category: 'Logistics',
    message: 'Request real-time SMS alerts for temperature deviations on Prithvi highway cold-chain trucks.',
    date: '2026-08-08',
    resolved: false
  },
  {
    id: 'fb-3',
    userName: 'Binod Tamang',
    userRole: 'Institutional Buyer',
    rating: 5,
    category: 'Payment',
    message: 'VAT split-settlement receipts feature saved our accounting team huge auditing time.',
    date: '2026-08-08',
    resolved: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-801',
    timestamp: '2026-08-08 11:05:12',
    actor: 'admin@agritech.gov.np',
    role: 'ADMIN',
    action: 'PRICE_INDEX_PUBLISH',
    details: 'Published daily index for Tomato (Golbheda) @ NRs. 83/KG [Kathmandu]',
    ipAddress: '103.10.28.4',
    severity: 'info'
  },
  {
    id: 'log-802',
    timestamp: '2026-08-08 10:48:30',
    actor: 'system_daemon',
    role: 'SYSTEM',
    action: 'COLD_CHAIN_SYNC',
    details: 'GPS Telemetry sync complete for 14 active refrigerated transport units',
    ipAddress: '10.0.4.12',
    severity: 'info'
  },
  {
    id: 'log-803',
    timestamp: '2026-08-08 09:15:04',
    actor: 'shyam.shrestha@resort.np',
    role: 'BUYER',
    action: 'FORWARD_CONTRACT_POST',
    details: 'Created demand post #demand_seed_2 for Ginger (Aduwa) [5,000 KG]',
    ipAddress: '202.70.72.18',
    severity: 'info'
  }
];

export const INITIAL_API_LOGS: ApiLogItem[] = [
  {
    id: 'api-1',
    timestamp: '11:09:44',
    method: 'POST',
    endpoint: '/api/v1/market-indices/publish',
    statusCode: 200,
    durationMs: 42,
    payloadSize: '1.2 KB'
  },
  {
    id: 'api-2',
    timestamp: '11:08:12',
    method: 'GET',
    endpoint: '/api/v1/cold-chain/telemetry/truck-101',
    statusCode: 200,
    durationMs: 18,
    payloadSize: '0.8 KB'
  },
  {
    id: 'api-3',
    timestamp: '11:05:00',
    method: 'GET',
    endpoint: '/api/v1/forward-contracts/list?status=Open',
    statusCode: 200,
    durationMs: 29,
    payloadSize: '3.4 KB'
  }
];
