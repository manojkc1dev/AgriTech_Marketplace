import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  User, MarketPrice, ProduceListing, DemandPost, Order, 
  Negotiation, Cooperative, ApiLogEntry, UserRole, ListingStatus, OrderStatus, SoilLog, HarvestRecord,
  PriceAlert, PriceNotification, CooperativeMessage, CooperativeAnnouncement, PlatformFeedback,
  ScanHistoryItem, ScanType, DemandBid, LogisticsDispatch, Invoice, InstitutionalSubscription,
  AuditLog, SupportTicket, SupportTicketResponse
} from "./src/types";

// DB file path
const DB_PATH = path.join(process.cwd(), "db.json");

function getInitialDemandBids(): DemandBid[] {
  return [
    {
      id: "bid_1",
      demandId: "d1",
      farmerId: "ram_farmer",
      farmerName: "Ram Bahadur Tamang",
      farmerDistrict: "Dhading",
      bidPricePerUnit: 62,
      deliveryDaysRequired: 25,
      depositLocked: 5000,
      notes: "Can fulfill 10 Tons of Grade-A Organic Tomato from Dhading Dhunibesi farms.",
      status: "pending",
      created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
    }
  ];
}

function getInitialLogisticsDispatches(): LogisticsDispatch[] {
  return [
    {
      id: "disp_101",
      orderId: "o1",
      crop: "Tomato (Golbheda)",
      quantity: 500,
      unit: "KG",
      originDistrict: "Dhading",
      destinationDistrict: "Kathmandu",
      route: "Prithvi Highway",
      vehicleNumber: "BA 3 KHA 8491",
      driverName: "Hari Bahadur Thapa",
      driverPhone: "+977-9851-098765",
      coldChainTempC: 4.2,
      status: "in_transit",
      departureTime: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
      estimatedArrival: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
      currentCheckpoint: "Naubise Checkpost, Dhading"
    }
  ];
}

function getInitialInvoices(): Invoice[] {
  return [
    {
      id: "inv_101",
      invoiceNumber: "VAT-NP-2026-0081",
      orderId: "o1",
      buyerName: "Shyam Shrestha (Kathmandu Resort)",
      farmerName: "Ram Bahadur Tamang",
      cooperativeName: "Dhading Farmers Union",
      crop: "Tomato (Golbheda)",
      quantity: 500,
      unit: "KG",
      pricePerUnit: 65,
      subtotal: 32500,
      logisticsFee: 1500,
      cooperativeServiceFee: 650,
      vatAmount: 4225,
      totalAmount: 38875,
      paymentMethod: "ConnectIPS",
      status: "paid",
      issuedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      settledAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString()
    }
  ];
}

function getInitialSubscriptions(): InstitutionalSubscription[] {
  return [
    {
      id: "sub_101",
      buyerId: "shyam_buyer",
      buyerName: "Shyam Shrestha",
      buyerOrganization: "Kathmandu Resort & Hotel",
      crop: "Tomato (Golbheda)",
      weeklyQuantity: 300,
      unit: "KG",
      agreedPricePerUnit: 60,
      deliveryDay: "Monday",
      district: "Kathmandu",
      status: "active",
      startDate: "2026-01-01",
      nextDeliveryDate: new Date(Date.now() + 3600 * 1000 * 24 * 4).toISOString().split('T')[0]
    }
  ];
}

function getInitialAuditLogs(): AuditLog[] {
  return [
    {
      id: "audit_1",
      timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      userId: "ram_farmer",
      userName: "Ram Bahadur Tamang",
      userRole: "farmer",
      action: "BID_SUBMITTED",
      category: "negotiation",
      details: "Submitted forward contract bid of NRs 62/KG for Demand #d1 (10 Tons Organic Tomato).",
      ipAddress: "202.45.140.12"
    },
    {
      id: "audit_2",
      timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      userId: "shyam_buyer",
      userName: "Shyam Shrestha",
      userRole: "buyer",
      action: "LOGISTICS_DISPATCH_STARTED",
      category: "dispatch",
      details: "Cold-chain truck BA 3 KHA 8491 assigned for Order #o1 on Prithvi Highway.",
      ipAddress: "110.44.115.8"
    }
  ];
}

function getInitialSupportTickets(): SupportTicket[] {
  return [
    {
      id: "ticket_101",
      userId: "shyam_buyer",
      userName: "Shyam Shrestha",
      userRole: "buyer",
      orderId: "o1",
      category: "shipping_delay",
      subject: "Truck delay notice due to Naubise highway landslide",
      description: "Driver Hari Bahadur reported a 2-hour monsoon roadblock near Naubise. Requesting updated estimated arrival time for hotel kitchen staging.",
      priority: "medium",
      status: "in_progress",
      created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      responses: [
        {
          id: "resp_1",
          senderName: "Dhading Logistics Coordinator",
          userRole: "cooperative",
          message: "Road clearance crew in progress. Cold-chain cooling system active at 4.2°C.",
          timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
        }
      ]
    }
  ];
}

// Helper to load database
function loadDb(): {
  users: User[];
  marketPrices: MarketPrice[];
  produceListings: ProduceListing[];
  demandPosts: DemandPost[];
  orders: Order[];
  negotiations: Negotiation[];
  cooperatives: Cooperative[];
  soilLogs: SoilLog[];
  harvestRecords: HarvestRecord[];
  priceAlerts: PriceAlert[];
  priceNotifications: PriceNotification[];
  cooperativeMessages: CooperativeMessage[];
  cooperativeAnnouncements: CooperativeAnnouncement[];
  platformFeedback: PlatformFeedback[];
  scanHistory: ScanHistoryItem[];
  demandBids: DemandBid[];
  logisticsDispatches: LogisticsDispatch[];
  invoices: Invoice[];
  subscriptions: InstitutionalSubscription[];
  auditLogs: AuditLog[];
  supportTickets: SupportTicket[];
} {
  if (!fs.existsSync(DB_PATH)) {
    // Return seed data
    const seed = getSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed as any;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.soilLogs) parsed.soilLogs = [];
    if (!parsed.harvestRecords) parsed.harvestRecords = [];
    if (!parsed.priceAlerts) parsed.priceAlerts = [];
    if (!parsed.priceNotifications) parsed.priceNotifications = [];
    if (!parsed.cooperativeMessages) parsed.cooperativeMessages = [];
    if (!parsed.cooperativeAnnouncements) parsed.cooperativeAnnouncements = [];
    if (!parsed.platformFeedback) parsed.platformFeedback = [];
    if (!parsed.scanHistory) parsed.scanHistory = [];
    
    // New B2B & Supply Chain Hub Collections
    if (!parsed.demandBids) parsed.demandBids = getInitialDemandBids();
    if (!parsed.logisticsDispatches) parsed.logisticsDispatches = getInitialLogisticsDispatches();
    if (!parsed.invoices) parsed.invoices = getInitialInvoices();
    if (!parsed.subscriptions) parsed.subscriptions = getInitialSubscriptions();
    if (!parsed.auditLogs) parsed.auditLogs = getInitialAuditLogs();
    if (!parsed.supportTickets) parsed.supportTickets = getInitialSupportTickets();

    if (!parsed.marketPrices || parsed.marketPrices.length < 150) {
      const seed = getSeedData();
      parsed.marketPrices = seed.marketPrices;
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (e) {
    console.error("Error reading DB file, resetting:", e);
    const seed = getSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed as any;
  }
}

// Helper to save database
function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving DB file:", e);
  }
}

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Response schema for AI Harvest Forecaster
const forecastResponseSchema = {
  type: Type.OBJECT,
  properties: {
    yieldEstimate: {
      type: Type.INTEGER,
      description: "Estimated yield quantity in KG based on acreage and historical district performance"
    },
    plantingCycle: {
      type: Type.STRING,
      description: "Proposed planting cycle name (e.g., 'Spring Sowing', 'Autumn Monsoon Sowing')"
    },
    optimalPlantingDate: {
      type: Type.STRING,
      description: "Optimal dates or weeks to sow (e.g., 'First week of September')"
    },
    optimalHarvestDate: {
      type: Type.STRING,
      description: "Optimal expected dates or weeks to harvest (e.g., 'Late December to mid-January')"
    },
    riskAssessment: {
      type: Type.STRING,
      description: "Analysis of major localized risks, like pests, frost, hail, monsoon saturation, specific to this crop and district"
    },
    rationale: {
      type: Type.STRING,
      description: "Brief explanation explaining why this planting cycle, soil, and weather combination produces this outcome in the district"
    },
    actionableSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "3 to 4 sequential, actionable, step-by-step recommendations for the farmer to maximize yield"
    }
  },
  required: [
    "yieldEstimate",
    "plantingCycle",
    "optimalPlantingDate",
    "optimalHarvestDate",
    "riskAssessment",
    "rationale",
    "actionableSteps"
  ]
};

// Response schema for AI Climate Advisor
const advisorResponseSchema = {
  type: Type.OBJECT,
  properties: {
    upcomingSeason: {
      type: Type.STRING,
      description: "Name of the upcoming agricultural season (e.g., 'Winter (Mangsir - Falgun)', 'Spring Sowing')"
    },
    climateTrendSummary: {
      type: Type.STRING,
      description: "A professional analysis of current climate trends (temperature, rainfall, soil temperature, relative humidity anomalies) in the selected district"
    },
    recommendedCrops: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          cropName: {
            type: Type.STRING,
            description: "The name of the suggested crop (e.g., 'Potato (Alu)', 'Cauliflower (Kauli)')"
          },
          variety: {
            type: Type.STRING,
            description: "Suggested high-yield varieties suited for this district and upcoming weather (e.g., 'Srijana', 'Manushi')"
          },
          yieldPotential: {
            type: Type.STRING,
            description: "Estimated yield potential per Ropani (e.g., '800 - 1,200 KG')"
          },
          daysToHarvest: {
            type: Type.STRING,
            description: "Maturity duration (e.g., '90 - 110 days')"
          },
          irrigationRequirement: {
            type: Type.STRING,
            description: "Irrigation levels needed (low, medium, high) with a brief climate adaptation tip"
          },
          marketDemandTrend: {
            type: Type.STRING,
            description: "Expected market demand and price indicators for this crop during the target harvest season"
          },
          agronomicTips: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "2 to 3 high-precision tips for sowing, pest management, or protective farming (e.g., plastic tunneling)"
          }
        },
        required: [
          "cropName",
          "variety",
          "yieldPotential",
          "daysToHarvest",
          "irrigationRequirement",
          "marketDemandTrend",
          "agronomicTips"
        ]
      },
      description: "Top 3 high-yield crops specifically suited for this upcoming season"
    },
    climateAdaptationAdvice: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "3 to 4 climate-smart adaptation steps for the upcoming season (e.g., mulching, drip irrigation, protective tunnels)"
    }
  },
  required: [
    "upcomingSeason",
    "climateTrendSummary",
    "recommendedCrops",
    "climateAdaptationAdvice"
  ]
};

// List of API Logs (kept in memory, max 100 entries)
let apiLogs: ApiLogEntry[] = [];

function logApiCall(
  method: string, 
  url: string, 
  headers: Record<string, string>, 
  requestBody: any, 
  responseStatus: number, 
  responseBody: any
) {
  if (url.startsWith("/api/logs")) {
    return;
  }
  const log: ApiLogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    method,
    url,
    headers: {
      authorization: headers.authorization || "",
      "content-type": headers["content-type"] || "",
    },
    requestBody,
    responseStatus,
    responseBody
  };
  apiLogs.unshift(log);
  if (apiLogs.length > 100) {
    apiLogs = apiLogs.slice(0, 100);
  }
}

const app = express();
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  let responseBody: any = null;

  res.send = function (body) {
    try {
      responseBody = JSON.parse(body);
    } catch {
      responseBody = body;
    }
    logApiCall(
      req.method,
      req.originalUrl || req.url,
      req.headers as Record<string, string>,
      req.body,
      res.statusCode,
      responseBody
    );
    return originalSend.apply(this, arguments as any);
  };
  next();
});

// GET /api/logs - Retrieve in-memory API traffic inspection logs
app.get("/api/logs", (req, res) => {
  res.json(apiLogs);
});

// POST /api/logs/clear - Clear in-memory API traffic inspection logs
app.post("/api/logs/clear", (req, res) => {
  apiLogs = [];
  res.json({ message: "API logs cleared successfully" });
});

// Authentication middleware
interface AuthenticatedRequest extends express.Request {
  user?: User;
}

const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token is required" });
    return;
  }

  // Our simple bearer token format is "JWT-{userId}-{role}-{timestamp}"
  const parts = token.split("-");
  if (parts[0] !== "JWT" || parts.length < 3) {
    res.status(403).json({ error: "Invalid token format" });
    return;
  }

  const userId = parts[1];
  const db = loadDb();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    res.status(403).json({ error: "User associated with token not found" });
    return;
  }

  req.user = user;
  next();
};

// --- AUTHENTICATION API ---

