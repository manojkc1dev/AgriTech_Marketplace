import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Sparkles,
  ShieldCheck,
  UserCheck,
  MapPin,
  Send,
  Building2,
  Award
} from "lucide-react";
import { User } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface ReviewsRatingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  authorRole: string;
  district: string;
  cropOrService: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  likes: number;
  likedByMe?: boolean;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev_1",
    authorName: "Sita Sharma",
    authorRole: "B2B Wholesaler",
    district: "Kathmandu",
    cropOrService: "Organic Dhading Cabbage & Tomato",
    rating: 5,
    comment: "Ordered 500 KG of organic cabbages from Dhading Smallholder Farm. Direct cold-chain transport arrived in Kalimati market within 6 hours. Freshness was exceptional and zero transit loss!",
    date: "2026-07-28",
    verifiedPurchase: true,
    likes: 24
  },
  {
    id: "rev_2",
    authorName: "Ram Bahadur Tamang",
    authorRole: "Smallholder Farmer",
    district: "Dhading",
    cropOrService: "AgriTech B2B Marketplace Trade",
    rating: 5,
    comment: "Selling produce directly through this platform eliminated middleman commissions. Received prompt eSewa payout immediately upon delivery verification. Highly recommended for all farmers in Bagmati province!",
    date: "2026-07-25",
    verifiedPurchase: true,
    likes: 38
  },
  {
    id: "rev_3",
    authorName: "Bikash Gurung",
    authorRole: "Hotel Procurement Director",
    district: "Kaski",
    cropOrService: "Pokhara Fine Basmati Rice",
    rating: 4,
    comment: "Consistent high quality and moisture content. VAT invoice was generated instantly for our hotel accounting records. Will be subscribing for monthly bulk supply.",
    date: "2026-07-20",
    verifiedPurchase: true,
    likes: 19
  },
  {
    id: "rev_4",
    authorName: "Anita Karki",
    authorRole: "Agri Cooperative Manager",
    district: "Chitwan",
    cropOrService: "Chitwan Sweet Corn Bulk Batch",
    rating: 5,
    comment: "The QR code traceability system built into every batch allowed our buyers to verify soil health records and harvest date instantly. Built tremendous buyer trust!",
    date: "2026-07-15",
    verifiedPurchase: true,
    likes: 31
  }
];

