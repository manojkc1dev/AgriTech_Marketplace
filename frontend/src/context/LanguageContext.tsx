import React, { createContext, useState, useContext } from "react";

export type Language = "en" | "ne";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const nepaliTranslations: Record<string, string> = {
  // Navigation, Top Bar, Role Selector, Portals
  Home: "गृहपृष्ठ",
  "Public Prices": "सार्वजनिक मूल्य",
  "Public Prices Index": "सार्वजनिक मूल्य सूची",
  "Public Market Prices": "सार्वजनिक बजार मूल्य",
  "Browse Public Prices Index": "सार्वजनिक मूल्य सूची हेर्नुहोस्",
  "Browse Public Prices Index (Home)": "सार्वजनिक मूल्य सूची (गृहपृष्ठ)",
  "B2B Wholesale Hub": "B2B थोक बजार केन्द्र",
  "User Portal": "प्रयोगकर्ता पोर्टल",
  "Users Portal": "प्रयोगकर्ता पोर्टल",
  "Authorized Users Member Portal": "प्रमाणित सदस्य पोर्टल",
  "Sign In": "साइन इन",
  "Sign In to Portal": "पोर्टलमा साइन इन गर्नुहोस्",
  Register: "दर्ता गर्नुहोस्",
  "Log Out": "बाहिर निस्कनुहोस्",
  Cart: "कार्ट",
  "Shopping Basket": "किनमेल झोला",
  "Cart (Shopping Basket)": "कार्ट (किनमेल झोला)",
  Settings: "सेटिङहरू",
  "Settings & Preferences": "सेटिङ र प्राथमिकताहरू",
  Appearance: "अनुहार / रूप",
  Language: "भाषा",
  Theme: "थिम",
  "Dark Mode": "डार्क मोड",
  "Light Mode": "लाइट मोड",
  System: "सिस्टम",
  "F&Q": "F&Q (प्रश्न र सुझाव)",
  "F&Q (FAQ & Feedback)": "F&Q (प्रश्न र सुझाव)",
  "Reviews & Ratings": "समीक्षा र मूल्याङ्कन",
  Notifications: "सूचनाहरू",
  "My Role Dashboard": "मेरो ड्यासबोर्ड",
  "Switch Authorized Identity": "प्रमाणित पहिचान परिवर्तन गर्नुहोस्",
  Farmer: "किसान",
  "Farmer (किसान)": "किसान (Farmer)",
  "B2B Buyer": "B2B क्रेता",
  "Light Code Admin": "प्रशासक (Admin)",
  Admin: "प्रशासक",
  Cooperative: "सहकारी",
  Guest: "पाहुना",
  "Express Gateway Connection: Active": "एक्सप्रेस गेटवे जडान: सक्रिय",
  Active: "सक्रिय",
  "Authorize Member Portal": "सदस्य पोर्टल लगइन गर्नुहोस्",
  Users: "प्रयोगकर्ताहरू",
  "Feedback & Requests": "प्रतिक्रिया र सुझाव",
  AgriTech: "कृषि-प्रविधि",
  Nepal: "नेपाल",
  "B2B Supply Chain • Kathmandu": "B2B आपूर्ति श्रृंखला • काठमाडौँ",

  // Market Prices View & Search & Filters
  "Public Wholesale Produce Rates": "सार्वजनिक थोक कृषि उपज मूल्य",
  "Nepal Mandi Market Index": "नेपाल मन्डी बजार सूची",
  "Real-Time Direct Farmer Cooperative Rates":
    "वास्तविक समय किसान सहकारी मूल्य",
  "Search crops, districts, or sellers...":
    "बाली, जिल्ला वा विक्रेता खोज्नुहोस्...",
  "Search crops or districts...": "बाली वा जिल्ला खोज्नुहोस्...",
  "Filter by Crop": "बाली अनुसार फिल्टर",
  "Filter by District": "जिल्ला अनुसार फिल्टर",
  "All Districts": "सबै जिल्लाहरू",
  "All Categories": "सबै वर्गहरू",
  "All Crops": "सबै बालीहरू",
  Vegetables: "तरकारी",
  Spices: "मसला",
  Fruits: "फलफूल",
  Grains: "खाद्यान्न",
  "Price Range": "मूल्य दायरा",
  "Sort by Price": "मूल्य अनुसार क्रमबद्ध",
  "Price: Low to High": "मूल्य: सस्तो देखि महँगो",
  "Price: High to Low": "मूल्य: महँगो देखि सस्तो",
  "Default Sort": "साधारण क्रम",
  "Under NRs 50": "रु ५० भन्दा कम",
  "NRs 50 - 100": "रु ५० - १००",
  "Over NRs 100": "रु १०० भन्दा बढी",
  "Top Staple Crops Price Trends": "मुख्य बालीहरूको मूल्य प्रवृत्ति",
  "Compare Crops": "बाली तुलना गर्नुहोस्",
  "Select Crop A": "बाली A छान्नुहोस्",
  "Select Crop B": "बाली B छान्नुहोस्",
  "Crop Comparison": "बाली तुलना",
  "Set Price Alert": "मूल्य अलर्ट राख्नुहोस्",
  "Notify Me": "मलाई सूचित गर्नुहोस्",
  "Notify when price goes above/below": "मूल्य घटे वा बढेमा सूचित गर्नुहोस्",
  "Threshold Price": "सीमा मूल्य",
  "Email Address": "इमेल ठेगाना",
  "Submit Alert": "अलर्ट पठाउनुहोस्",
  "Refresh Prices": "मूल्य ताजा गर्नुहोस्",
  "Buy Now": "अहिले किन्नुहोस्",
  "Add to Cart": "कार्टमा थप्नुहोस्",
  "Contact Farmer": "किसानलाई सम्पर्क गर्नुहोस्",
  "Negotiate Price": "मूल्य सम्झौता गर्नुहोस्",
  "Cooperative Seller": "सहकारी विक्रेता",
  "Stock Available": "उपलब्ध मौज्दात",
  "Minimum Order": "न्यूनतम अर्डर",
  "Seller Rating": "विक्रेता मूल्याङ्कन",
  "Verified Cooperative": "प्रमाणित सहकारी",

  // Crops & Commodities
  "Tomato (Golbheda)": "गोलभेडा (Tomato)",
  Tomato: "गोलभेडा",
  "Potato (Alu)": "आलु (Potato)",
  Potato: "आलु",
  "Red Onion (Pyaaj)": "रातो प्याझ (Onion)",
  Onion: "प्याझ",
  "Cauliflower (Kauli)": "काउली (Cauliflower)",
  Cauliflower: "काउली",
  "Ginger (Aduwa)": "अदुवा (Ginger)",
  Ginger: "अदुवा",
  "Cabbage (Banda)": "बन्दाकोभी (Cabbage)",
  Cabbage: "बन्दाकोभी",
  "Garlic (Lhasun)": "लसुन (Garlic)",
  Garlic: "लसुन",
  "Carrot (Gaajar)": "गाजर (Carrot)",
  Carrot: "गाजर",
  "Green Chili": "हरियो खुर्सानी",
  Cardamom: "अलैँची",
  "Large Cardamom": "ठूलो अलैँची",
  "Fresh Vegetables": "ताजा तरकारी",
  "Spices & Herbs": "मसला र जडीबुटी",

  // Districts & Regions
  District: "जिल्ला",
  "District:": "जिल्ला:",
  Dhading: "धादिङ",
  Makwanpur: "मकवानपुर",
  Kathmandu: "काठमाडौँ",
  Kavrepalanchok: "काभ्रेपलाञ्चोक",
  Kavre: "काभ्रे",
  Bagmati: "बागमती",

  // Cart & Checkout & Coupons
  "Your Cart": "तपाईंको कार्ट",
  "Your Cart is Empty": "तपाईंको कार्ट खाली छ",
  "Browse live market listings from Dhading, Makwanpur, and Kathmandu farming cooperatives to add crops to your cart.":
    "कार्टमा बाली थप्न धादिङ, मकवानपुर र काठमाडौँका कृषि सहकारीका प्रत्यक्ष बजार सूचीहरू हेर्नुहोस्।",
  "Apply Promotional Coupon or Subsidy Code":
    "प्रवर्द्धनात्मक कुपन वा अनुदान कोड प्रयोग गर्नुहोस्",
  "Active AgriTech Coupons Available:": "सक्रिय कृषि-प्रविधि कुपनहरू उपलब्ध:",
  Apply: "प्रयोग गर्नुहोस्",
  Subtotal: "उप-जम्मा",
  Discount: "छूट",
  "Grand Total": "कुल जम्मा",
  "Proceed to Checkout": "चेकआउट अगाडि बढाउनुहोस्",
  "Cooperative Direct Order": "सहकारी प्रत्यक्ष अर्डर",
  "Clear Cart": "कार्ट खाली गर्नुहोस्",
  Item: "सामग्री",
  Items: "सामग्रीहरू",

  // Farmer Dashboard Sidebar/Tabs
  "Add crop": "बाली थप्नुहोस्",
  "Add Crop": "बाली थप्नुहोस्",
  "Orders & Negotiations": "अर्डर र सम्झौताहरू",
  "Send QR Code to Buyer": "क्रेतालाई क्युआर कोड पठाउनुहोस्",
  "Send Order QR Code to Buyer": "अर्डरको क्युआर कोड क्रेतालाई पठाउनुहोस्",
  "Select QR Code Category": "क्युआर कोड विधा छान्नुहोस्",
  "Payment QR": "भुक्तानी क्युआर",
  "Traceability QR": "उत्पत्ति प्रमाण क्युआर",
  "Dispatch QR": "ढुवानी क्युआर",
  "Save QR Image": "क्युआर फोटो सेभ गर्नुहोस्",
  "Copy QR Data": "क्युआर डाटा कपी गर्नुहोस्",
  "Scan / View Large": "स्क्यान / ठूलो हेर्नुहोस्",
  Cooperatives: "सहकारीहरू",
  "My Produce Listings": "मेरो कृषि उत्पादन सूची",
  "Add New Produce Listing": "नयाँ उत्पादन सूची थप्नुहोस्",
  "Soil Health Logs": "माटोको स्वास्थ्य रेकर्ड",
  "Harvest Records": "बाली कटनी रेकर्डहरू",
  "Price Alerts": "मूल्य अलर्टहरू",
  "Cooperative Messages": "सहकारी सन्देशहरू",
  "Sent Messages to Cooperatives": "सहकारीलाई पठाइएका सन्देशहरू",
  "Contact Cooperative": "सहकारीलाई सम्पर्क गर्नुहोस्",
  "Mark Sold": "बिक्री भएको चिन्ह लगाउनुहोस्",
  "Active Listings": "सक्रिय सूचीहरू",
  "Add New Listing": "नयाँ सूची थप्नुहोस्",
  "Log Soil Test": "माटो परीक्षण रेकर्ड गर्नुहोस्",
  "New Harvest Record": "नयाँ कटनी रेकर्ड",
  "Create Price Alert": "मूल्य अलर्ट सिर्जना गर्नुहोस्",
  "Real-Time Weather Feed Controls:": "वास्तविक समय मौसम जानकारी नियन्त्रण:",
  "Weather Alert Feed": "मौसम सतर्कता फिड",
  "Re-enable Weather Alert Feed": "मौसम सतर्कता फिड पुनः सक्रिय गर्नुहोस्",
  "Weather notification banner is currently hidden.":
    "मौसम सतर्कता ब्यानर हाल लुकाइएको छ।",

  // Buyer Dashboard
  "B2B Corporate Buyer Procurement Portal": "B2B कर्पोरेट क्रेता खरिद पोर्टल",
  "Procurement Requests": "खरिद मागहरू",
  "Post New Requisition": "नयाँ खरिद माग थप्नुहोस्",
  "Active Orders": "सक्रिय अर्डरहरू",
  "Pending Negotiations": "सम्झौताको पर्खाइमा",
  "Order History": "अर्डर इतिहास",
  "Required Crop": "आवश्यक बाली",
  "Quantity Needed (KG)": "आवश्यक परिमाण (केजी)",
  "Target Price per KG": "लक्ष्य मूल्य प्रति केजी",
  "Preferred District": "रोजिएको जिल्ला",
  "Delivery Date": "डेलिभरी मिति",
  "Payment Terms": "भुक्तानी शर्तहरू",
  "Submit Request": "माग पेश गर्नुहोस्",
  "Download VAT Invoice": "भ्याट बिल डाउनलोड गर्नुहोस्",

  // Admin Dashboard
  "Platform Administration & Governance": "प्लेटफर्म प्रशासन र सुशासन",
  "Total Registered Users": "कुल दर्ता भएका प्रयोगकर्ताहरू",
  "Active Farmers": "सक्रिय किसानहरू",
  "Corporate Buyers": "कर्पोरेट क्रेताहरू",
  "Total Market Volume": "कुल बजार कारोबार",
  "System Health": "सिस्टमको अवस्था",
  "Audit Logs": "लेखापरीक्षण लग",
  "KYC Verifications": "केवाईसी प्रमाणीकरण",
  "Export Analytics Report": "विश्लेषण रिपोर्ट एक्सपोर्ट गर्नुहोस्",

  // Weather Banner & Modal
  "🚨 RED ALERT: EXTREME DOWNPOUR & LANDSLIDE RISK":
    "🚨 रातो सतर्कता: अत्यधिक भारी वर्षा र पहिरोको जोखिम",
  "⚠️ SEVERE WEATHER WARNING: WATERLOGGING RISK":
    "⚠️ गम्भीर मौसम चेतावनी: डुबानको जोखिम",
  "ℹ️ ADVISORY: ACTIVE MONSOON SHOWERS": "ℹ️ जानकारी: सक्रिय मनसुनी वर्षा",
  "☀️ WEATHER REPORT: ALL CLEAR": "☀️ मौसम रिपोर्ट: सबै सामान्य",
  "Dhading Region:": "धादिङ क्षेत्र:",
  "Makwanpur Region:": "मकवानपुर क्षेत्र:",
  "Hilly Terraced Sector:": "पहाडी कान्ला क्षेत्र:",
  "Clean Drainage Trenches": "निकास नालाहरू सफा गर्नुहोस्",
  "Delay Highway Logistics": "राजमार्ग ढुवानी स्थगित गर्नुहोस्",
  "Protect Tomato Harvesting": "गोलभेडा खेती सुरक्षित गर्नुहोस्",
  "Safety Action Plan": "सुरक्षा कार्य योजना",
  "Monsoon Disaster Response Plan": "मनसुन विपद् प्रतिकार्य योजना",
  "Critical precautions for": "को लागि महत्त्वपूर्ण सावधानीहरू",
  "⚠️ Primary Hazards: Mudslides & Landslides (पहिरोको जोखिम)":
    "⚠️ मुख्य खतराहरू: पहिरो र हिलो बग्ने जोखिम (पहिरोको जोखिम)",

  // Contact Cooperative Modal
  "Contact Local Cooperative": "स्थानीय सहकारीलाई सम्पर्क गर्नुहोस्",
  "Selected Crop Subject": "छानिएको बाली",
  "Choose District Cooperative": "जिल्ला सहकारी छान्नुहोस्",
  "Your Message": "तपाईंको सन्देश",
  Cancel: "रद्द गर्नुहोस्",
  "Send Message": "सन्देश पठाउनुहोस्",
  "Sending...": "पठाउँदै...",
  "To:": "लाई:",
  "Crop Subject:": "बाली विषय:",

  // General Inputs & Filters
  Crop: "बाली",
  Price: "मूल्य",
  Quantity: "परिमाण",
  Status: "अवस्था",
  Actions: "कार्यहरू",

  // Alerts & Notifications
  "Alert & Notification Preferences": "अलर्ट र सूचना प्राथमिकताहरू",
  "SMS Demand Alerts": "एसएमएस माग अलर्टहरू",
  "In-App Demand Alerts": "इन-एप माग अलर्टहरू",
  "SMS Price Trend Alerts": "एसएमएस मूल्य प्रवृत्ति अलर्टहरू",
  "In-App Price Notifications": "इन-एप मूल्य सूचनाहरू",
  "Save Preferences": "प्राथमिकताहरू सुरक्षित गर्नुहोस्",
  "Preferences Saved": "प्राथमिकताहरू सुरक्षित गरियो",
  "Trigger Price Anomaly Check": "मूल्य विसंगति जाँच गर्नुहोस्",
  "Price Notifications Log": "मूल्य सूचना लग",
  "No price notifications found.": "कुनै मूल्य सूचना फेला परेन।",
  "Mark all as read": "सबै पढिएको चिन्ह लगाउनुहोस्",
  "All Notifications": "सबै सूचनाहरू",
  Unread: "नपढिएका",
  Reports: "रिपोर्टहरू",
  Reviews: "समीक्षाहरू",
  "No notifications in this category.": "यस वर्गमा कुनै सूचना छैन।",

  // Login / Register Views
  "B2B Supply Chain Authentication Gate": "B2B आपूर्ति श्रृंखला प्रमाणिकरण गेट",
  "Username / Email": "प्रयोगकर्ता नाम / इमेल",
  Password: "पासवर्ड",
  "Select Marketplace Role": "बजार भूमिका छान्नुहोस्",
  "Signing In...": "साइन इन गर्दै...",
  "Don't have an account? Register": "खाता छैन? दर्ता गर्नुहोस्",
  "Create Authorized Account": "प्रमाणित खाता सिर्जना गर्नुहोस्",
  "Full Name": "पूरा नाम",
  "District Office Sector": "जिल्ला कार्यालय क्षेत्र",
  "Register New Account": "नयाँ खाता दर्ता गर्नुहोस्",
  "Registering...": "दर्ता गर्दै...",
  "Already have an account? Login": "पहिले नै खाता छ? लगइन गर्नुहोस्",

  // QR Code & Upload Translations
  "Send / Upload QR Code": "क्यूआर कोड पठाउनुहोस् / अपलोड गर्नुहोस्",
  "Upload QR Image": "क्यूआर फोटो अपलोड गर्नुहोस्",
  "Uploaded Custom QR Code": "अपलोड गरिएको कस्टम क्यूआर कोड",
  "Click to Upload Saved QR Code Image":
    "सेभ गरिएको क्यूआर कोड फोटो अपलोड गर्न क्लिक गर्नुहोस्",
  "Upload eSewa, Khalti, Bank QR, or Custom Batch Tag Image (.png, .jpg, .jpeg)":
    "इसेवा, खल्ती, बैंक क्यूआर वा ब्याज ट्याग फोटो (.png, .jpg, .jpeg) अपलोड गर्नुहोस्",
  "QR Code Image Loaded": "क्यूआर कोड फोटो लोड भयो",
  "Click to change image": "फोटो फेर्न क्लिक गर्नुहोस्",
  "Or Upload Custom QR Image": "वा कस्टम क्यूआर फोटो अपलोड गर्नुहोस्",
  "Upload Image to Preview": "प्रिभ्युका लागि फोटो अपलोड गर्नुहोस्",

  // Navigation Tabs Translations
  "Shop Farms": "फार्महरू खरिद गर्नुहोस्",
  "Demand Feed": "माग फिड",
  // "Orders & Negotiations": "अर्डर तथा मोलमोलाइ",
  "Price Entry": "मूल्य प्रविष्टि",
  Verification: "प्रमाणीकरण",
  "Market Analysis": "बजार विश्लेषण",
  Feedback: "प्रतिक्रिया",
};