// POST /api/auth/register/
app.post("/api/auth/register", (req, res) => {
  const { username, role, phone, district, fullName, email, password, cooperativeId } = req.body;

  if (!username || !role || !phone || !district || !fullName) {
    res.status(400).json({ error: "Missing required registration fields" });
    return;
  }

  if (!password || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters long" });
    return;
  }

  const allowedRoles: UserRole[] = ["farmer", "buyer", "admin", "cooperative"];
  if (!allowedRoles.includes(role)) {
    res.status(400).json({ error: "Invalid role specified" });
    return;
  }

  const db = loadDb();

  // Check if username already exists
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    res.status(400).json({ error: "Username is already taken" });
    return;
  }

  const newUser: User = {
    id: "user_" + Math.random().toString(36).substr(2, 9),
    username,
    role,
    phone,
    email: email || "",
    password,
    district,
    verified: role === "admin" || role === "buyer" || role === "cooperative",
    fullName,
    cooperativeId: role === "cooperative" ? cooperativeId : undefined
  };

  db.users.push(newUser);
  saveDb(db);

  // Generate simple token
  const token = `JWT-${newUser.id}-${newUser.role}-${Date.now()}`;

  res.status(201).json({
    message: "Registration successful",
    access_token: token,
    refresh_token: `REFRESH-${newUser.id}-${Date.now()}`,
    user: newUser
  });
});

// POST /api/auth/login/
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  const db = loadDb();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    res.status(401).json({ error: "User credentials not found" });
    return;
  }

  // If user registered with a password, enforce password check
  if (user.password && password && user.password !== password) {
    res.status(401).json({ error: "Invalid password credentials" });
    return;
  }

  if (user.password && !password) {
    res.status(401).json({ error: "Password is required for this account" });
    return;
  }

  const token = `JWT-${user.id}-${user.role}-${Date.now()}`;

  res.json({
    message: "Login successful",
    access_token: token,
    refresh_token: `REFRESH-${user.id}-${Date.now()}`,
    user
  });
});

// POST /api/auth/refresh/
app.post("/api/auth/refresh", (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    res.status(400).json({ error: "Refresh token is required" });
    return;
  }

  const parts = refresh_token.split("-");
  if (parts[0] !== "REFRESH" || parts.length < 2) {
    res.status(403).json({ error: "Invalid refresh token format" });
    return;
  }

  const userId = parts[1];
  const db = loadDb();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    res.status(403).json({ error: "Invalid refresh token" });
    return;
  }

  const token = `JWT-${user.id}-${user.role}-${Date.now()}`;
  res.json({
    access_token: token,
    refresh_token: `REFRESH-${user.id}-${Date.now()}`
  });
});

// GET /api/users/me - Fetch current user profile with KYC status
app.get("/api/users/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  const user = db.users.find(u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

// POST /api/users/verify-kyc - Submit mandatory Citizenship & National ID Card for verification
app.post("/api/users/verify-kyc", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { citizenshipNumber, citizenshipDocUrl, nationalIdNumber, nationalIdDocUrl } = req.body;

  if (!citizenshipNumber || !citizenshipDocUrl || !nationalIdNumber || !nationalIdDocUrl) {
    res.status(400).json({ 
      error: "Mandatory verification requires both Citizenship Card Number & Document upload AND National Identity Card (NIN) Number & Document upload." 
    });
    return;
  }

  const db = loadDb();
  const userIndex = db.users.findIndex(u => u.id === req.user?.id);
  if (userIndex === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    verificationStatus: 'pending',
    citizenshipNumber,
    citizenshipDocUrl,
    nationalIdNumber,
    nationalIdDocUrl,
    verificationSubmittedAt: new Date().toISOString(),
    verificationNotes: 'Submitted and awaiting Super Admin / Admin approval.',
    verified: false
  };

  saveDb(db);

  console.log(`AUDIT: User submitted KYC documents for verification: ${req.user.id} (${req.user.fullName})`);

  res.status(200).json({
    message: "Citizenship and National Identity Card documents submitted successfully. Verification is pending Admin/Super Admin approval.",
    user: db.users[userIndex]
  });
});

// PUT /api/users/profile - Update full user profile details (username, password, photo, DOB, address, district, etc.)
app.put("/api/users/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const {
    fullName,
    username,
    currentPassword,
    newPassword,
    phone,
    email,
    district,
    address,
    dob,
    profilePic,
    citizenshipNumber,
    citizenshipDocUrl,
    nationalIdNumber,
    nationalIdDocUrl
  } = req.body;

  const db = loadDb();
  const userIndex = db.users.findIndex(u => u.id === req.user?.id);
  if (userIndex === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const existingUser = db.users[userIndex];

  // If changing username, check for duplicates among other users
  if (username && username.trim().toLowerCase() !== existingUser.username.toLowerCase()) {
    const isTaken = db.users.some(u => u.id !== existingUser.id && u.username.toLowerCase() === username.trim().toLowerCase());
    if (isTaken) {
      res.status(400).json({ error: "Username is already taken by another account." });
      return;
    }
  }

  // If changing password, verify current password if set
  let updatedPassword = existingUser.password;
  if (newPassword && newPassword.trim().length > 0) {
    if (existingUser.password && currentPassword !== existingUser.password) {
      res.status(400).json({ error: "Current password is incorrect." });
      return;
    }
    if (newPassword.trim().length < 4) {
      res.status(400).json({ error: "New password must be at least 4 characters long." });
      return;
    }
    updatedPassword = newPassword.trim();
  }

  db.users[userIndex] = {
    ...existingUser,
    fullName: fullName !== undefined ? fullName.trim() : existingUser.fullName,
    username: username !== undefined ? username.trim() : existingUser.username,
    password: updatedPassword,
    phone: phone !== undefined ? phone.trim() : existingUser.phone,
    email: email !== undefined ? email.trim() : existingUser.email,
    district: district !== undefined ? district.trim() : existingUser.district,
    address: address !== undefined ? address.trim() : existingUser.address,
    dob: dob !== undefined ? dob : existingUser.dob,
    profilePic: profilePic !== undefined ? profilePic : existingUser.profilePic,
    citizenshipNumber: citizenshipNumber !== undefined ? citizenshipNumber : existingUser.citizenshipNumber,
    citizenshipDocUrl: citizenshipDocUrl !== undefined ? citizenshipDocUrl : existingUser.citizenshipDocUrl,
    nationalIdNumber: nationalIdNumber !== undefined ? nationalIdNumber : existingUser.nationalIdNumber,
    nationalIdDocUrl: nationalIdDocUrl !== undefined ? nationalIdDocUrl : existingUser.nationalIdDocUrl,
  };

  saveDb(db);

  console.log(`AUDIT: Profile updated for user ${existingUser.id} (${db.users[userIndex].fullName})`);

  res.json({
    message: "Profile details updated successfully!",
    user: db.users[userIndex]
  });
});

// PUT /api/user/notifications
app.put("/api/user/notifications", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { smsDemandAlerts, inAppDemandAlerts, smsWeatherAlerts, inAppWeatherAlerts } = req.body;
  const db = loadDb();
  const userIndex = db.users.findIndex(u => u.id === req.user?.id);
  if (userIndex === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    smsDemandAlerts: smsDemandAlerts === undefined ? db.users[userIndex].smsDemandAlerts : !!smsDemandAlerts,
    inAppDemandAlerts: inAppDemandAlerts === undefined ? db.users[userIndex].inAppDemandAlerts : !!inAppDemandAlerts,
    smsWeatherAlerts: smsWeatherAlerts === undefined ? db.users[userIndex].smsWeatherAlerts : !!smsWeatherAlerts,
    inAppWeatherAlerts: inAppWeatherAlerts === undefined ? db.users[userIndex].inAppWeatherAlerts : !!inAppWeatherAlerts,
  };

  saveDb(db);

  res.json({
    message: "Notification preferences updated successfully",
    user: db.users[userIndex]
  });
});

// --- MARKET PRICES API ---

// GET /api/prices/
app.get("/api/prices", (req, res) => {
  const { region, district, crop, category, date } = req.query;
  const db = loadDb();

  let prices = db.marketPrices;

  if (region) {
    prices = prices.filter(p => p.region.toLowerCase() === (region as string).toLowerCase());
  }
  if (district) {
    const dLower = (district as string).toLowerCase();
    prices = prices.filter(p => {
      if (p.district) return p.district.toLowerCase() === dLower;
      if (dLower === "kathmandu") return p.region === "Kathmandu";
      if (dLower === "dhading" || dLower === "makwanpur") return p.region === "Hill";
      return true;
    });
  }
  if (category) {
    const catLower = (category as string).toLowerCase();
    prices = prices.filter(p => {
      if (p.category) return p.category.toLowerCase() === catLower;
      const c = p.crop.toLowerCase();
      if (catLower === "vegetables") return c.includes("potato") || c.includes("tomato") || c.includes("cauliflower") || c.includes("cabbage") || c.includes("radish") || c.includes("alu") || c.includes("golbheda") || c.includes("kauli");
      if (catLower === "fruits") return c.includes("apple") || c.includes("banana") || c.includes("orange") || c.includes("syau") || c.includes("kera") || c.includes("suntala");
      if (catLower === "grains") return c.includes("rice") || c.includes("paddy") || c.includes("maize") || c.includes("wheat") || c.includes("dhan") || c.includes("makkai") || c.includes("gahu");
      if (catLower === "spices") return c.includes("ginger") || c.includes("onion") || c.includes("garlic") || c.includes("chili") || c.includes("aduwa") || c.includes("pyaj") || c.includes("lasun");
      if (catLower === "pulses") return c.includes("lentil") || c.includes("dal") || c.includes("mustard") || c.includes("tori");
      return true;
    });
  }
  if (crop) {
    prices = prices.filter(p => p.crop.toLowerCase().includes((crop as string).toLowerCase()));
  }
  if (date) {
    prices = prices.filter(p => p.date === (date as string));
  }

  // Sort by date descending
  prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(prices);
});

// POST /api/prices/ (admin only)
app.post("/api/prices", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Only admins are authorized to submit market prices" });
    return;
  }

  const { crop, region, price_per_unit, unit, date, source_market } = req.body;

  if (!crop || !region || !price_per_unit || !unit || !date || !source_market) {
    res.status(400).json({ error: "Missing required price fields" });
    return;
  }

  const validRegions = ["Kathmandu", "Terai", "Hill"];
  if (!validRegions.includes(region)) {
    res.status(400).json({ error: "Invalid region. Choose from: Kathmandu, Terai, Hill" });
    return;
  }

  const db = loadDb();
  const newPrice: MarketPrice = {
    id: "price_" + Math.random().toString(36).substr(2, 9),
    crop,
    region: region as any,
    price_per_unit: Number(price_per_unit),
    unit,
    date,
    source_market
  };

  db.marketPrices.push(newPrice);

  // Check active price alerts for this crop and region/district
  const triggeredNotifications: PriceNotification[] = [];
  const activeAlerts = db.priceAlerts.filter(alert => {
    const cropMatch = alert.crop.toLowerCase() === crop.toLowerCase();
    const regionMatch = !alert.region || alert.region === "all" || alert.region.toLowerCase() === region.toLowerCase();
    const districtMatch = !alert.district || alert.district === "all" || alert.district.toLowerCase() === region.toLowerCase();
    return alert.isActive && cropMatch && (regionMatch || districtMatch);
  });

  for (const alert of activeAlerts) {
    const isTriggered = 
      (alert.criteria === "above" && Number(price_per_unit) >= alert.priceThreshold) ||
      (alert.criteria === "below" && Number(price_per_unit) <= alert.priceThreshold);

    if (isTriggered) {
      const criteriaText = alert.criteria === "above" ? "risen above" : "fallen below";
      const subject = `🚨 [Price Alert] ${crop} in ${region} reaches your target!`;
      const emailBody = `Namaste,

This is an automated notification that the crop "${crop}" in region/district "${region}" (${source_market}) has ${criteriaText} your set threshold of NRs. ${alert.priceThreshold}.

Current Market Rate: NRs. ${price_per_unit} / ${unit}
Your Alert Condition: ${alert.criteria} NRs. ${alert.priceThreshold}

Recipient email: ${alert.email || 'Subscribed Buyer'}

You can visit the KrishiSajha platform to browse the latest B2B farmer listings and negotiate deals.

Warm regards,
KrishiSajha Price Alerts Engine`;

      const notification: PriceNotification = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: alert.userId,
        alertId: alert.id,
        title: "🚨 Price Alert Triggered!",
        message: `The price of ${crop} in ${region} (${source_market}) has ${criteriaText} your threshold of NRs. ${alert.priceThreshold}. Current rate is NRs. ${price_per_unit} / ${unit}.`,
        crop,
        currentPrice: Number(price_per_unit),
        threshold: alert.priceThreshold,
        criteria: alert.criteria,
        region,
        district: alert.district || region,
        emailSentTo: alert.email,
        emailSubject: subject,
        emailBody,
        isRead: false,
        created_at: new Date().toISOString()
      };
      db.priceNotifications.push(notification);
      triggeredNotifications.push(notification);
    }
  }

  saveDb(db);

  res.status(201).json({
    message: "Market price logged successfully",
    price: newPrice,
    triggeredCount: triggeredNotifications.length
  });
});

// --- PRODUCE LISTINGS API ---

// GET /api/listings/
app.get("/api/listings", (req, res) => {
  const { own, farmerId, crop, status } = req.query;
  const db = loadDb();

  let listings = db.produceListings.map(listing => {
    const farmer = db.users.find(u => u.id === listing.farmerId);
    return {
      ...listing,
      farmerName: farmer ? farmer.fullName : "Unknown Farmer",
      district: farmer ? farmer.district : "Unknown District"
    };
  });

  if (farmerId) {
    listings = listings.filter(l => l.farmerId === farmerId);
  } else if (own) {
    // Client must pass authorization header, let's look for it
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      const userId = token.split("-")[1];
      listings = listings.filter(l => l.farmerId === userId);
    }
  }

  if (crop) {
    listings = listings.filter(l => l.crop.toLowerCase().includes((crop as string).toLowerCase()));
  }

  if (status) {
    listings = listings.filter(l => l.status === status);
  }

  res.json(listings);
});

