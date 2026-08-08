import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ne';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // App Header
  'app.title': { en: 'AgriTech', ne: 'एग्रिटेक' },
  'app.country': { en: 'Nepal', ne: 'नेपाल' },
  'nav.dashboard': { en: 'DASHBOARD', ne: 'ड्यासबोर्ड' },
  'nav.marketRate': { en: 'MARKET RATE', ne: 'बजार मूल्य' },
  'nav.supplyChain': { en: 'SUPPLY CHAIN', ne: 'आपूर्ति श्रृंखला' },
  'nav.cart': { en: 'Cart', ne: 'कार्ट' },
  
  // Dashboard Subtabs
  'dash.priceEntry': { en: 'Price Entry', ne: 'मूल्य प्रविष्टि' },
  'dash.verification': { en: 'Verification', ne: 'प्रमाणिकरण' },
  'dash.marketAnalysis': { en: 'Market Analysis', ne: 'बजार विश्लेषण' },
  'dash.userManagement': { en: 'User Management', ne: 'प्रयोगकर्ता व्यवस्थापन' },
  'dash.feedback': { en: 'Feedback', ne: 'प्रतिक्रिया' },

  // Price Entry
  'entry.title': { en: 'LOG DAILY CROP INDICES', ne: 'दैनिक बाली सूचकांक प्रविष्ट गर्नुहोस्' },
  'entry.cropName': { en: 'CROP NAME', ne: 'बालीको नाम' },
  'entry.region': { en: 'REGION', ne: 'क्षेत्र' },
  'entry.rate': { en: 'RATE (NRS/KG)', ne: 'दर (नेरु/केजी)' },
  'entry.sourceMarket': { en: 'SOURCE MARKET ORIGIN', ne: 'स्रोत बजार उद्गम' },
  'entry.loggingDate': { en: 'LOGGING DATE', ne: 'प्रविष्टि मिति' },
  'entry.btnPublish': { en: 'PUBLISH WHOLESALE PRICE', ne: 'थोक मूल्य प्रकाशित गर्नुहोस्' },

  // Guild Box
  'guild.title': { en: 'LIGHT CODE INTERNAL ENTRY GUILD', ne: 'आन्तरिक प्रविष्टि मार्गदर्शिका' },
  'guild.kathmanduIndex': { en: 'Kathmandu Index', ne: 'काठमाडौँ सूचकांक' },
  'guild.hillIndex': { en: 'Hill Index', ne: 'पहाडी सूचकांक' },
  'guild.teraiIndex': { en: 'Terai Index', ne: 'तराई सूचकांक' },

  // Market Rate Banner
  'market.nationalIndex': { en: 'National Market Price Index (राष्ट्रिय दैनिक बजार मूल्य प्रणाली)', ne: 'राष्ट्रिय दैनिक बजार मूल्य प्रणाली' },
  'market.mainTitle': { en: 'Daily Wholesale Produce Price Index & Rate Tracker', ne: 'दैनिक थोक कृषि उपज मूल्य सूचकांक र दर ट्र्याकर' },
  'market.setAlert': { en: 'Set Price Alert', ne: 'मूल्य सतर्कता सेट गर्नुहोस्' },
  'market.refresh': { en: 'Refresh', ne: 'पुनःताजा गर्नुहोस्' },

  // Supply Chain Banner
  'supply.hubBadge': { en: 'B2B Supply Chain Hub (व्यापारिक आपूर्ति प्रणाली)', ne: 'व्यापारिक आपूर्ति प्रणाली' },
  'supply.mainTitle': { en: 'Bulk Forward Contracts & Cold-Chain Logistics', ne: 'थोक अग्रिम सम्झौता र कोल-चेन लजिस्टिक' },
  'supply.supportDisputes': { en: 'Support & Disputes', ne: 'सहायता र विवाद' },
  'supply.auditLogs': { en: 'Audit Trail Logs', ne: 'लेखापरीक्षण लगहरू' },
  
  // Footer
  'footer.services': { en: 'PLATFORM SERVICES', ne: 'प्लेटफर्म सेवाहरू' },
  'footer.hubs': { en: 'KEY HUBS', ne: 'प्रमुख केन्द्रहरू' },
  'footer.partner': { en: 'TECHNICAL PARTNER', ne: 'प्राविधिक साझेदार' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