// Word map for intelligent sub-phrase replacement in Nepali mode
const subphraseMap: [RegExp, string][] = [
  [/\bKathmandu\b/gi, "काठमाडौँ"],
  [/\bDhading\b/gi, "धादिङ"],
  [/\bMakwanpur\b/gi, "मकवानपुर"],
  [/\bKavre\b/gi, "काभ्रे"],
  [/\bBagmati\b/gi, "बागमती"],
  [/\bTomato\b/gi, "गोलभेडा"],
  [/\bPotato\b/gi, "आलु"],
  [/\bOnion\b/gi, "प्याझ"],
  [/\bCauliflower\b/gi, "काउली"],
  [/\bGinger\b/gi, "अदुवा"],
  [/\bCabbage\b/gi, "बन्दाकोभी"],
  [/\bGarlic\b/gi, "लसुन"],
  [/\bCarrot\b/gi, "गाजर"],
  [/\bFarmer\b/gi, "किसान"],
  [/\bBuyer\b/gi, "क्रेता"],
  [/\bAdmin\b/gi, "प्रशासक"],
  [/\bCooperative\b/gi, "सहकारी"],
  [/\bPrice\b/gi, "मूल्य"],
  [/\bQuantity\b/gi, "परिमाण"],
  [/\bDistrict\b/gi, "जिल्ला"],
  [/\bStatus\b/gi, "अवस्था"],
  [/\bCategory\b/gi, "वर्ग"],
  [/\bVegetable\b/gi, "तरकारी"],
  [/\bSpice\b/gi, "मसला"],
  [/\bFruit\b/gi, "फलफूल"],
  [/\bGrain\b/gi, "खाद्यान्न"],
  [/\bSearch\b/gi, "खोज्नुहोस्"],
  [/\bFilter\b/gi, "फिल्टर"],
  [/\bClear\b/gi, "सफा गर्नुहोस्"],
  [/\bSave\b/gi, "सुरक्षित गर्नुहोस्"],
  [/\bCancel\b/gi, "रद्द गर्नुहोस्"],
  [/\bDelete\b/gi, "हटाउनुहोस्"],
  [/\bEdit\b/gi, "सम्पादन गर्नुहोस्"],
  [/\bAdd\b/gi, "थप्नुहोस्"],
  [/\bView\b/gi, "हेर्नुहोस्"],
  [/\bOrder\b/gi, "अर्डर"],
  [/\bCart\b/gi, "कार्ट"],
  [/\bTotal\b/gi, "जम्मा"],
  [/\bPending\b/gi, "पेन्डिङ"],
  [/\bActive\b/gi, "सक्रिय"],
  [/\bApproved\b/gi, "स्वीकृत"],
];

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// FIX: Explicitly type the destructured props object directly
export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("agritech_lang");
    return (saved === "ne" ? "ne" : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("agritech_lang", lang);
  };

  const t = (key: string): string => {
    if (!key) return "";
    if (language !== "ne") return key;

    // 1. Direct dictionary match
    if (nepaliTranslations[key]) {
      return nepaliTranslations[key];
    }

    // 2. Trimmed match
    const trimmed = key.trim();
    if (nepaliTranslations[trimmed]) {
      return nepaliTranslations[trimmed];
    }

    // 3. Fallback: Apply intelligent subphrase replacement
    let converted = key;
    let matchedAny = false;
    for (const [regex, replacement] of subphraseMap) {
      if (regex.test(converted)) {
        converted = converted.replace(regex, replacement);
        matchedAny = true;
      }
    }

    return matchedAny ? converted : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