// POST /api/listings/ (farmer only)
app.post("/api/listings", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "farmer") {
    res.status(403).json({ error: "Only farmers are authorized to post listings" });
    return;
  }

  if (!req.user.verified && req.user.verificationStatus !== 'verified') {
    res.status(403).json({ 
      error: "Mandatory verification required: Upload your Citizenship Card & National Identity Card for Super Admin/Admin approval before listing products for sale.",
      kycRequired: true,
      verificationStatus: req.user.verificationStatus || 'unverified'
    });
    return;
  }

  const { crop, quantity, unit, target_price } = req.body;

  if (!crop || !quantity || !unit || !target_price) {
    res.status(400).json({ error: "Missing listing fields" });
    return;
  }

  const db = loadDb();
  const newListing: ProduceListing = {
    id: "listing_" + Math.random().toString(36).substr(2, 9),
    farmerId: req.user.id,
    crop,
    quantity: Number(quantity),
    unit,
    target_price: Number(target_price),
    status: "available",
    created_at: new Date().toISOString()
  };

  db.produceListings.push(newListing);

  // Trigger price alerts for this listed crop in the farmer's district
  const farmerDistrict = req.user?.district || "Nepal";
  const activeAlerts = db.priceAlerts.filter((alert: PriceAlert) => {
    const cropMatch = alert.crop.toLowerCase() === crop.toLowerCase();
    const districtMatch = !alert.district || alert.district === "all" || alert.district.toLowerCase() === farmerDistrict.toLowerCase();
    return alert.isActive && cropMatch && districtMatch;
  });

  activeAlerts.forEach((alert: PriceAlert) => {
    const isTriggered = 
      (alert.criteria === "below" && Number(target_price) <= alert.priceThreshold) ||
      (alert.criteria === "above" && Number(target_price) >= alert.priceThreshold);

    if (isTriggered) {
      const criteriaText = alert.criteria === "above" ? "risen above" : "fallen below";
      const subject = `🚨 [Price Alert] ${crop} in ${farmerDistrict} meets your target!`;
      const emailBody = `Namaste,

A new B2B crop listing matching your price alert preference has been posted on KrishiSajha!

Listing Details:
- Crop: ${crop}
- Price: NRs. ${target_price} / ${unit}
- Quantity: ${quantity} ${unit}
- District: ${farmerDistrict}
- Farmer: ${req.user?.fullName || "Farmer"}

Your Alert Threshold: NRs. ${alert.priceThreshold} (${alert.criteria})
Subscribed Email: ${alert.email || "Subscribed Buyer"}

Please visit your KrishiSajha Buyer Dashboard to check the listing, start a direct counter-offer negotiation, or buy instantly.

Best regards,
KrishiSajha Notification Engine`;

      const notification: PriceNotification = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: alert.userId,
        alertId: alert.id,
        title: "🚨 Price Alert: " + crop + " listed in " + farmerDistrict,
        message: `A new farmer listing for ${crop} in ${farmerDistrict} is available at NRs. ${target_price}/${unit}, which meets your threshold of NRs. ${alert.priceThreshold}.`,
        crop,
        currentPrice: Number(target_price),
        threshold: alert.priceThreshold,
        criteria: alert.criteria,
        region: farmerDistrict,
        district: farmerDistrict,
        emailSentTo: alert.email,
        emailSubject: subject,
        emailBody,
        isRead: false,
        created_at: new Date().toISOString()
      };
      db.priceNotifications.push(notification);
    }
  });

  saveDb(db);

  res.status(201).json({
    message: "Crop listed successfully",
    listing: newListing
  });
});

// PATCH /api/listings/:id/ (farmer only)
app.patch("/api/listings/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, target_price, quantity } = req.body;
  const db = loadDb();

  const listingIndex = db.produceListings.findIndex(l => l.id === id);
  if (listingIndex === -1) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const listing = db.produceListings[listingIndex];

  // Verify ownership
  if (req.user?.role !== "admin" && listing.farmerId !== req.user?.id) {
    res.status(403).json({ error: "Unauthorized to edit this listing" });
    return;
  }

  if (status) {
    const validStatuses: ListingStatus[] = ["available", "reserved", "sold"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    listing.status = status;
  }

  if (target_price !== undefined) {
    listing.target_price = Number(target_price);
  }

  if (quantity !== undefined) {
    listing.quantity = Number(quantity);
  }

  db.produceListings[listingIndex] = listing;
  saveDb(db);

  res.json({
    message: "Listing updated successfully",
    listing
  });
});

// --- SOIL & NUTRIENT LOGS API ---

// GET /api/soil-logs
app.get("/api/soil-logs", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  const farmerLogs = db.soilLogs.filter(log => log.farmerId === req.user?.id);
  
  // Sort by date descending (newest log first)
  farmerLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  res.json(farmerLogs);
});

// POST /api/soil-logs
app.post("/api/soil-logs", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "farmer") {
    res.status(403).json({ error: "Only farmers can manage soil and nutrient logs" });
    return;
  }

  const { cropBatch, logType, date, details } = req.body;

  if (!cropBatch || !logType || !date || !details) {
    res.status(400).json({ error: "Missing required log fields (cropBatch, logType, date, details)" });
    return;
  }

  if (logType !== "fertilizer" && logType !== "soil_test") {
    res.status(400).json({ error: "Invalid logType. Must be 'fertilizer' or 'soil_test'" });
    return;
  }

  const db = loadDb();
  const newLog: SoilLog = {
    id: "soil_" + Math.random().toString(36).substr(2, 9),
    farmerId: req.user.id,
    cropBatch,
    logType,
    date,
    details,
    created_at: new Date().toISOString()
  };

  db.soilLogs.push(newLog);
  saveDb(db);

  res.status(201).json({
    message: "Soil/nutrient log registered successfully",
    log: newLog
  });
});

// --- HARVEST RECORDS API ---

// GET /api/harvest-records
app.get("/api/harvest-records", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  // Return all harvest records so they can compare with regional benchmarks
  res.json(db.harvestRecords);
});

// POST /api/harvest-records
app.post("/api/harvest-records", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "farmer") {
    res.status(403).json({ error: "Only farmers can manage harvest records" });
    return;
  }

  const { crop, season, acreage, yieldQuantity, fertilizerUsed, weatherCondition, soilCondition } = req.body;

  if (!crop || !season || !acreage || !yieldQuantity || !fertilizerUsed || !weatherCondition || !soilCondition) {
    res.status(400).json({ error: "Missing required harvest fields" });
    return;
  }

  const db = loadDb();
  const newRecord: HarvestRecord = {
    id: "harvest_" + Math.random().toString(36).substr(2, 9),
    farmerId: req.user.id,
    crop,
    season,
    acreage: Number(acreage),
    yieldQuantity: Number(yieldQuantity),
    fertilizerUsed,
    weatherCondition,
    soilCondition,
    created_at: new Date().toISOString()
  };

  db.harvestRecords.push(newRecord);
  saveDb(db);

  res.status(201).json({
    message: "Harvest record registered successfully",
    record: newRecord
  });
});

// --- BUYER DEMANDS API ---

// GET /api/demands/
app.get("/api/demands", (req, res) => {
  const { crop, status } = req.query;
  const db = loadDb();

  let demands = db.demandPosts.map(demand => {
    const buyer = db.users.find(u => u.id === demand.buyerId);
    return {
      ...demand,
      buyerName: buyer ? buyer.fullName : "Unknown Buyer",
      district: buyer ? buyer.district : "Unknown District"
    };
  });

  if (crop) {
    demands = demands.filter(d => d.crop.toLowerCase().includes((crop as string).toLowerCase()));
  }

  if (status) {
    demands = demands.filter(d => d.status === status);
  }

  res.json(demands);
});

// POST /api/demands/ (buyer only)
app.post("/api/demands", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "buyer") {
    res.status(403).json({ error: "Only buyers can post demand requirements" });
    return;
  }

  if (!req.user.verified && req.user.verificationStatus !== 'verified') {
    res.status(403).json({ 
      error: "Mandatory verification required: Upload your Citizenship Card & National Identity Card for Super Admin/Admin approval before posting buy demands.",
      kycRequired: true,
      verificationStatus: req.user.verificationStatus || 'unverified'
    });
    return;
  }

  const { crop, quantity_needed, unit, offered_price } = req.body;

  if (!crop || !quantity_needed || !unit || !offered_price) {
    res.status(400).json({ error: "Missing demand fields" });
    return;
  }

  const db = loadDb();
  const newDemand: DemandPost = {
    id: "demand_" + Math.random().toString(36).substr(2, 9),
    buyerId: req.user.id,
    crop,
    quantity_needed: Number(quantity_needed),
    unit,
    offered_price: Number(offered_price),
    status: "active",
    created_at: new Date().toISOString()
  };

  db.demandPosts.push(newDemand);
  saveDb(db);

  res.status(201).json({
    message: "Demand requirement posted successfully",
    demand: newDemand
  });
});

// --- ORDERS & NEGOTIATIONS API ---

// GET /api/orders/
app.get("/api/orders", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = loadDb();
  const userId = req.user?.id;
  const role = req.user?.role;

  let orders = db.orders.map(order => {
    const farmer = db.users.find(u => u.id === order.farmerId);
    const buyer = db.users.find(u => u.id === order.buyerId);
    return {
      ...order,
      farmerName: farmer ? farmer.fullName : "Unknown Farmer",
      buyerName: buyer ? buyer.fullName : "Unknown Buyer"
    };
  });

  if (role === "farmer") {
    orders = orders.filter(o => o.farmerId === userId);
  } else if (role === "buyer") {
    orders = orders.filter(o => o.buyerId === userId);
  }

  res.json(orders);
});

// POST /api/orders/ (create order from listing or demand)
app.post("/api/orders", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user?.verified && req.user?.verificationStatus !== 'verified') {
    res.status(403).json({ 
      error: "Mandatory verification required: Upload your Citizenship Card & National Identity Card for Super Admin/Admin approval before buying or selling products.",
      kycRequired: true,
      verificationStatus: req.user?.verificationStatus || 'unverified'
    });
    return;
  }

  const { listingId, demandId, quantity, agreed_price } = req.body;

  if (!listingId && !demandId) {
    res.status(400).json({ error: "Provide either listingId or demandId to place an order" });
    return;
  }

  const db = loadDb();

  let farmerId = "";
  let buyerId = "";
  let crop = "";
  let unit = "";
  let resolvedListingId = listingId || "";
  let resolvedDemandId = demandId || null;

  if (listingId) {
    const listing = db.produceListings.find(l => l.id === listingId);
    if (!listing) {
      res.status(404).json({ error: "Source produce listing not found" });
      return;
    }
    if (listing.status !== "available") {
      res.status(400).json({ error: "This listing is no longer available" });
      return;
    }
    farmerId = listing.farmerId;
    buyerId = req.user?.id || "";
    crop = listing.crop;
    unit = listing.unit;

    if (req.user?.role !== "buyer") {
      res.status(403).json({ error: "Only buyers can place orders on produce listings" });
      return;
    }

    // Reserve listing
    listing.status = "reserved";
  } else if (demandId) {
    const demand = db.demandPosts.find(d => d.id === demandId);
    if (!demand) {
      res.status(404).json({ error: "Demand post not found" });
      return;
    }
    farmerId = req.user?.id || "";
    buyerId = demand.buyerId;
    crop = demand.crop;
    unit = demand.unit;

    if (req.user?.role !== "farmer") {
      res.status(403).json({ error: "Only farmers can respond to buyer demands" });
      return;
    }

    if (!req.user.verified) {
      res.status(403).json({ error: "Pending farmer verification. Cannot accept orders." });
      return;
    }
  }

  const newOrder: Order = {
    id: "order_" + Math.random().toString(36).substr(2, 9),
    listingId: resolvedListingId,
    demandId: resolvedDemandId,
    farmerId,
    buyerId,
    crop,
    quantity: Number(quantity),
    unit,
    agreed_price: Number(agreed_price),
    status: "pending",
    created_at: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Generate notification for recipient
  const targetUserId = (req.user?.role === "buyer") ? farmerId : buyerId;
  const buyerOrFarmerName = req.user?.fullName || (req.user?.role === "buyer" ? "B2B Buyer" : "Farmer");
  const isBuyerOrder = req.user?.role === "buyer";
  const newOrderNotif: PriceNotification = {
    id: "notif_" + Math.random().toString(36).substr(2, 9),
    userId: targetUserId,
    title: isBuyerOrder ? `🛒 Harvest Listing Order Received!` : `📋 Response to Demand Requirement`,
    message: isBuyerOrder 
      ? `Buyer ${buyerOrFarmerName} placed an order for ${quantity} ${unit} of ${crop} at NRs. ${agreed_price}/${unit}.`
      : `Farmer ${buyerOrFarmerName} responded to your demand for ${quantity} ${unit} of ${crop} at NRs. ${agreed_price}/${unit}.`,
    crop,
    currentPrice: Number(agreed_price),
    threshold: Number(agreed_price),
    criteria: "above",
    region: req.user?.district || "Nepal",
    district: req.user?.district || "Nepal",
    isRead: false,
    created_at: new Date().toISOString()
  };
  db.priceNotifications.push(newOrderNotif);

  saveDb(db);

  // Audit trail log
  console.log(`AUDIT: Order created: ${newOrder.id} | Crop: ${newOrder.crop} | Farmer: ${newOrder.farmerId} | Buyer: ${newOrder.buyerId} | Qty: ${newOrder.quantity} | Agreed Price: ${newOrder.agreed_price}`);

  res.status(201).json({
    message: "Order placed successfully. Status is pending approval.",
    order: newOrder
  });
});

