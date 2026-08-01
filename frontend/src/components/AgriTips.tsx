import React, { useState, useEffect } from "react";
import { Lightbulb, RefreshCw, Sparkles, MapPin, ThumbsUp, Copy, Check, Truck, Sprout, TrendingUp, FlaskConical, ChevronRight, Share2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface AgriTip {
  id: string;
  category: "Farming & Cultivation" | "Supply Chain & Post-Harvest" | "Market Intelligence" | "Soil & Pest Management";
  title: string;
  district: "Dhading" | "Makwanpur" | "Kathmandu" | "Kavre" | "Chitwan" | "All";
  tip: string;
  nepaliTip: string;
  authorRole: string;
}

const DISTRICT_TIPS: AgriTip[] = [
  // Dhading
  {
    id: "dhading-1",
    category: "Supply Chain & Post-Harvest",
    title: "Crate Packaging on Prithvi Highway",
    district: "Dhading",
    tip: "When trucking fresh cauliflowers from Galchhi or Malekhu to Kalimati, pack in ventilated plastic crates instead of jute sacks to reduce transit bruising losses by 35%.",
    nepaliTip: "गाल्छी वा मलेखुबाट काठमाडौँ काउली ढुवानी गर्दा बोराको सट्टा प्वाल भएको प्लास्टिक क्रेट प्रयोग गर्दा नोक्सानी ३५% सम्म घट्छ।",
    authorRole: "Dhading Transport Coop Lead"
  },
  {
    id: "dhading-2",
    category: "Market Intelligence",
    title: "Balkhu Early Morning Auctions",
    district: "Dhading",
    tip: "Trucks arriving at Balkhu and Kalimati wholesale mandis between 4:00 AM and 5:30 AM secure 8-12% higher initial auction rates before peak market volume settles.",
    nepaliTip: "बिहान ४:०० देखि ५:३० बजेभित्र बल्खु र कालिमाटी बजार पुग्ने गाडीले ८-१२% सम्म बढी थोक मूल्य पाउँछन्।",
    authorRole: "Kalimati Mandi Analyst"
  },
  {
    id: "dhading-3",
    category: "Farming & Cultivation",
    title: "Monsoon Tomato Splash Blight Protection",
    district: "Dhading",
    tip: "Apply organic neem and wood-ash dust around tomato stems on hillside terraces in Dhading to prevent splash-borne fungal blight during heavy monsoon rains.",
    nepaliTip: "धादिङका पाखा खेतमा गोलभेडाको फेदमा काठको खरानी र निमको धूलो हाल्दा बर्खे डढुवा रोगबाट बचाउन सकिन्छ।",
    authorRole: "Senior Agronomist"
  },
  {
    id: "dhading-4",
    category: "Soil & Pest Management",
    title: "Terrace Soil Erosion Barriers",
    district: "Dhading",
    tip: "Plant vetiver grass or legume strips along hillside terrace edges in Dhading to trap nutrient-rich topsoil during monsoon torrents.",
    nepaliTip: "धादिङका गरा खेतको डीलमा बेत वा कोसे बाली लगाउँदा बर्खाको भेलले माटो बगाउन पाउँदैन।",
    authorRole: "Soil Conservation Officer"
  },

  // Makwanpur
  {
    id: "makwanpur-1",
    category: "Supply Chain & Post-Harvest",
    title: "Ginger Rhizome Shade Curing",
    district: "Makwanpur",
    tip: "Shade-cure freshly dug ginger rhizomes in Palung for 24-36 hours before packing into mesh sacks. This cures rhizome skin and prevents wet rot during transit to Hetauda.",
    nepaliTip: "पालुङमा खनिएको अदुवालाई २४-३६ घण्टा छायाँमा सुकाएर मात्र जालीदार बोरामा प्याक गर्दा ढुवानीमा कुहिने समस्या हट्छ।",
    authorRole: "Post-Harvest Specialist"
  },
  {
    id: "makwanpur-2",
    category: "Soil & Pest Management",
    title: "Palung Highland Soil Lime Treatment",
    district: "Makwanpur",
    tip: "Highland vegetable soils in Palung tend to become acidic after monsoon rains. Apply 50kg agricultural lime per ropani 2 weeks prior to autumn potato planting.",
    nepaliTip: "पालुङको उच्च पहाडी क्षेत्रमा वर्षातपछि माटोको अम्लीयपन बढ्ने हुँदा आलु रोप्नु २ हप्ता अघि प्रति रोपनी ५० किलो कृषि चुन हाल्नुहोस्।",
    authorRole: "Soil Test Lab Technician"
  },
  {
    id: "makwanpur-3",
    category: "Market Intelligence",
    title: "Institutional B2B Off-Season Sales",
    district: "Makwanpur",
    tip: "Direct B2B contracts for Daman off-season cabbage with Kathmandu hotel buyers guarantee farm-gate prices 20% above spot mandi rates.",
    nepaliTip: "दामनको बेमौसमी बन्दाका लागि काठमाडौँका होटेलहरूसँग सोझै B2B सम्झौता गर्दा बजार दरभन्दा २०% बढी मूल्य पाइन्छ।",
    authorRole: "Agri-Market Advisor"
  },

  // Kathmandu
  {
    id: "kathmandu-1",
    category: "Market Intelligence",
    title: "Direct Hospitality B2B Contracts",
    district: "Kathmandu",
    tip: "Supplying fresh produce directly to Kathmandu hotels and restaurant cooperatives via B2B advance contracts guarantees fixed pricing and bypasses 3 broker tiers.",
    nepaliTip: "काठमाडौँका होटेल र रेस्टुरेन्टहरूलाई B2B सम्झौता मार्फत सोझै तरकारी आपूर्ति गर्दा बिचौलिया बिना स्थिर मूल्य पाइन्छ।",
    authorRole: "B2B Procurement Manager"
  },
  {
    id: "kathmandu-2",
    category: "Farming & Cultivation",
    title: "Peri-Urban Drip Irrigation Efficiency",
    district: "Kathmandu",
    tip: "For Tokha and Manohara urban farms, utilizing low-cost drip tape with organic straw mulching cuts irrigation water usage by 45% during dry pre-monsoon heatwaves.",
    nepaliTip: "तोखा र मनोहराका सहरी खेतहरूमा थोपा सिँचाइ र परालको छापो प्रयोग गर्दा सुख्खा याममा ४५% पानी बचत हुन्छ।",
    authorRole: "Horticulture Specialist"
  },
  {
    id: "kathmandu-3",
    category: "Supply Chain & Post-Harvest",
    title: "Same-Day Urban Farm-Fresh Premium",
    district: "Kathmandu",
    tip: "Harvesting leafy greens at 4:30 AM in Kathmandu Valley allows 7:00 AM delivery to retail buyers, commanding a 'Same-Day Harvest' price premium of NRs 10-15/KG.",
    nepaliTip: "बिहान ४:३० बजे टिपिएको हरियो साग ७:०० बजेसम्म बजार पुर्याउँदा ताजापनका कारण प्रतिकिलो रु १०-१५ बढी मूल्य पाइन्छ।",
    authorRole: "Urban Supply Logistics Lead"
  },

  // Kavre
  {
    id: "kavre-1",
    category: "Farming & Cultivation",
    title: "Panauti Valley Soil Crop Rotation",
    district: "Kavre",
    tip: "Rotate potato crops with nitrogen-fixing bush beans or field peas in Panauti to naturally replenish soil nitrates and reduce synthetic urea requirement by 25%.",
    nepaliTip: "पनौती उपत्यकामा आलुपछि सिमी वा केराउ बाली लगाउँदा माटोको उर्वरशक्ति प्राकृतिक रूपमा बढ्छ र युरिया मल २५% कम चाहिन्छ।",
    authorRole: "Kavre Krishi Officer"
  },
  {
    id: "kavre-2",
    category: "Supply Chain & Post-Harvest",
    title: "Arniko Highway Morning Transit",
    district: "Kavre",
    tip: "Utilize Arniko Highway morning pickup slots between 5:00 AM and 6:30 AM to deliver fresh produce to Koteshwor hub within 90 minutes of harvest.",
    nepaliTip: "अरनिको राजमार्गमा बिहान ५:०० देखि ६:३० बजेभित्र गाडी चलाउँदा कोटेश्वर हबमा ९० मिनेटमै ताजा तरकारी पुर्याउन सकिन्छ।",
    authorRole: "Freight Coordinator"
  },

  // Chitwan
  {
    id: "chitwan-1",
    category: "Supply Chain & Post-Harvest",
    title: "Narayangarh Misting Chamber Cooling",
    district: "Chitwan",
    tip: "Pre-cool leafy vegetables in shaded misting chambers at Narayangarh collection hubs before loading night trucks to Kathmandu to preserve crispness and weight.",
    nepaliTip: "नारायणगढमा हरियो सागपातलाई काठमाडौँ पठाउनु अघि छहारीयुक्त च्याम्बरमा चिसो बनाउँदा ताजगी र तौल कायम रहन्छ।",
    authorRole: "Cold Chain Engineer"
  },

  // All / General
  {
    id: "all-1",
    category: "Supply Chain & Post-Harvest",
    title: "Consolidated Cooperative Truck Freight",
    district: "All",
    tip: "Smallholders who pool harvests through local agricultural cooperatives into shared 2-ton truck loads reduce per-kilogram freight costs by up to 30%.",
    nepaliTip: "स्थानिय कृषि सहकारी मार्फत २ टनको गाडीमा संयुक्त रूपमा कृषि उपज ढुवानी गर्दा प्रतिकिलो भाडा ३०% सम्म बचत हुन्छ।",
    authorRole: "AgriTech Logistics Lead"
  },
  {
    id: "all-2",
    category: "Soil & Pest Management",
    title: "Organic Yellow Sticky Traps for Aphids",
    district: "All",
    tip: "Hang yellow sticky traps 15cm above crop canopy to monitor and capture whiteflies and aphids before pest populations cross economic damage thresholds.",
    nepaliTip: "बालीभन्दा १५ सेमी माथि पहेँलो टाँसिने ट्र्याप राख्दा सेतो झिँगा र लाही किराको समयमै नियन्त्रण हुन्छ।",
    authorRole: "IPM Advisor"
  },
  {
    id: "all-3",
    category: "Farming & Cultivation",
    title: "Staggered Harvest Planting Windows",
    district: "All",
    tip: "Staggering seed sowing dates in 7-10 day intervals prevents single-week supply gluts and ensures steady weekly cash flow during harvest season.",
    nepaliTip: "७-१० दिनको फरकमा बीउ छर्दा एकैपटक बजारमा मन्दी आउन पाउँदैन र हप्तापिच्छे नियमित आम्दानी हुन्छ।",
    authorRole: "Crop Planner"
  }
];

interface AgriTipsProps {
  initialDistrict?: string;
  className?: string;
  onDistrictSelect?: (district: string) => void;
  compact?: boolean;
}

export default function AgriTips({ initialDistrict = "Dhading", className = "", onDistrictSelect, compact = false }: AgriTipsProps) {
  const { language, t } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [currentTip, setCurrentTip] = useState<AgriTip | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState<number>(14);
  const [hasVoted, setHasVoted] = useState(false);

  // Sync if initialDistrict changes
  useEffect(() => {
    if (initialDistrict && initialDistrict !== "all") {
      setSelectedDistrict(initialDistrict);
    }
  }, [initialDistrict]);

  // Pick a random tip matching the selected district or "All"
  const pickRandomTip = (districtName: string) => {
    setIsRefreshing(true);
    setCopied(false);

    setTimeout(() => {
      const eligibleTips = DISTRICT_TIPS.filter(
        tip => tip.district === districtName || tip.district === "All" || districtName === "all"
      );

      if (eligibleTips.length === 0) {
        const fallback = DISTRICT_TIPS.filter(t => t.district === "All");
        const randomFallback = fallback[Math.floor(Math.random() * fallback.length)];
        setCurrentTip(randomFallback);
      } else {
        // Pick random tip (avoid identical tip if multiple options exist)
        let choice = eligibleTips[Math.floor(Math.random() * eligibleTips.length)];
        if (eligibleTips.length > 1 && currentTip && choice.id === currentTip.id) {
          const alternate = eligibleTips.filter(t => t.id !== currentTip.id);
          choice = alternate[Math.floor(Math.random() * alternate.length)];
        }
        setCurrentTip(choice);
      }
      setIsRefreshing(false);
    }, 200);
  };

  useEffect(() => {
    pickRandomTip(selectedDistrict);
  }, [selectedDistrict]);

  const handleDistrictChange = (d: string) => {
    setSelectedDistrict(d);
    if (onDistrictSelect) {
      onDistrictSelect(d);
    }
  };

  const handleCopy = () => {
    if (!currentTip) return;
    const textToCopy = `${currentTip.title} (${currentTip.district}): ${language === "ne" ? currentTip.nepaliTip : currentTip.tip} - AgriTech Nepal Tip`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHelpfulVote = () => {
    if (hasVoted) return;
    setHelpfulCount(prev => prev + 1);
    setHasVoted(true);
  };

  const getCategoryBadge = (cat: AgriTip["category"]) => {
    switch (cat) {
      case "Farming & Cultivation":
        return { icon: Sprout, bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" };
      case "Supply Chain & Post-Harvest":
        return { icon: Truck, bg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" };
      case "Market Intelligence":
        return { icon: TrendingUp, bg: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800" };
      case "Soil & Pest Management":
        return { icon: FlaskConical, bg: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800" };
      default:
        return { icon: Lightbulb, bg: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" };
    }
  };

  if (!currentTip) return null;

  const CategoryBadgeIcon = getCategoryBadge(currentTip.category).icon;

  return (
    <div className={`bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border border-amber-300/60 dark:border-emerald-800/60 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all duration-200 ${className}`}>
      
      {/* Subtle background glow effect */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-400/10 dark:bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/60 dark:border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg shadow-2xs shrink-0 font-bold">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display flex items-center space-x-1">
              <span>{t("District AgriTip")}</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </h4>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {t("Daily farming & logistics advisory")}
            </div>
          </div>
        </div>

        {/* District Selector & Refresh Trigger */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            title="Select District for tailored tips"
          >
            <option value="Dhading">{t("Dhading")}</option>
            <option value="Makwanpur">{t("Makwanpur")}</option>
            <option value="Kathmandu">{t("Kathmandu")}</option>
            <option value="Kavre">{t("Kavre")}</option>
            <option value="Chitwan">{t("Chitwan")}</option>
            <option value="all">{t("All Districts")}</option>
          </select>

          <button
            onClick={() => pickRandomTip(selectedDistrict)}
            disabled={isRefreshing}
            className="p-1.5 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-700 text-amber-800 dark:text-amber-400 rounded-lg transition duration-150 cursor-pointer shadow-2xs flex items-center justify-center disabled:opacity-50"
            title={t("Randomize or show next tip")}
            id="randomize-agritip-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Tip Body */}
      <div className="pt-3 space-y-2.5">
        {/* Meta badges: Category & District */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border font-semibold ${getCategoryBadge(currentTip.category).bg}`}>
            <CategoryBadgeIcon className="w-3 h-3" />
            <span>{currentTip.category}</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{currentTip.district === "All" ? t("All Nepal Districts") : `${currentTip.district} District`}</span>
          </span>
        </div>

        {/* Tip Title */}
        <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
          {currentTip.title}
        </h5>

        {/* Tip Content Body */}
        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-850/80 p-2.5 rounded-xl border border-amber-100 dark:border-slate-800/80">
          {language === "ne" ? currentTip.nepaliTip : currentTip.tip}
        </p>

        {/* Bottom Actions Footer */}
        <div className="pt-1 flex items-center justify-between text-[10px]">
          <div className="text-slate-400 dark:text-slate-500 font-medium italic">
            &mdash; {currentTip.authorRole}
          </div>

          <div className="flex items-center space-x-2">
            {/* Useful Feedback Button */}
            <button
              onClick={handleHelpfulVote}
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer border ${
                hasVoted
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                  : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`}
              title="Mark this tip as helpful"
            >
              <ThumbsUp className={`w-3 h-3 ${hasVoted ? "fill-emerald-600 text-emerald-600" : ""}`} />
              <span>{helpfulCount} {hasVoted ? "Helpful" : "Helpful?"}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md transition cursor-pointer text-[10px] font-medium"
              title="Copy tip text"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