export default function ReviewsRatingsModal({ isOpen, onClose, user }: ReviewsRatingsModalProps) {
  const { t } = useLanguage();

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem("agritech_user_reviews");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_REVIEWS;
  });

  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingReview, setIsAddingReview] = useState(false);

  // New Review Form state
  const [cropOrService, setCropOrService] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState(user?.fullName || "");
  const [district, setDistrict] = useState(user?.district || "Kathmandu");
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("agritech_user_reviews", JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  useEffect(() => {
    if (user) {
      setAuthorName(user.fullName || "");
      setDistrict(user.district || "Kathmandu");
    }
  }, [user]);

  if (!isOpen) return null;

  const handleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const liked = r.likedByMe;
          return {
            ...r,
            likes: liked ? r.likes - 1 : r.likes + 1,
            likedByMe: !liked
          };
        }
        return r;
      })
    );
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !cropOrService.trim()) return;

    const newRev: ReviewItem = {
      id: "rev_" + Date.now(),
      authorName: authorName.trim() || "Anonymous Agronomist",
      authorRole: user?.role === "farmer" ? "Farmer" : user?.role === "buyer" ? "Wholesale Buyer" : "Community Trader",
      district: district || "Kathmandu",
      cropOrService: cropOrService.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split("T")[0],
      verifiedPurchase: true,
      likes: 1
    };

    setReviews([newRev, ...reviews]);
    setComment("");
    setCropOrService("");
    setIsAddingReview(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== "all" && r.rating !== filterRating) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.cropOrService.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate statistics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : "5.0";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-amber-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/30 shadow-xs">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display text-white flex items-center space-x-2">
                <span>{t("Reviews & Quality Ratings")}</span>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-mono font-bold">
                  ★ {avgRating} / 5.0
                </span>
              </h3>
              <p className="text-[11px] text-amber-100/80">
                {t("Verified farmer produce ratings, B2B trade feedback & buyer trust scores")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-amber-100 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Close Reviews"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast */}
        {successToast && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center space-x-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{t("Your review & rating has been published successfully!")}</span>
          </div>
        )}

        {/* Top Summary Bar & Action */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-2xl font-black text-amber-950 dark:text-amber-300 font-mono">{avgRating}</span>
              <div>
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {totalReviews} {t("Verified Reviews")}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 border-l border-amber-200 dark:border-amber-900/50 pl-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% {t("Verified Trade Records")}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingReview(!isAddingReview)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5 shrink-0"
          >
            {isAddingReview ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingReview ? t("Cancel") : t("Write a Review")}</span>
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Write New Review Form Drawer */}
          {isAddingReview && (
            <form onSubmit={handlePostReview} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-850 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-3.5 shadow-md animate-in slide-in-from-top-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t("Post your produce / trade experience review")}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("Crop / Farmer / Trade Order Name")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhading Fresh Cabbage Batch #402"
                    value={cropOrService}
                    onChange={(e) => setCropOrService(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("Rating")} (1 - 5 Stars) *
                  </label>
                  <div className="flex items-center space-x-1 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            starVal <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2 font-mono">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("Review Details & Feedback")} *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details regarding quality, freshness, delivery timeliness, or market fairness..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t("Publish Review")}</span>
                </button>
              </div>
            </form>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t("Search reviews by crop, farmer or district...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filter by Rating buttons */}
            <div className="flex items-center space-x-1 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-bold mr-1 hidden sm:inline">
                {t("Stars")}:
              </span>
              <button
                type="button"
                onClick={() => setFilterRating("all")}
                className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
                  filterRating === "all"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                }`}
              >
                {t("All")}
              </button>

              {[5, 4, 3].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFilterRating(star)}
                  className={`px-2 py-1 rounded-lg font-bold border transition cursor-pointer flex items-center space-x-0.5 ${
                    filterRating === star
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </button>
              ))}
            </div>

          </div>

          {/* Reviews List */}
          <div className="space-y-3 pt-1">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {t("No reviews match your current filters.")}
                </p>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2.5 shadow-2xs hover:border-amber-400/50 transition"
                >
                  {/* Top line: Author info & Star rating */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {rev.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {rev.authorName}
                          </span>
                          {rev.verifiedPurchase && (
                            <span className="px-1.5 py-0.25 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold rounded-md border border-emerald-300 dark:border-emerald-800 flex items-center space-x-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified Trade</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{rev.authorRole}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                            <span>{rev.district}</span>
                          </span>
                          <span>•</span>
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 shrink-0">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-amber-950 dark:text-amber-300 font-mono">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Crop / Service Tag */}
                  <div className="inline-block px-2.5 py-1 bg-amber-100/60 dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 rounded-lg text-[11px] font-bold text-amber-950 dark:text-amber-300">
                    🌾 {rev.cropOrService}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    "{rev.comment}"
                  </p>

                  {/* Footer: Upvote helpful */}
                  <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-200/50 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px]">
                      AgriTech Trade ID: #{rev.id.toUpperCase()}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleLike(rev.id)}
                      className={`px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center space-x-1 text-xs font-bold ${
                        rev.likedByMe
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${rev.likedByMe ? "fill-amber-600 text-amber-600" : ""}`} />
                      <span>{t("Helpful")}</span>
                      <span className="font-mono font-bold text-[10px]">({rev.likes})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {totalReviews} {t("Verified Community Ratings")}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            {t("Done")}
          </button>
        </div>

      </div>
    </div>
  );
}