// PATCH /api/orders/:id/status/
app.patch("/api/orders/:id/status", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDb();

  const orderIndex = db.orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const order = db.orders[orderIndex];

  // Permission check
  if (order.farmerId !== req.user?.id && order.buyerId !== req.user?.id && req.user?.role !== "admin") {
    res.status(403).json({ error: "Unauthorized to update this order's status" });
    return;
  }

  const allowedStatuses: OrderStatus[] = ["pending", "negotiating", "confirmed", "completed", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status requested" });
    return;
  }

  // Business logic transitions
  const oldStatus = order.status;
  order.status = status;

  // Sync back to produce listing if order is completed or cancelled
  if (order.listingId) {
    const listing = db.produceListings.find(l => l.id === order.listingId);
    if (listing) {
      if (status === "completed" || status === "confirmed") {
        listing.status = "sold";
      } else if (status === "cancelled") {
        listing.status = "available";
      }
    }
  }

  db.orders[orderIndex] = order;

  // Generate notification for counterpart user
  const counterpartId = (req.user?.id === order.farmerId) ? order.buyerId : order.farmerId;
  const actorName = req.user?.fullName || "Trading Partner";
  let notifTitle = "📋 Order Status Updated";
  let notifMessage = `${actorName} updated order #${order.id.slice(-5)} status to ${status.toUpperCase()}.`;

  if (status === "confirmed") {
    notifTitle = `✅ Buyer Accepted Harvest Listing Order!`;
    notifMessage = `${actorName} has accepted & confirmed the harvest listing deal for ${order.quantity} ${order.unit} of ${order.crop} at NRs. ${order.agreed_price}/${order.unit}!`;
  } else if (status === "completed") {
    notifTitle = `🎉 Order Completed & Delivered!`;
    notifMessage = `${actorName} marked order for ${order.crop} (${order.quantity} ${order.unit}) as completed.`;
  } else if (status === "cancelled") {
    notifTitle = `❌ Order Cancelled`;
    notifMessage = `${actorName} cancelled the order for ${order.crop}.`;
  }

  const statusNotif: PriceNotification = {
    id: "notif_" + Math.random().toString(36).substr(2, 9),
    userId: counterpartId,
    title: notifTitle,
    message: notifMessage,
    crop: order.crop,
    currentPrice: Number(order.agreed_price),
    threshold: Number(order.agreed_price),
    criteria: "above",
    region: req.user?.district || "Nepal",
    district: req.user?.district || "Nepal",
    isRead: false,
    created_at: new Date().toISOString()
  };
  db.priceNotifications.push(statusNotif);

  saveDb(db);

  // Audit trail
  console.log(`AUDIT: Order status transition: ${order.id} | From: ${oldStatus} -> To: ${status} | Changed by: ${req.user?.id}`);

  res.json({
    message: `Order status successfully transitioned to ${status}`,
    order
  });
});

// POST /api/orders/:id/negotiate/
app.post("/api/orders/:id/negotiate", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user?.verified && req.user?.verificationStatus !== 'verified') {
    res.status(403).json({ 
      error: "Mandatory verification required: Upload your Citizenship Card & National Identity Card for Super Admin/Admin approval before negotiating deals.",
      kycRequired: true,
      verificationStatus: req.user?.verificationStatus || 'unverified'
    });
    return;
  }

  const { id } = req.params;
  const { message, proposed_price, qrCodeData, qrType, qrTitle } = req.body;

  if (!proposed_price && !qrCodeData && (!message || !message.trim())) {
    res.status(400).json({ error: "Please provide a message, counter price, or QR code" });
    return;
  }

  const db = loadDb();
  const orderIndex = db.orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const order = db.orders[orderIndex];

  // Auth check
  if (order.farmerId !== req.user?.id && order.buyerId !== req.user?.id) {
    res.status(403).json({ error: "Unauthorized to negotiate on this order" });
    return;
  }

  const finalPrice = proposed_price ? Number(proposed_price) : order.agreed_price;

  // Create negotiation log
  const newNegotiation: Negotiation = {
    id: "neg_" + Math.random().toString(36).substr(2, 9),
    orderId: id,
    senderId: req.user.id,
    senderName: req.user.fullName,
    message: message || (qrCodeData ? `📱 Sent ${qrTitle || 'QR Code'}` : `Counter proposed price of NRs. ${finalPrice}`),
    proposed_price: finalPrice,
    created_at: new Date().toISOString(),
    ...(qrCodeData ? { qrCodeData, qrType, qrTitle } : {})
  };

  db.negotiations.push(newNegotiation);

  // Update order's current proposed price and shift status to negotiating
  order.agreed_price = finalPrice;
  order.status = "negotiating";

  db.orders[orderIndex] = order;
  saveDb(db);

  // Audit trail
  console.log(`AUDIT: Negotiation counter-offer: ${order.id} | Proposer: ${req.user.id} | Price: ${proposed_price}`);

  res.status(201).json({
    message: "Counter-offer registered successfully",
    negotiation: newNegotiation,
    order
  });
});

// GET /api/orders/:id/negotiations (get history)
app.get("/api/orders/:id/negotiations", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = loadDb();

  const order = db.orders.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.farmerId !== req.user?.id && order.buyerId !== req.user?.id && req.user?.role !== "admin") {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const history = db.negotiations.filter(n => n.orderId === id);
  history.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json(history);
});

// --- ADMIN API ---

// GET /api/admin/analytics/trending-crops/
app.get("/api/admin/analytics/trending-crops", (req, res) => {
  const db = loadDb();

  // Aggregate crops from listings, demands, and orders
  const cropStats: Record<string, { listingCount: number; demandCount: number; orderCount: number; avgListingPrice: number; totalListingPrice: number }> = {};

  db.produceListings.forEach(l => {
    if (!cropStats[l.crop]) {
      cropStats[l.crop] = { listingCount: 0, demandCount: 0, orderCount: 0, avgListingPrice: 0, totalListingPrice: 0 };
    }
    cropStats[l.crop].listingCount += 1;
    cropStats[l.crop].totalListingPrice += l.target_price;
  });

  db.demandPosts.forEach(d => {
    if (!cropStats[d.crop]) {
      cropStats[d.crop] = { listingCount: 0, demandCount: 0, orderCount: 0, avgListingPrice: 0, totalListingPrice: 0 };
    }
    cropStats[d.crop].demandCount += 1;
  });

  db.orders.forEach(o => {
    if (!cropStats[o.crop]) {
      cropStats[o.crop] = { listingCount: 0, demandCount: 0, orderCount: 0, avgListingPrice: 0, totalListingPrice: 0 };
    }
    cropStats[o.crop].orderCount += 1;
  });

  // Calculate averages
  const result = Object.entries(cropStats).map(([crop, stats]) => {
    return {
      crop,
      listingCount: stats.listingCount,
      demandCount: stats.demandCount,
      orderCount: stats.orderCount,
      avgPrice: stats.listingCount > 0 ? Math.round(stats.totalListingPrice / stats.listingCount) : 0,
      volatilityScore: Math.round(Math.random() * 30 + 10) // Mocked volatility percentage
    };
  });

  res.json(result);
});

// GET /api/admin/users/pending-verification/
app.get("/api/admin/users/pending-verification", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin resource only" });
    return;
  }

  const db = loadDb();
  // Return users who are unverified or pending KYC approval
  const pending = db.users.filter(u => u.role !== "admin" && (!u.verified || u.verificationStatus === 'pending'));
  res.json(pending);
});

// POST /api/admin/users/:id/verify/
app.post("/api/admin/users/:id/verify", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin resource only" });
    return;
  }

  const { id } = req.params;
  const { notes } = req.body || {};
  const db = loadDb();

  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  db.users[userIndex].verified = true;
  db.users[userIndex].verificationStatus = 'verified';
  db.users[userIndex].verificationNotes = notes || 'Citizenship and National Identity Card verified and approved by Super Admin / Admin';
  saveDb(db);

  // Audit trail
  console.log(`AUDIT: User verified by admin: ${id} | Admin: ${req.user.id}`);

  res.json({
    message: "User Citizenship and National Identity credentials verified successfully",
    user: db.users[userIndex]
  });
});

// POST /api/admin/users/:id/reject/
app.post("/api/admin/users/:id/reject", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin resource only" });
    return;
  }

  const { id } = req.params;
  const { notes } = req.body || {};
  const db = loadDb();

  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  db.users[userIndex].verified = false;
  db.users[userIndex].verificationStatus = 'rejected';
  db.users[userIndex].verificationNotes = notes || 'Submitted Citizenship Card or National Identity Card image was illegible or incomplete. Please re-upload clear photos.';
  saveDb(db);

  // Audit trail
  console.log(`AUDIT: User verification rejected by admin: ${id} | Admin: ${req.user.id}`);

  res.json({
    message: "User verification request rejected.",
    user: db.users[userIndex]
  });
});

// --- COOPERATIVE API ---
app.get("/api/cooperatives", (req, res) => {
  const db = loadDb();
  res.json(db.cooperatives);
});

// POST /api/cooperatives/contact
app.post("/api/cooperatives/contact", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { cooperativeId, crop, message } = req.body;
  if (!cooperativeId || !crop || !message) {
    res.status(400).json({ error: "Missing required fields: cooperativeId, crop, message" });
    return;
  }

  const db = loadDb();
  const coop = db.cooperatives.find(c => c.id === cooperativeId);
  if (!coop) {
    res.status(404).json({ error: "Cooperative not found" });
    return;
  }

  const newMessage: CooperativeMessage = {
    id: "coop_msg_" + Math.random().toString(36).substr(2, 9),
    farmerId: req.user.id,
    farmerName: req.user.fullName,
    cooperativeId: coop.id,
    cooperativeName: coop.name,
    crop,
    message,
    created_at: new Date().toISOString()
  };

  db.cooperativeMessages.push(newMessage);
  saveDb(db);

  res.status(201).json({
    message: "Message sent to cooperative successfully",
    cooperativeMessage: newMessage
  });
});

// GET /api/cooperatives/messages
app.get("/api/cooperatives/messages", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  const messages = db.cooperativeMessages.filter(m => m.farmerId === req.user?.id);
  messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(messages);
});

// GET /api/cooperatives/received-messages
app.get("/api/cooperatives/received-messages", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  // Filter messages sent to this cooperative
  const messages = db.cooperativeMessages.filter(m => m.cooperativeId === req.user?.cooperativeId);
  messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(messages);
});

// GET /api/cooperatives/announcements
app.get("/api/cooperatives/announcements", (req, res) => {
  const db = loadDb();
  const announcements = db.cooperativeAnnouncements || [];
  announcements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(announcements);
});

// POST /api/cooperatives/announcements
app.post("/api/cooperatives/announcements", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "cooperative" && req.user.role !== "admin") {
    res.status(403).json({ error: "Only cooperatives or administrators can post announcements" });
    return;
  }

  const { title, content, category } = req.body;
  if (!title || !content || !category) {
    res.status(400).json({ error: "Missing required fields: title, content, category" });
    return;
  }

  const db = loadDb();
  let coopName = "System Admin";
  let coopId = "admin";

  if (req.user.role === "cooperative") {
    coopId = req.user.cooperativeId || "system";
    const coop = db.cooperatives.find(c => c.id === coopId);
    if (coop) {
      coopName = coop.name;
    } else {
      coopName = req.user.fullName;
    }
  }

  const newAnn: CooperativeAnnouncement = {
    id: "ann_" + Math.random().toString(36).substr(2, 9),
    cooperativeId: coopId,
    cooperativeName: coopName,
    title,
    content,
    category,
    created_at: new Date().toISOString()
  };

  if (!db.cooperativeAnnouncements) {
    db.cooperativeAnnouncements = [];
  }

  db.cooperativeAnnouncements.push(newAnn);
  saveDb(db);

  res.status(201).json({
    message: "Announcement broadcasted successfully",
    announcement: newAnn
  });
});

// DELETE /api/cooperatives/announcements/:id
app.delete("/api/cooperatives/announcements/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "cooperative" && req.user.role !== "admin") {
    res.status(403).json({ error: "Only cooperatives or administrators can delete announcements" });
    return;
  }

  const { id } = req.params;
  const db = loadDb();

  if (!db.cooperativeAnnouncements) {
    db.cooperativeAnnouncements = [];
  }

  const index = db.cooperativeAnnouncements.findIndex(a => a.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }

  // If role is cooperative, verify they own the announcement
  if (req.user.role === "cooperative" && db.cooperativeAnnouncements[index].cooperativeId !== req.user.cooperativeId) {
    res.status(403).json({ error: "You can only delete your own cooperative's announcements" });
    return;
  }

  db.cooperativeAnnouncements.splice(index, 1);
  saveDb(db);

  res.json({ message: "Announcement deleted successfully" });
});

// --- PRICE ALERTS & NOTIFICATIONS API ---

// GET /api/price-alerts
app.get("/api/price-alerts", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  const alerts = db.priceAlerts.filter(a => a.userId === req.user?.id);
  res.json(alerts);
});

// POST /api/price-alerts
app.post("/api/price-alerts", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { crop, criteria, priceThreshold, region, district, email } = req.body;
  if (!crop || !criteria || priceThreshold === undefined) {
    res.status(400).json({ error: "Missing required fields: crop, criteria, priceThreshold" });
    return;
  }

  const db = loadDb();
  const newAlert: PriceAlert = {
    id: "alert_" + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    crop,
    criteria: criteria as any,
    priceThreshold: Number(priceThreshold),
    region: region || "all",
    district: district || "all",
    email: email || "",
    isActive: true,
    created_at: new Date().toISOString()
  };

  db.priceAlerts.push(newAlert);
  saveDb(db);

  res.status(201).json({
    message: "Price alert registered successfully",
    alert: newAlert
  });
});

// PATCH /api/price-alerts/:id
app.patch("/api/price-alerts/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const { isActive, priceThreshold, criteria, district, email } = req.body;

  const db = loadDb();
  const alertIndex = db.priceAlerts.findIndex(a => a.id === id && a.userId === req.user?.id);

  if (alertIndex === -1) {
    res.status(404).json({ error: "Price alert not found" });
    return;
  }

  const alert = db.priceAlerts[alertIndex];
  if (isActive !== undefined) alert.isActive = !!isActive;
  if (priceThreshold !== undefined) alert.priceThreshold = Number(priceThreshold);
  if (criteria !== undefined) alert.criteria = criteria as any;
  if (district !== undefined) alert.district = district;
  if (email !== undefined) alert.email = email;

  db.priceAlerts[alertIndex] = alert;
  saveDb(db);

  res.json({
    message: "Price alert updated successfully",
    alert
  });
});

// DELETE /api/price-alerts/:id
app.delete("/api/price-alerts/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;

  const db = loadDb();
  const initialLength = db.priceAlerts.length;
  db.priceAlerts = db.priceAlerts.filter(a => !(a.id === id && a.userId === req.user?.id));

  if (db.priceAlerts.length === initialLength) {
    res.status(404).json({ error: "Price alert not found" });
    return;
  }

  saveDb(db);
  res.json({ message: "Price alert deleted successfully" });
});

// GET /api/notifications
app.get("/api/notifications", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  const notifications = db.priceNotifications.filter(n => n.userId === req.user?.id);
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(notifications);
});

// POST /api/notifications/read-all
app.post("/api/notifications/read-all", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const db = loadDb();
  let updated = false;
  db.priceNotifications.forEach(n => {
    if (n.userId === req.user?.id && !n.isRead) {
      n.isRead = true;
      updated = true;
    }
  });

  if (updated) {
    saveDb(db);
  }

  res.json({ message: "All notifications marked as read" });
});

// PATCH /api/notifications/:id/read
app.patch("/api/notifications/:id/read", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const { isRead } = req.body;

  const db = loadDb();
  const index = db.priceNotifications.findIndex(n => n.id === id && n.userId === req.user?.id);

  if (index === -1) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  db.priceNotifications[index].isRead = isRead === undefined ? true : !!isRead;
  saveDb(db);

  res.json({
    message: "Notification updated successfully",
    notification: db.priceNotifications[index]
  });
});

// DELETE /api/notifications/:id
app.delete("/api/notifications/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const db = loadDb();
  const initialLength = db.priceNotifications.length;
  db.priceNotifications = db.priceNotifications.filter(n => !(n.id === id && n.userId === req.user?.id));
  if (db.priceNotifications.length === initialLength) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  saveDb(db);
  res.json({ message: "Notification deleted successfully" });
});

// POST /api/price-alerts/test-trigger
app.post("/api/price-alerts/test-trigger", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { crop, price, region, district } = req.body;
  if (!crop || price === undefined) {
    res.status(400).json({ error: "Missing crop or price parameters" });
    return;
  }

  const db = loadDb();
  const userAlerts = db.priceAlerts.filter(a => 
    a.userId === req.user?.id && 
    a.isActive && 
    (a.crop.toLowerCase() === crop.toLowerCase() || crop.toLowerCase() === "all")
  );

  let triggeredCount = 0;
  const notifications: PriceNotification[] = [];

  for (const alert of userAlerts) {
    // Check district/region matches
    const actualLoc = district || region || "all";
    const districtMatch = !alert.district || 
                          alert.district.toLowerCase() === "all" || 
                          alert.district.toLowerCase() === actualLoc.toLowerCase();
    const regionMatch = !alert.region || 
                        alert.region.toLowerCase() === "all" || 
                        alert.region.toLowerCase() === actualLoc.toLowerCase();

    if (!districtMatch && !regionMatch) continue;

    const isTriggered = 
      (alert.criteria === "above" && Number(price) >= alert.priceThreshold) ||
      (alert.criteria === "below" && Number(price) <= alert.priceThreshold);

    if (isTriggered) {
      const criteriaText = alert.criteria === "above" ? "risen above" : "fallen below";
      const subject = `🚨 [Price Alert] ${alert.crop} in ${actualLoc} reaches your target!`;
      const emailBody = `Namaste,

This is a simulated email notification that ${alert.crop} in ${actualLoc} has ${criteriaText} your threshold of NRs. ${alert.priceThreshold}.

Current Price: NRs. ${price} / KG
Your Target: NRs. ${alert.priceThreshold} (${alert.criteria})

This email was sent to your registered subscription: ${alert.email || "your email"}.

Warm regards,
KrishiSajha Team`;

      const notification: PriceNotification = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        alertId: alert.id,
        title: "🚨 Simulated Price Alert Triggered!",
        message: `The price of ${alert.crop} in ${actualLoc} has ${criteriaText} your threshold of NRs. ${alert.priceThreshold}. Current rate is NRs. ${price} / KG.`,
        crop: alert.crop,
        currentPrice: Number(price),
        threshold: alert.priceThreshold,
        criteria: alert.criteria,
        region: actualLoc,
        district: district || alert.district || "all",
        emailSentTo: alert.email,
        emailSubject: subject,
        emailBody,
        isRead: false,
        created_at: new Date().toISOString()
      };
      db.priceNotifications.push(notification);
      notifications.push(notification);
      triggeredCount++;
    }
  }

  if (triggeredCount > 0) {
    saveDb(db);
  }

  res.json({
    message: `Trigger check completed. ${triggeredCount} alerts triggered.`,
    triggeredCount,
    notifications
  });
});

// POST /api/notifications/simulate (Direct demo trigger for Buyer Acceptance or Price Updates)
app.post("/api/notifications/simulate", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { type, crop, buyerName, price, quantity, unit } = req.body;
  const db = loadDb();

  let title = "🚨 Market Price Alert Update";
  let message = `Kalimati Wholesale: ${crop || "Organic Tomato"} price updated to NRs. ${price || 85}/KG (+12% surge).`;

  if (type === "buyer_accept") {
    title = `✅ Buyer Accepted Harvest Listing!`;
    message = `Buyer "${buyerName || "Kalimati Fresh Mart"}" accepted your harvest listing for ${quantity || 250} ${unit || "KG"} of ${crop || "Tomato"} at NRs. ${price || 75}/${unit || "KG"}.`;
  } else if (type === "price_update") {
    title = `📈 Wholesale Price Update: ${crop || "Cauliflower"}`;
    message = `Market Update: ${crop || "Cauliflower"} price updated to NRs. ${price || 95}/KG in ${req.user.district || "Kathmandu"} market.`;
  }

  const newNotif: PriceNotification = {
    id: "notif_" + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    title,
    message,
    crop: crop || "Tomato",
    currentPrice: Number(price || 75),
    threshold: Number(price || 75),
    criteria: "above",
    region: req.user.district || "Kathmandu",
    district: req.user.district || "Kathmandu",
    isRead: false,
    created_at: new Date().toISOString()
  };

  db.priceNotifications.push(newNotif);
  saveDb(db);

  res.status(201).json({
    message: "Simulated notification created successfully",
    notification: newNotif
  });
});

// --- PLATFORM FEEDBACK & FEATURE REQUESTS API ---

// GET /api/feedback - Get submitted feedback
app.get("/api/feedback", (req, res) => {
  const db = loadDb();
  let feedbackList = db.platformFeedback || [];

  // Check auth if provided
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  let currentUser: User | null = null;
  if (token) {
    const parts = token.split("-");
    if (parts[0] === "JWT" && parts[1]) {
      currentUser = db.users.find(u => u.id === parts[1]) || null;
    }
  }

  // Admin gets all feedback; normal logged in user gets all feedback or filtered
  // To allow community feature requests browsing, we return all feedback sorted newest first
  feedbackList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(feedbackList);
});

// POST /api/feedback - Submit new feature request, bug report, or platform feedback
app.post("/api/feedback", (req, res) => {
  const { type, title, description, priority, userName, userRole, userDistrict, userPhone } = req.body;

  if (!type || !title || !description) {
    res.status(400).json({ error: "Missing required feedback fields: type, title, and description" });
    return;
  }

  // Attempt to extract authenticated user if token present
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  let loggedInUser: User | null = null;
  const db = loadDb();

  if (token) {
    const parts = token.split("-");
    if (parts[0] === "JWT" && parts[1]) {
      loggedInUser = db.users.find(u => u.id === parts[1]) || null;
    }
  }

  const validTypes = ["feature_request", "bug_report", "usability_issue", "general_feedback"];
  const feedbackType = validTypes.includes(type) ? type : "general_feedback";

  const validPriorities = ["low", "medium", "high", "critical"];
  const feedbackPriority = validPriorities.includes(priority) ? priority : "medium";

  const newFeedback: PlatformFeedback = {
    id: "fb_" + Math.random().toString(36).substr(2, 9),
    userId: loggedInUser ? loggedInUser.id : undefined,
    userName: userName || (loggedInUser ? loggedInUser.fullName : "Anonymous User"),
    userRole: userRole || (loggedInUser ? loggedInUser.role : "guest"),
    userDistrict: userDistrict || (loggedInUser ? loggedInUser.district : "Kathmandu"),
    userPhone: userPhone || (loggedInUser ? loggedInUser.phone : ""),
    type: feedbackType as any,
    title,
    description,
    priority: feedbackPriority as any,
    status: "pending",
    created_at: new Date().toISOString()
  };

  if (!db.platformFeedback) {
    db.platformFeedback = [];
  }

  db.platformFeedback.push(newFeedback);
  saveDb(db);

  console.log(`AUDIT: Platform feedback submitted: ${newFeedback.id} | Type: ${newFeedback.type} | Title: ${newFeedback.title}`);

  res.status(201).json({
    message: "Thank you! Your feedback has been received by the AgriTech administrative team.",
    feedback: newFeedback
  });
});

// PATCH /api/feedback/:id - Update status or admin notes (Admin only)
app.patch("/api/feedback/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Only AgriTech administrators can update feedback status" });
    return;
  }

  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const db = loadDb();

  if (!db.platformFeedback) {
    db.platformFeedback = [];
  }

  const index = db.platformFeedback.findIndex(f => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Feedback submission not found" });
    return;
  }

  const item = db.platformFeedback[index];
  if (status) {
    const validStatuses = ["pending", "under_review", "in_progress", "resolved", "dismissed"];
    if (validStatuses.includes(status)) {
      item.status = status;
    }
  }

  if (adminNotes !== undefined) {
    item.adminNotes = adminNotes;
  }

  db.platformFeedback[index] = item;
  saveDb(db);

  res.json({
    message: "Feedback updated successfully",
    feedback: item
  });
});

// DELETE /api/feedback/:id - Delete feedback entry (Admin only)
app.delete("/api/feedback/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Only administrators can delete feedback entries" });
    return;
  }

  const { id } = req.params;
  const db = loadDb();

  if (!db.platformFeedback) {
    db.platformFeedback = [];
  }

  const index = db.platformFeedback.findIndex(f => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Feedback submission not found" });
    return;
  }

  db.platformFeedback.splice(index, 1);
  saveDb(db);

  res.json({ message: "Feedback submission deleted successfully" });
});

// POST /api/ai/forecast-harvest - AI-powered crop harvest forecasting using Gemini
app.post("/api/ai/forecast-harvest", authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { crop, district, acreage, soilCondition, weatherScenario } = req.body;

  if (!crop || !district || !acreage) {
    res.status(400).json({ error: "Missing required fields: crop, district, acreage" });
    return;
  }

  try {
    const ai = getAiClient();
    const db = loadDb();

    // Create farmer ID -> district mapping from the users table
    const userDistrictMap = new Map<string, string>();
    db.users.forEach(u => {
      if (u.id && u.district) {
        userDistrictMap.set(u.id, u.district);
      }
    });

    // Query historical harvest records logged in the database for this crop and district
    const matchingRecords = db.harvestRecords.filter(r => {
      const dist = userDistrictMap.get(r.farmerId) || "";
      return r.crop.toLowerCase() === crop.toLowerCase() && dist.toLowerCase() === district.toLowerCase();
    });

    const historicalStats = matchingRecords.map(r => ({
      season: r.season,
      acreage: r.acreage,
      yieldQuantity: r.yieldQuantity,
      yieldPerRopani: Math.round(r.yieldQuantity / r.acreage),
      fertilizer: r.fertilizerUsed,
      weather: r.weatherCondition,
      soil: r.soilCondition
    }));

    const prompt = `
You are an expert agronomy forecaster and agricultural scientist specializing in high-yield farming in the mid-hills of Nepal (including Kathmandu, Dhading, Makwanpur, Kavre, Nuwakot).

The farmer wants a customized crop harvest forecast and optimal planting cycle recommendations:
- Crop: ${crop}
- District: ${district}
- Land Acreage: ${acreage} Ropani
- Current Soil Nutrients/Condition: ${soilCondition || 'balanced'}
- Expected Weather Scenario for the season: ${weatherScenario || 'optimal'}

Here is the real historical harvest record context logged by other farmers in this same district (${district}) for ${crop}:
${JSON.stringify(historicalStats, null, 2)}

Using this historical data as a baseline, adjust your calculations for the land size, soil condition, and weather scenario.
- Under 'dry' conditions, yields for water-heavy crops like Tomato (Golbheda) or Cauliflower (Kauli) might drop significantly.
- Under 'poor' soil condition, yields drop by about 30-35%.
- 'organic' compost boosts soil health, while balanced fertilizer applications optimize yields.
- Calculate the total expected yield in KG for ${acreage} Ropani.

Return a JSON payload matching the response schema, recommending a planting cycle name, optimal sowing and harvesting dates, a localized risk assessment, a brief rationale explaining your numbers, and 3-4 concrete step-by-step actionable recommendations.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: forecastResponseSchema,
        systemInstruction: "You are a professional Nepalese agronomy AI forecaster. You analyze historical local data, soil conditions, and weather parameters to suggest high-precision yield forecasts and optimized crop planting cycles."
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Crop Forecast failed:", error);
    res.status(500).json({ 
      error: "AI Forecasting service is temporarily unavailable. " + (error.message || "") 
    });
  }
});

// POST /api/ai/advisor - AI-powered climate and high-yield crop suggestions
app.post("/api/ai/advisor", authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { district } = req.body;

  if (!district) {
    res.status(400).json({ error: "Missing required field: district" });
    return;
  }

  try {
    const ai = getAiClient();
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const prompt = `
You are an advanced agricultural climatologist and senior agronomy advisor for Nepalese smallholder farmers. 
Your task is to analyze the current climate trends for the district of **${district}**, Nepal, for the current period of **${currentMonthName} ${currentYear}**, and suggest specific, high-yield crops and climate-smart adaptation tips for the upcoming agricultural season.

Provide your evaluation specifically calibrated for:
- District: **${district}** (Evaluate the specific agro-ecological zone of this district: e.g., Kathmandu Valley is a fertile basin with cool/moderate climate; Dhading features intensive river valleys and hilly terraced slopes ideal for commercial vegetables; Makwanpur spans from inner Terai flatlands to high-altitude hills).
- Sowing/Planning Window: The next 1-3 months.

Consider the typical seasonal trends of Nepal (such as Monsoon/Pre-Monsoon, Autumn post-monsoon vegetable cycles, Winter frost risk, and dry spring/pre-monsoon summer) and adjust your response based on the current month of **${currentMonthName}**.

Return a fully populated JSON payload matching the response schema:
1. 'upcomingSeason': Name of the season and months (e.g. 'Post-Monsoon Autumn (September - November)').
2. 'climateTrendSummary': A concise 3-sentence summary analyzing temperature range, average precipitation changes, relative humidity, and how these parameters affect soil preparation in ${district}.
3. 'recommendedCrops': An array of exactly 3 highly suitable crops. For each crop include:
   - 'cropName': e.g., 'Tomato (Golbheda)', 'Cauliflower (Kauli)', 'Cabbage (Banda)', 'Potato (Alu)', 'Ginger (Aduwa)', 'Onion (Pyaj)' or other high-yield alternatives in Nepal.
   - 'variety': High-performing local or hybrid varieties (e.g., 'Srijana' for tomato, 'Unnat' or 'Janak Dev' for potato, 'Snow Mystique' for cauliflower).
   - 'yieldPotential': Realistic expected yield range per Ropani (e.g., '800 - 1,200 KG/Ropani').
   - 'daysToHarvest': Days from sowing/transplanting to peak harvest.
   - 'irrigationRequirement': Explain whether low, medium, or high water is needed, coupled with a localized adaptation tip.
   - 'marketDemandTrend': Expected market pricing or trading volume trends in major Kalimati or local wholesale hubs during its harvesting window.
   - 'agronomicTips': 2 to 3 bulleted precision agronomy instructions (e.g., seedling nursery preparation, mulching, micro-nutrient application, disease prevention).
4. 'climateAdaptationAdvice': 3 to 4 localized, actionable climate-smart agriculture practices (e.g., plastic tunneling to protect from unseasonal autumn rains, organic mulching to retain soil moisture during dry spells, drip irrigation lines).

Avoid any generic warnings; provide specific, highly practical, expert-level agronomic guidance.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: advisorResponseSchema,
        systemInstruction: "You are a professional agronomy climatology advisor in Nepal. You generate high-precision, localized seasonal cropping advice based on geographical parameters and smart agriculture practices."
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini AI Advisor failed:", error);
    res.status(500).json({ 
      error: "AI Advisor service is temporarily unavailable. " + (error.message || "") 
    });
  }
});

// Seed Initializer Data function
function getSeedData() {
  const sampleCitizenshipSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%2310b981" opacity="0.1"/><rect x="1.5" y="1.5" width="397" height="247" rx="14.5" stroke="%2310b981" stroke-width="3" stroke-dasharray="6 6"/><text x="20" y="35" fill="%23065f46" font-family="sans-serif" font-weight="bold" font-size="14">GOVERNMENT OF NEPAL - CITIZENSHIP CERTIFICATE</text><text x="20" y="55" fill="%23047857" font-family="sans-serif" font-weight="bold" font-size="12">नेपाल सरकार - नागरिकता प्रमाण-पत्र</text><rect x="25" y="80" width="80" height="100" rx="8" fill="%23d1fae5" stroke="%23059669"/><text x="65" y="135" fill="%23047857" font-family="sans-serif" font-size="10" text-anchor="middle">PHOTO</text><text x="120" y="100" fill="%231e293b" font-family="sans-serif" font-size="12" font-weight="bold">Name: Official Applicant</text><text x="120" y="125" fill="%23475569" font-family="sans-serif" font-size="11">District: Dhading / Makwanpur</text><text x="120" y="150" fill="%23047857" font-family="sans-serif" font-size="11" font-weight="bold">Citizenship No: 27-01-78-08492</text><text x="120" y="175" fill="%2364748b" font-family="sans-serif" font-size="10">Issued Date: 2078/04/12</text><rect x="20" y="200" width="360" height="30" rx="6" fill="%23059669" opacity="0.15"/><text x="200" y="220" fill="%23065f46" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">OFFICIAL CITIZENSHIP SCAN</text></svg>`;
  
  const sampleNationalIdSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%232563eb" opacity="0.1"/><rect x="1.5" y="1.5" width="397" height="247" rx="14.5" stroke="%232563eb" stroke-width="3"/><text x="20" y="35" fill="%231e40af" font-family="sans-serif" font-weight="bold" font-size="14">NATIONAL IDENTITY CARD (NIN)</text><text x="20" y="55" fill="%231d4ed8" font-family="sans-serif" font-weight="bold" font-size="12">राष्ट्रिय परिचयपत्र - नेपाल</text><rect x="25" y="80" width="80" height="100" rx="8" fill="%23dbeafe" stroke="%232563eb"/><text x="65" y="135" fill="%231d4ed8" font-family="sans-serif" font-size="10" text-anchor="middle">NIN PHOTO</text><text x="120" y="100" fill="%231e293b" font-family="sans-serif" font-size="12" font-weight="bold">Name: Official Applicant</text><text x="120" y="125" fill="%231d4ed8" font-family="sans-serif" font-size="12" font-weight="bold">NIN Number: 108-492-3819</text><text x="120" y="150" fill="%23475569" font-family="sans-serif" font-size="11">District: Dhading / Makwanpur</text><text x="120" y="175" fill="%2364748b" font-family="sans-serif" font-size="10">Biometric Verification: ENROLLED</text><rect x="20" y="200" width="360" height="30" rx="6" fill="%232563eb" opacity="0.15"/><text x="200" y="220" fill="%231e40af" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">NATIONAL REGISTRATION LOGGED</text></svg>`;

  const users: User[] = [
    {
      id: "ram_farmer",
      username: "ram_farmer",
      role: "farmer",
      phone: "+977-9841-111111",
      district: "Dhading",
      verified: true,
      verificationStatus: "verified",
      citizenshipNumber: "27-01-78-01111",
      citizenshipDocUrl: sampleCitizenshipSvg,
      nationalIdNumber: "108-111-2222",
      nationalIdDocUrl: sampleNationalIdSvg,
      fullName: "Ram Bahadur Tamang"
    },
    {
      id: "hari_farmer",
      username: "hari_farmer",
      role: "farmer",
      phone: "+977-9851-222222",
      district: "Makwanpur",
      verified: false,
      verificationStatus: "pending",
      citizenshipNumber: "32-02-79-04312",
      citizenshipDocUrl: sampleCitizenshipSvg,
      nationalIdNumber: "209-583-1192",
      nationalIdDocUrl: sampleNationalIdSvg,
      verificationSubmittedAt: new Date().toISOString(),
      fullName: "Hari Devi Acharya"
    },
    {
      id: "shyam_buyer",
      username: "shyam_buyer",
      role: "buyer",
      phone: "+977-9803-333333",
      district: "Kathmandu",
      verified: false,
      verificationStatus: "unverified",
      fullName: "Shyam Shrestha (Kathmandu Resort)"
    },
    {
      id: "light_admin",
      username: "admin",
      role: "admin",
      phone: "+977-9812-444444",
      district: "Kathmandu",
      verified: true,
      verificationStatus: "verified",
      fullName: "Light Code Admin"
    },
    {
      id: "mukunda_coop",
      username: "mukunda_coop",
      role: "cooperative",
      phone: "+977-9841-777777",
      district: "Dhading",
      verified: true,
      fullName: "Mukunda Prasad Sapkota (Dhading Coop)",
      cooperativeId: "coop_1"
    },
    {
      id: "deepa_coop",
      username: "deepa_coop",
      role: "cooperative",
      phone: "+977-9841-888888",
      district: "Dhading",
      verified: true,
      fullName: "Deepa Bhandari (Trishuli Coop)",
      cooperativeId: "coop_2"
    },
    {
      id: "keshav_coop",
      username: "keshav_coop",
      role: "cooperative",
      phone: "+977-9855-999999",
      district: "Makwanpur",
      verified: true,
      fullName: "Keshav Raj Giri (Makwanpur Coop)",
      cooperativeId: "coop_3"
    }
  ];

  // Daily market prices for the last 30 days across districts and categories (20 staple crops)
  const seedCrops: { crop: string; category: string; basePrice: number }[] = [
    { crop: "Potato (Alu)", category: "vegetables", basePrice: 45 },
    { crop: "Tomato (Golbheda)", category: "vegetables", basePrice: 75 },
    { crop: "Cauliflower (Kauli)", category: "vegetables", basePrice: 60 },
    { crop: "Cabbage (Banda)", category: "vegetables", basePrice: 38 },
    { crop: "Radish (Mula)", category: "vegetables", basePrice: 32 },
    { crop: "Carrot (Gajar)", category: "vegetables", basePrice: 55 },
    { crop: "Beans (Bodi)", category: "vegetables", basePrice: 70 },
    { crop: "Eggplant (Bhanta)", category: "vegetables", basePrice: 40 },
    { crop: "Apple (Syau)", category: "fruits", basePrice: 180 },
    { crop: "Banana (Kera)", category: "fruits", basePrice: 85 },
    { crop: "Orange (Suntala)", category: "fruits", basePrice: 125 },
    { crop: "Paddy Rice (Dhan)", category: "grains", basePrice: 55 },
    { crop: "Maize (Makkai)", category: "grains", basePrice: 42 },
    { crop: "Wheat (Gahu)", category: "grains", basePrice: 48 },
    { crop: "Mustard Seed (Tori)", category: "grains", basePrice: 110 },
    { crop: "Ginger (Aduwa)", category: "spices", basePrice: 150 },
    { crop: "Onion (Pyaj)", category: "spices", basePrice: 95 },
    { crop: "Garlic (Lasun)", category: "spices", basePrice: 210 },
    { crop: "Green Chili (Khursani)", category: "spices", basePrice: 80 },
    { crop: "Lentils (Dal)", category: "pulses", basePrice: 135 }
  ];

  const districtsConfig = [
    { district: "Kathmandu", region: "Kathmandu" as const, market: "Kalimati Market" },
    { district: "Kathmandu", region: "Kathmandu" as const, market: "Tokha Sub-Market" },
    { district: "Dhading", region: "Hill" as const, market: "Dhading Wholesale" },
    { district: "Makwanpur", region: "Hill" as const, market: "Hetauda Krishi Market" },
    { district: "Chitwan", region: "Terai" as const, market: "Narayangarh Mandi" }
  ];

  const marketPrices: MarketPrice[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    seedCrops.forEach(item => {
      districtsConfig.forEach((dist, dIdx) => {
        const dayModifier = Math.sin(i + dIdx) * 6;
        const distModifier = dist.district === "Kathmandu" ? 8 : (dist.district === "Dhading" ? -4 : (dist.district === "Makwanpur" ? -2 : 2));
        const finalPrice = Math.max(15, Math.round(item.basePrice + dayModifier + distModifier));

        marketPrices.push({
          id: `price_seed_${item.crop.replace(/\s+/g, '_')}_${dist.district}_${i}_${dIdx}`,
          crop: item.crop,
          category: item.category,
          region: dist.region,
          district: dist.district,
          price_per_unit: finalPrice,
          unit: "KG",
          date: dateStr,
          source_market: dist.market
        });
      });
    });
  }

  const produceListings: ProduceListing[] = [
    {
      id: "listing_seed_1",
      farmerId: "ram_farmer",
      crop: "Tomato (Golbheda)",
      quantity: 500,
      unit: "KG",
      target_price: 65,
      status: "available",
      created_at: new Date(today.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: "listing_seed_2",
      farmerId: "ram_farmer",
      crop: "Potato (Alu)",
      quantity: 1200,
      unit: "KG",
      target_price: 38,
      status: "available",
      created_at: new Date(today.getTime() - 10 * 3600 * 1000).toISOString()
    },
    {
      id: "listing_seed_3",
      farmerId: "hari_farmer",
      crop: "Cauliflower (Kauli)",
      quantity: 350,
      unit: "KG",
      target_price: 55,
      status: "available",
      created_at: new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const demandPosts: DemandPost[] = [
    {
      id: "demand_seed_1",
      buyerId: "shyam_buyer",
      crop: "Tomato (Golbheda)",
      quantity_needed: 400,
      unit: "KG",
      offered_price: 70,
      status: "active",
      created_at: new Date(today.getTime() - 5 * 3600 * 1000).toISOString()
    },
    {
      id: "demand_seed_2",
      buyerId: "shyam_buyer",
      crop: "Ginger (Aduwa)",
      quantity_needed: 100,
      unit: "KG",
      offered_price: 145,
      status: "active",
      created_at: new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const orders: Order[] = [
    {
      id: "order_seed_1",
      listingId: "listing_seed_1",
      demandId: "demand_seed_1",
      farmerId: "ram_farmer",
      buyerId: "shyam_buyer",
      crop: "Tomato (Golbheda)",
      quantity: 400,
      unit: "KG",
      agreed_price: 68,
      status: "negotiating",
      created_at: new Date(today.getTime() - 1 * 3600 * 1000).toISOString()
    }
  ];

  const negotiations: Negotiation[] = [
    {
      id: "neg_seed_1",
      orderId: "order_seed_1",
      senderId: "shyam_buyer",
      senderName: "Shyam Shrestha (Kathmandu Resort)",
      message: "We need 400 KG of fresh tomatoes. Can you lower the price to 62 NRs/KG?",
      proposed_price: 62,
      created_at: new Date(today.getTime() - 45 * 60 * 1000).toISOString()
    },
    {
      id: "neg_seed_2",
      orderId: "order_seed_1",
      senderId: "ram_farmer",
      senderName: "Ram Bahadur Tamang",
      message: "Since transport from Dhading to Kathmandu is high, let's meet in the middle at 68 NRs/KG. Hand-sorted organic quality.",
      proposed_price: 68,
      created_at: new Date(today.getTime() - 15 * 60 * 1000).toISOString()
    }
  ];

  const cooperatives: Cooperative[] = [
    {
      id: "coop_1",
      name: "Dhading Organic Vegetable Cooperative",
      district: "Dhading",
      contact_person: "Mukunda Prasad Sapkota",
      phone: "+977-9841-777777",
      farmerIds: ["ram_farmer"]
    },
    {
      id: "coop_2",
      name: "Trishuli Valley Farmers Union",
      district: "Dhading",
      contact_person: "Deepa Bhandari",
      phone: "+977-9841-888888",
      farmerIds: []
    },
    {
      id: "coop_3",
      name: "Makwanpur Hill Fruit Cooperative",
      district: "Makwanpur",
      contact_person: "Keshav Raj Giri",
      phone: "+977-9855-999999",
      farmerIds: ["hari_farmer"]
    }
  ];

  const soilLogs: SoilLog[] = [
    {
      id: "soil_seed_1",
      farmerId: "ram_farmer",
      cropBatch: "Tomato (Golbheda) - Spring Batch",
      logType: "soil_test",
      date: "2026-05-10",
      details: "Soil test results: pH 6.4, Nitrogen: Moderate, Phosphorus: Low, Potassium: High. Recommended: Apply phosphate fertilizer or organic bone meal.",
      created_at: new Date(today.getTime() - 70 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "soil_seed_2",
      farmerId: "ram_farmer",
      cropBatch: "Tomato (Golbheda) - Spring Batch",
      logType: "fertilizer",
      date: "2026-05-18",
      details: "Applied 25kg of organic compost and bone meal to boost phosphorus levels.",
      created_at: new Date(today.getTime() - 62 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "soil_seed_3",
      farmerId: "hari_farmer",
      cropBatch: "Potato (Alu) - High Altitude Block",
      logType: "soil_test",
      date: "2026-06-02",
      details: "Soil test results: pH 5.8 (slightly acidic), Nitrogen: Low, Phosphorus: Medium, Potassium: Medium. Recommended: Apply lime to raise pH and balanced NPK.",
      created_at: new Date(today.getTime() - 48 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const harvestRecords: HarvestRecord[] = [
    {
      id: "harvest_seed_1",
      farmerId: "ram_farmer",
      crop: "Tomato (Golbheda)",
      season: "Spring 2024",
      acreage: 2,
      yieldQuantity: 2800,
      fertilizerUsed: "DAP + Organic Compost",
      weatherCondition: "optimal",
      soilCondition: "balanced",
      created_at: new Date(today.getTime() - 365 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "harvest_seed_2",
      farmerId: "ram_farmer",
      crop: "Tomato (Golbheda)",
      season: "Spring 2025",
      acreage: 2,
      yieldQuantity: 3100,
      fertilizerUsed: "Balanced NPK + Bio-compost",
      weatherCondition: "optimal",
      soilCondition: "balanced",
      created_at: new Date(today.getTime() - 90 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "harvest_seed_3",
      farmerId: "ram_farmer",
      crop: "Potato (Alu)",
      season: "Autumn 2024",
      acreage: 3,
      yieldQuantity: 5800,
      fertilizerUsed: "Compost & Potash Booster",
      weatherCondition: "optimal",
      soilCondition: "balanced",
      created_at: new Date(today.getTime() - 270 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "harvest_seed_4",
      farmerId: "ram_farmer",
      crop: "Potato (Alu)",
      season: "Winter 2024",
      acreage: 3,
      yieldQuantity: 4100,
      fertilizerUsed: "Minimal Compost (Dry spell)",
      weatherCondition: "dry",
      soilCondition: "poor",
      created_at: new Date(today.getTime() - 180 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "harvest_seed_5",
      farmerId: "ram_farmer",
      crop: "Cauliflower (Kauli)",
      season: "Winter 2024",
      acreage: 1.5,
      yieldQuantity: 1850,
      fertilizerUsed: "Heavy Poultry Manure Only",
      weatherCondition: "optimal",
      soilCondition: "organic",
      created_at: new Date(today.getTime() - 170 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "harvest_seed_6",
      farmerId: "ram_farmer",
      crop: "Ginger (Aduwa)",
      season: "Summer 2024",
      acreage: 1,
      yieldQuantity: 720,
      fertilizerUsed: "NPK + Straw Mulching",
      weatherCondition: "excessive",
      soilCondition: "balanced",
      created_at: new Date(today.getTime() - 310 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "harvest_seed_7",
      farmerId: "hari_farmer",
      crop: "Potato (Alu)",
      season: "Autumn 2024",
      acreage: 2.5,
      yieldQuantity: 4900,
      fertilizerUsed: "Standard DAP",
      weatherCondition: "optimal",
      soilCondition: "balanced",
      created_at: new Date(today.getTime() - 270 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const cooperativeAnnouncements: CooperativeAnnouncement[] = [
    {
      id: "ann_seed_1",
      cooperativeId: "coop_1",
      cooperativeName: "Dhading Organic Vegetable Cooperative",
      title: "Kalimati Tomato Price Peak Alert",
      content: "Due to high post-monsoon demand, tomato wholesale rates at Kalimati are holding above NRs. 75/KG. Farmers with active tomato yields are advised to harvest and package immediately for bulk transport scheduled this Wednesday.",
      category: "market_update",
      created_at: new Date(today.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: "ann_seed_2",
      cooperativeId: "coop_1",
      cooperativeName: "Dhading Organic Vegetable Cooperative",
      title: "Heavy Rain Warning - Protect Seedlings",
      content: "Department of Meteorology reports unexpected western disturbances bringing localized thunderstorms in Dhading. Protect vulnerable nurseries using polytunnels or plastic mulches.",
      category: "weather_warning",
      created_at: new Date(today.getTime() - 10 * 3600 * 1000).toISOString()
    },
    {
      id: "ann_seed_3",
      cooperativeId: "coop_3",
      cooperativeName: "Makwanpur Hill Fruit Cooperative",
      title: "Organic IPM Pest Control Workshop",
      content: "Learn advanced bio-rational pest management techniques. Free workshop on organic pesticide preparation using local herbs at the cooperative warehouse this Friday at 10 AM.",
      category: "training",
      created_at: new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const platformFeedback: PlatformFeedback[] = [
    {
      id: "fb_seed_1",
      userId: "ram_farmer",
      userName: "Ram Bahadur Tamang",
      userRole: "farmer",
      userDistrict: "Dhading",
      userPhone: "+977-9841-111111",
      type: "feature_request",
      title: "Offline SMS / USSD crop price query integration",
      description: "In remote pockets of Dhading where internet coverage is intermittent during monsoon rains, allowing farmers to send an SMS like 'PRICE TOMATO' to get instant Kalimati rates would be extremely helpful.",
      priority: "high",
      status: "under_review",
      adminNotes: "Evaluating gateway partnership with Ncell/NTC for shortcode SMS dispatch.",
      created_at: new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "fb_seed_2",
      userId: "shyam_buyer",
      userName: "Shyam Shrestha (Kathmandu Resort)",
      userRole: "buyer",
      userDistrict: "Kathmandu",
      userPhone: "+977-9803-333333",
      type: "feature_request",
      title: "Bulk export order receipts to PDF or CSV",
      description: "Would love a single button on the Buyer Dashboard to export completed supply-chain order receipts for tax accounting and monthly procurement reports.",
      priority: "medium",
      status: "in_progress",
      adminNotes: "Client-side CSV exporter in design stage.",
      created_at: new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "fb_seed_3",
      userName: "Anita Adhikari",
      userRole: "guest",
      userDistrict: "Kavre",
      userPhone: "+977-9849-000000",
      type: "usability_issue",
      title: "Mobile button size on small screen phones",
      description: "When viewing the market prices table on smaller smartphone screens, the filter dropdowns overlap slightly with the district selector.",
      priority: "low",
      status: "resolved",
      adminNotes: "Fixed responsive grid padding and mobile overflow handling.",
      created_at: new Date(today.getTime() - 5 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const sampleScanHistory: ScanHistoryItem[] = [
    {
      id: "scan_seed_1",
      userId: "ram_farmer",
      scanType: "member",
      scannedAt: new Date(today.getTime() - 2 * 3600 * 1000).toISOString(),
      title: "Cooperative Member Pass Verified",
      details: "Member: Ram Bahadur Tamang (Dhading Farmers Cooperative Union)",
      metadata: {
        memberId: "ram_farmer",
        fullName: "Ram Bahadur Tamang",
        cooperativeName: "Dhading Farmers Cooperative Union",
        district: "Dhading",
        phone: "+977-9841-111111"
      }
    },
    {
      id: "scan_seed_2",
      userId: "ram_farmer",
      scanType: "batch",
      scannedAt: new Date(today.getTime() - 24 * 3600 * 1000).toISOString(),
      title: "Harvest Batch Check-In: Fresh Organic Tomato",
      details: "Quantity: 650 KG | Target Price: NRs. 68/KG | Grade A | Origin: Dhading",
      metadata: {
        crop: "Tomato (Golbheda)",
        quantity: "650",
        price: "68",
        district: "Dhading",
        grade: "A",
        batchId: "BATCH-84912"
      }
    },
    {
      id: "scan_seed_3",
      userId: "ram_farmer",
      scanType: "member",
      scannedAt: new Date(today.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
      title: "Cooperative Member Pass Verified",
      details: "Member: Sita Maya Shrestha (Kavre Vegetable Growers Coop)",
      metadata: {
        memberId: "sita_farmer",
        fullName: "Sita Maya Shrestha",
        cooperativeName: "Kavre Vegetable Growers Coop",
        district: "Kavre",
        phone: "+977-9841-222222"
      }
    }
  ];

  return {
    users,
    marketPrices,
    produceListings,
    demandPosts,
    orders,
    negotiations,
    cooperatives,
    soilLogs,
    harvestRecords,
    priceAlerts: [],
    priceNotifications: [],
    cooperativeMessages: [],
    cooperativeAnnouncements,
    platformFeedback,
    scanHistory: sampleScanHistory
  };
}

// --- SCAN HISTORY API ---

// GET /api/scan-history - Get log of previous scans for authenticated user
app.get("/api/scan-history", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const db = loadDb();
  const userScans = (db.scanHistory || [])
    .filter(s => s.userId === req.user?.id)
    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());

  res.json(userScans);
});

// POST /api/scan-history - Create new scan log entry
app.post("/api/scan-history", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { scanType, title, details, metadata } = req.body;

  if (!title) {
    res.status(400).json({ error: "Title is required for scan history log" });
    return;
  }

  const db = loadDb();
  if (!db.scanHistory) {
    db.scanHistory = [];
  }

  const newScan: ScanHistoryItem = {
    id: "scan_" + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    scanType: scanType || "unknown",
    scannedAt: new Date().toISOString(),
    title,
    details: details || "",
    metadata: metadata || {}
  };

  db.scanHistory.unshift(newScan);
  saveDb(db);

  res.status(201).json({
    message: "Scan logged successfully",
    scan: newScan
  });
});

// DELETE /api/scan-history/clear - Clear all scan history for authenticated user
app.delete("/api/scan-history/clear", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const db = loadDb();
  db.scanHistory = (db.scanHistory || []).filter(s => s.userId !== req.user?.id);
  saveDb(db);

  res.json({ message: "Scan history cleared successfully" });
});

// DELETE /api/scan-history/:id - Delete single scan history item
app.delete("/api/scan-history/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.params;
  const db = loadDb();
  db.scanHistory = (db.scanHistory || []).filter(s => !(s.id === id && s.userId === req.user?.id));
  saveDb(db);

  res.json({ message: "Scan item deleted successfully" });
});

// --- B2B DEMAND BIDS & FORWARD CONTRACTS API ---

// GET /api/demands/:id/bids - Get bids for a specific demand post
app.get("/api/demands/:id/bids", (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const bids = (db.demandBids || []).filter(b => b.demandId === id);
  res.json(bids);
});

// POST /api/demands/:id/bids - Farmer or Cooperative submits a binding bid for a bulk demand
app.post("/api/demands/:id/bids", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user || (req.user.role !== "farmer" && req.user.role !== "cooperative")) {
    res.status(403).json({ error: "Only Farmers or Cooperatives can submit binding bids for bulk demands" });
    return;
  }

  const { id } = req.params;
  const { bidPricePerUnit, deliveryDaysRequired, depositLocked, notes } = req.body;

  if (!bidPricePerUnit || bidPricePerUnit <= 0) {
    res.status(400).json({ error: "Valid bid price per unit is required" });
    return;
  }

  const db = loadDb();
  const demand = db.demandPosts.find(d => d.id === id);
  if (!demand) {
    res.status(404).json({ error: "Demand post not found" });
    return;
  }

  const newBid: DemandBid = {
    id: "bid_" + Math.random().toString(36).substr(2, 9),
    demandId: id,
    farmerId: req.user.id,
    farmerName: req.user.fullName,
    farmerDistrict: req.user.district,
    bidPricePerUnit: Number(bidPricePerUnit),
    deliveryDaysRequired: Number(deliveryDaysRequired || 15),
    depositLocked: Number(depositLocked || 2500),
    notes: notes || "",
    status: "pending",
    created_at: new Date().toISOString()
  };

  if (!db.demandBids) db.demandBids = [];
  db.demandBids.unshift(newBid);

  // Add to audit trail
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: "audit_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    action: "BID_SUBMITTED",
    category: "negotiation",
    details: `Submitted bid of NRs ${bidPricePerUnit}/${demand.unit} for Demand ID #${demand.id} (${demand.crop})`,
    ipAddress: req.ip
  });

  saveDb(db);
  res.status(201).json({ message: "Bid submitted successfully", bid: newBid });
});

// POST /api/demands/bids/:bidId/accept - Buyer accepts a bid & locks forward contract
app.post("/api/demands/bids/:bidId/accept", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user || req.user.role !== "buyer") {
    res.status(403).json({ error: "Only Buyers can accept bids on their demands" });
    return;
  }

  const { bidId } = req.params;
  const db = loadDb();
  const bid = (db.demandBids || []).find(b => b.id === bidId);
  if (!bid) {
    res.status(404).json({ error: "Bid not found" });
    return;
  }

  const demand = db.demandPosts.find(d => d.id === bid.demandId);
  if (!demand) {
    res.status(404).json({ error: "Demand post not found" });
    return;
  }

  if (demand.buyerId !== req.user.id) {
    res.status(403).json({ error: "You can only accept bids on your own demand posts" });
    return;
  }

  // Update bid status
  bid.status = "accepted";
  demand.status = "fulfilled";

  // Create an automatic confirmed order / forward contract
  const newOrder: Order = {
    id: "o_" + Math.random().toString(36).substr(2, 9),
    listingId: "forward_contract_" + demand.id,
    demandId: demand.id,
    farmerId: bid.farmerId,
    buyerId: req.user.id,
    crop: demand.crop,
    quantity: demand.quantity_needed,
    unit: demand.unit,
    agreed_price: bid.bidPricePerUnit,
    status: "confirmed",
    created_at: new Date().toISOString(),
    farmerName: bid.farmerName,
    buyerName: req.user.fullName
  };

  db.orders.unshift(newOrder);

  // Auto-generate cold chain logistics dispatch entry
  if (!db.logisticsDispatches) db.logisticsDispatches = [];
  db.logisticsDispatches.unshift({
    id: "disp_" + Math.random().toString(36).substr(2, 9),
    orderId: newOrder.id,
    crop: demand.crop,
    quantity: demand.quantity_needed,
    unit: demand.unit,
    originDistrict: bid.farmerDistrict,
    destinationDistrict: req.user.district,
    route: "Prithvi Highway",
    vehicleNumber: "BA " + Math.floor(1 + Math.random() * 9) + " KHA " + Math.floor(1000 + Math.random() * 9000),
    driverName: "Ram Chandra Dhakal",
    driverPhone: "+977-9851-" + Math.floor(100000 + Math.random() * 900000),
    coldChainTempC: 4.0,
    status: "dispatched",
    departureTime: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 3600 * 1000 * 24 * (bid.deliveryDaysRequired || 2)).toISOString(),
    currentCheckpoint: `${bid.farmerDistrict} Central Agricultural Hub`
  });

  // Audit log
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: "audit_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    action: "BID_ACCEPTED_FORWARD_CONTRACT",
    category: "order",
    details: `Accepted Bid #${bid.id} from ${bid.farmerName} at NRs ${bid.bidPricePerUnit}/${demand.unit}. Order #${newOrder.id} created.`,
    ipAddress: req.ip
  });

  saveDb(db);
  res.json({ message: "Bid accepted & Forward Contract created", order: newOrder, bid });
});

// --- COLD CHAIN & ROUTE LOGISTICS API ---

// GET /api/logistics - Get logistics dispatches
app.get("/api/logistics", (req, res) => {
  const db = loadDb();
  res.json(db.logisticsDispatches || []);
});

// POST /api/logistics - Create/Assign vehicle dispatch
app.post("/api/logistics", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { orderId, crop, quantity, unit, originDistrict, destinationDistrict, route, vehicleNumber, driverName, driverPhone, coldChainTempC } = req.body;

  if (!crop || !vehicleNumber || !driverName) {
    res.status(400).json({ error: "Missing required logistics fields" });
    return;
  }

  const db = loadDb();
  const newDispatch: LogisticsDispatch = {
    id: "disp_" + Math.random().toString(36).substr(2, 9),
    orderId: orderId || "o_custom",
    crop,
    quantity: Number(quantity || 100),
    unit: unit || "KG",
    originDistrict: originDistrict || "Dhading",
    destinationDistrict: destinationDistrict || "Kathmandu",
    route: route || "Prithvi Highway",
    vehicleNumber,
    driverName,
    driverPhone: driverPhone || "+977-9800-000000",
    coldChainTempC: coldChainTempC ? Number(coldChainTempC) : 4.5,
    status: "dispatched",
    departureTime: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 3600 * 1000 * 6).toISOString(),
    currentCheckpoint: `${originDistrict || "Dhading"} Agricultural Logistics Hub`
  };

  if (!db.logisticsDispatches) db.logisticsDispatches = [];
  db.logisticsDispatches.unshift(newDispatch);

  saveDb(db);
  res.status(201).json({ message: "Logistics vehicle dispatched", dispatch: newDispatch });
});

// PUT /api/logistics/:id/status - Update dispatch status, location, or temperature
app.put("/api/logistics/:id/status", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, coldChainTempC, currentCheckpoint } = req.body;

  const db = loadDb();
  const dispatch = (db.logisticsDispatches || []).find(d => d.id === id);
  if (!dispatch) {
    res.status(404).json({ error: "Logistics dispatch not found" });
    return;
  }

  if (status) dispatch.status = status;
  if (coldChainTempC !== undefined) dispatch.coldChainTempC = Number(coldChainTempC);
  if (currentCheckpoint) dispatch.currentCheckpoint = currentCheckpoint;

  saveDb(db);
  res.json({ message: "Dispatch status updated", dispatch });
});

// --- AUTOMATED VAT INVOICE & SETTLEMENT API ---

// GET /api/invoices - Get invoices
app.get("/api/invoices", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const db = loadDb();
  const invoices = (db.invoices || []).filter(inv => 
    req.user?.role === "admin" ||
    inv.buyerName.includes(req.user?.fullName || "") ||
    inv.farmerName.includes(req.user?.fullName || "")
  );

  res.json(invoices);
});

// POST /api/invoices/generate - Generate automated VAT invoice for an order
app.post("/api/invoices/generate", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { orderId, paymentMethod } = req.body;
  const db = loadDb();
  const order = db.orders.find(o => o.id === orderId);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const subtotal = order.quantity * order.agreed_price;
  const logisticsFee = Math.round(subtotal * 0.04); // 4% logistics
  const cooperativeServiceFee = Math.round(subtotal * 0.02); // 2% coop fee
  const vatAmount = Math.round(subtotal * 0.13); // 13% Nepal VAT
  const totalAmount = subtotal + logisticsFee + cooperativeServiceFee + vatAmount;

  const newInvoice: Invoice = {
    id: "inv_" + Math.random().toString(36).substr(2, 9),
    invoiceNumber: "VAT-NP-2026-" + Math.floor(1000 + Math.random() * 9000),
    orderId: order.id,
    buyerName: order.buyerName || "Buyer",
    farmerName: order.farmerName || "Farmer",
    cooperativeName: "Nepal Agro Cooperatives Federation",
    crop: order.crop,
    quantity: order.quantity,
    unit: order.unit,
    pricePerUnit: order.agreed_price,
    subtotal,
    logisticsFee,
    cooperativeServiceFee,
    vatAmount,
    totalAmount,
    paymentMethod: paymentMethod || "ConnectIPS",
    status: "paid",
    issuedAt: new Date().toISOString(),
    settledAt: new Date().toISOString()
  };

  if (!db.invoices) db.invoices = [];
  db.invoices.unshift(newInvoice);

  saveDb(db);
  res.status(201).json({ message: "VAT invoice generated", invoice: newInvoice });
});

// --- INSTITUTIONAL SUBSCRIPTIONS API ---

// GET /api/subscriptions - Get active institutional subscriptions
app.get("/api/subscriptions", (req, res) => {
  const db = loadDb();
  res.json(db.subscriptions || []);
});

// POST /api/subscriptions - Create new recurring delivery subscription
app.post("/api/subscriptions", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user || req.user.role !== "buyer") {
    res.status(403).json({ error: "Only buyers can register institutional subscriptions" });
    return;
  }

  const { buyerOrganization, crop, weeklyQuantity, unit, agreedPricePerUnit, deliveryDay, district } = req.body;

  if (!buyerOrganization || !crop || !weeklyQuantity || !agreedPricePerUnit) {
    res.status(400).json({ error: "Missing required subscription details" });
    return;
  }

  const db = loadDb();
  const newSub: InstitutionalSubscription = {
    id: "sub_" + Math.random().toString(36).substr(2, 9),
    buyerId: req.user.id,
    buyerName: req.user.fullName,
    buyerOrganization,
    crop,
    weeklyQuantity: Number(weeklyQuantity),
    unit: unit || "KG",
    agreedPricePerUnit: Number(agreedPricePerUnit),
    deliveryDay: deliveryDay || "Monday",
    district: district || req.user.district,
    status: "active",
    startDate: new Date().toISOString().split('T')[0],
    nextDeliveryDate: new Date(Date.now() + 3600 * 1000 * 24 * 7).toISOString().split('T')[0]
  };

  if (!db.subscriptions) db.subscriptions = [];
  db.subscriptions.unshift(newSub);

  saveDb(db);
  res.status(201).json({ message: "Institutional subscription activated", subscription: newSub });
});

// PUT /api/subscriptions/:id/status - Pause or update subscription
app.put("/api/subscriptions/:id/status", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = loadDb();
  const sub = (db.subscriptions || []).find(s => s.id === id);
  if (!sub) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  sub.status = status;
  saveDb(db);
  res.json({ message: "Subscription status updated", subscription: sub });
});

// --- AUDIT LOGS API ---

// GET /api/audit-logs - View system audit logs
app.get("/api/audit-logs", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = loadDb();
  res.json(db.auditLogs || []);
});

// --- SUPPORT TICKETS & DISPUTE RESOLUTION API ---

// GET /api/support-tickets - View support tickets
app.get("/api/support-tickets", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const db = loadDb();
  const tickets = (db.supportTickets || []).filter(t => 
    req.user?.role === "admin" || t.userId === req.user?.id
  );

  res.json(tickets);
});

// POST /api/support-tickets - Create support/dispute ticket
app.post("/api/support-tickets", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { orderId, category, subject, description, priority } = req.body;

  if (!subject || !description) {
    res.status(400).json({ error: "Subject and description are required" });
    return;
  }

  const db = loadDb();
  const newTicket: SupportTicket = {
    id: "ticket_" + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    orderId: orderId || undefined,
    category: category || "other",
    subject,
    description,
    priority: priority || "medium",
    status: "open",
    created_at: new Date().toISOString(),
    responses: []
  };

  if (!db.supportTickets) db.supportTickets = [];
  db.supportTickets.unshift(newTicket);

  saveDb(db);
  res.status(201).json({ message: "Support ticket created", ticket: newTicket });
});

// POST /api/support-tickets/:id/respond - Add message to support ticket
app.post("/api/support-tickets/:id/respond", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: "Response message is required" });
    return;
  }

  const db = loadDb();
  const ticket = (db.supportTickets || []).find(t => t.id === id);
  if (!ticket) {
    res.status(404).json({ error: "Support ticket not found" });
    return;
  }

  const responseObj: SupportTicketResponse = {
    id: "resp_" + Math.random().toString(36).substr(2, 9),
    senderName: req.user.fullName,
    userRole: req.user.role,
    message,
    timestamp: new Date().toISOString()
  };

  ticket.responses.push(responseObj);
  if (req.user.role === "admin") {
    ticket.status = "in_progress";
  }

  saveDb(db);
  res.json({ message: "Response added", ticket });
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
