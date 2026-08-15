import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Clock, CalendarHeart, Gift, ChevronRight, Star, 
  Heart, CheckCircle2, CalendarPlus, Search, Info, Copy,
  ChevronLeft, Scissors, Smile, Bath
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Review, Treatment, Promo } from '../types';
import { fetchReviews, fetchTreatments, fetchPromos } from '../services/dataService';
import treatmentImage from '../assets/images/salon_facial_treatment_1781142879240.png';

interface HomePageProps {
  userProfile: UserProfile | null;
  onNavigate: (tabId: string) => void;
  onNavigateToBooking: (treatmentName: string, promoId?: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigateToCategory?: (categoryName: string) => void;
}

export default function HomePage({ 
  userProfile, 
  onNavigate, 
  onNavigateToBooking, 
  onShowToast,
  searchQuery,
  setSearchQuery,
  onNavigateToCategory
}: HomePageProps) {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch (_) {}
    }
  };

  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [prevPromoIndex, setPrevPromoIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right-to-left, -1 for left-to-right
  
  const firstName = userProfile?.displayName?.split(' ')[0] || 'Shaliha';
  const bannerPromos = promos; // Stack all promotions to ensure there are at least 4 items

  useEffect(() => {
    if (bannerPromos.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setPrevPromoIndex(activePromoIndex);
      setActivePromoIndex((prev) => (prev + 1) % bannerPromos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [bannerPromos.length, activePromoIndex]);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    onShowToast(`🎟️ Kode promo "${code}" berhasil disalin!`, "success");
  };

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Load spotlight reviews: sort by rating descending, then newest date
        const reviewData = await fetchReviews();
        const bestReviews = [...reviewData].sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }).slice(0, 3);
        setReviewsList(bestReviews);

        // 2. Load dynamic treatments list
        const treatmentData = await fetchTreatments();
        setTreatments(treatmentData);
        setFilteredTreatments(treatmentData);

        // 3. Load dynamic promos list
        const promosData = await fetchPromos();
        setPromos(promosData);
      } catch (e) {
        console.error("Gagal memuat data utama:", e);
      } finally {
        setLoadingTreatments(false);
      }
    }
    loadData();
  }, []);

  // Filter & Search logic
  useEffect(() => {
    let result = treatments;

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(t => {
        const nameLower = t.name.toLowerCase();
        const descLower = (t.description || "").toLowerCase();
        const catLower = (t.category || "").toLowerCase();

        if (selectedCategory === "Hair Treatment") {
          return catLower === "hair" || nameLower.includes("hair") || nameLower.includes("creambath") || nameLower.includes("shampoo") || nameLower.includes("rambut") || descLower.includes("rambut") || descLower.includes("hair") || descLower.includes("creambath");
        }
        if (selectedCategory === "Facial Treatment") {
          return catLower === "facial" || catLower === "microbright" || catLower === "laser" || nameLower.includes("facial") || nameLower.includes("totok") || nameLower.includes("aura") || nameLower.includes("wajah") || nameLower.includes("facian") || descLower.includes("wajah") || descLower.includes("facial") || descLower.includes("totok");
        }
        if (selectedCategory === "Body Treatment") {
          return catLower === "body" || nameLower.includes("massage") || nameLower.includes("lulur") || nameLower.includes("body") || nameLower.includes("tubuh") || descLower.includes("tubuh") || descLower.includes("body") || descLower.includes("massage") || descLower.includes("lulur");
        }
        if (selectedCategory === "Spa") {
          return catLower === "spa" || nameLower.includes("spa") || nameLower.includes("manicure") || nameLower.includes("pedicure") || nameLower.includes("nail") || nameLower.includes("kuku") || descLower.includes("spa") || descLower.includes("kuku") || descLower.includes("nail");
        }
        return true;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        (t.description || "").toLowerCase().includes(q)
      );
    }

    setFilteredTreatments(result);
  }, [selectedCategory, searchQuery, treatments]);

  const categories = ["All", "Hair Treatment", "Facial Treatment", "Body Treatment", "Spa"];

  return (
    <div className="space-y-6 pb-28 text-stone-800 animate-fade-in-up relative font-sans">
      
      {/* ======================================================== */}
      {/* PROMO SPESIAL (PROMOTIONS BANNER) - TOP SECTION          */}
      {/* ======================================================== */}
      <section className="relative overflow-visible select-none px-0.5 w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
        {bannerPromos.length === 0 ? (
          /* Static Fallback just in case standard promos are empty */
          <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#F5EAD2] rounded-[24px] p-5.5 border border-[#cbaf60]/50 shadow-[0_12px_30px_rgba(190,151,65,0.15)] relative flex flex-row items-center justify-between overflow-hidden h-[145px] sm:h-[160px]">
            {/* Subtle inner ambient premium light leaks */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#be9741]/12 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-10px] left-8 w-24 h-24 bg-[#FFFDF9]/60 rounded-full blur-xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-[58%] sm:max-w-[62%] space-y-2.5 flex flex-col justify-center text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#be9741] to-[#9e782f] rounded-full text-white text-[8px] tracking-wider uppercase font-extrabold w-fit shadow-[0_2px_8px_rgba(190,151,65,0.25)] border border-white/10">
                <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" /> EKSKLUSIF
              </div>
              
              <div className="space-y-1">
                <h2 className="font-serif font-black text-[15.5px] sm:text-xl text-[#1C1A17] tracking-tight leading-tight">
                  Promo Perawatan Premium
                </h2>
                <p className="text-[11.5px] sm:text-[13px] font-black text-gold-700 font-sans">
                  Diskon Eksklusif Hingga 40%
                </p>
              </div>

              <button 
                onClick={() => onNavigateToBooking("")}
                className="mt-1 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-700 hover:shadow-lg hover:shadow-gold-500/20 text-white font-sans text-[9px] font-black rounded-lg transition-all border border-gold-600/30 cursor-pointer w-fit uppercase tracking-widest active:scale-95 shadow-md"
              >
                PESAN SEKARANG
              </button>
            </div>

            {/* Right Content */}
            <div className="absolute right-[12px] top-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full aspect-square border-[3.5px] border-gold-400/80 shadow-[0_8px_24px_rgba(190,151,65,0.2)] overflow-hidden shrink-0 z-20 flex items-center justify-center">
              <img 
                src={treatmentImage} 
                alt="Premium Facial Treatment" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ) : (
          /* Sliding Promo Carousel (Sliding smoothly right to left) */
          <div className="relative w-full animate-fade-in">
            {/* Slide Track with overflow-hidden */}
            <div className="relative w-full h-[140px] sm:h-[155px] overflow-hidden rounded-[24px]">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                {bannerPromos.map((promo, idx) => {
                  if (idx !== activePromoIndex) return null;
                  return (
                    <motion.div
                      key={promo.id}
                      custom={direction}
                      variants={{
                        enter: (dir: number) => ({
                          x: dir > 0 ? "100%" : "-100%",
                          opacity: 0
                        }),
                        center: {
                          x: 0,
                          opacity: 1
                        },
                        exit: (dir: number) => ({
                          x: dir < 0 ? "100%" : "-100%",
                          opacity: 0
                        })
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 280, damping: 28 },
                        opacity: { duration: 0.25 }
                      }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.6}
                      onDragEnd={(e, info) => {
                        const swipeThreshold = 50;
                        if (info.offset.x < -swipeThreshold) {
                          // Swiped left -> Next
                          if (bannerPromos.length > 1) {
                            setDirection(1);
                            setPrevPromoIndex(activePromoIndex);
                            setActivePromoIndex((prev) => (prev + 1) % bannerPromos.length);
                          }
                        } else if (info.offset.x > swipeThreshold) {
                          // Swiped right -> Prev
                          if (bannerPromos.length > 1) {
                            setDirection(-1);
                            setPrevPromoIndex(activePromoIndex);
                            setActivePromoIndex((prev) => (prev - 1 + bannerPromos.length) % bannerPromos.length);
                          }
                        }
                      }}
                      onClick={() => {
                        if (bannerPromos.length > 1) {
                          setDirection(1);
                          setPrevPromoIndex(activePromoIndex);
                          setActivePromoIndex((prev) => (prev + 1) % bannerPromos.length);
                        }
                      }}
                      className="absolute inset-0 bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#F5EAD2] rounded-[24px] p-5 border border-gold-400 hover:border-gold-600 shadow-[0_12px_30px_rgba(190,151,65,0.14)] flex flex-row items-center justify-between overflow-hidden h-full transition-all select-none cursor-pointer"
                    >
                      {/* Subtle inner ambient premium light leaks */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-[#be9741]/12 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-[-10px] left-8 w-24 h-24 bg-[#FFFDF9]/60 rounded-full blur-xl pointer-events-none" />

                      {/* Left Content */}
                      <div className="relative z-10 max-w-[58%] sm:max-w-[62%] h-full flex flex-col justify-center text-left space-y-1.5 sm:space-y-2 font-sans">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#be9741] to-[#9e782f] rounded-full text-white text-[7.5px] sm:text-[8px] tracking-wider font-extrabold uppercase w-fit shadow-[0_2px_8px_rgba(190,151,65,0.25)] border border-white/10">
                            <Sparkles className="w-2 h-2 text-white animate-pulse" /> {promo.discountValue || "PROMO SPESIAL"}
                          </span>
                        </div>
  
                        <div className="space-y-0.5 text-left font-sans">
                          <h2 className="font-serif font-black text-[14.5px] min-[380px]:text-[16px] sm:text-[17px] text-[#1C1A17] tracking-tight leading-tight line-clamp-1">
                            {promo.title}
                          </h2>
                          <p className="text-[11px] sm:text-[12px] text-stone-600 font-sans leading-relaxed font-normal line-clamp-2 pr-1">
                            {promo.description}
                          </p>
                        </div>
  
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic();
                            let targetServiceName = "";
                             if (promo.id === "promo_2") {
                               targetServiceName = "Royal Hair Spa & Creambath";
                             } else if (promo.id === "promo_3") {
                               targetServiceName = "Syariah Aesthetic Glow";
                             } else {
                               const titleLower = (promo.title || "").toLowerCase();
                               const descLower = (promo.description || "").toLowerCase();
                               const matchedT = treatments.find(t => {
                                 const tNameLower = t.name.toLowerCase();
                                 return titleLower.includes(tNameLower) || 
                                        descLower.includes(tNameLower) ||
                                        tNameLower.split(' ').some(word => word.length > 3 && (titleLower.includes(word) || descLower.includes(word)));
                               });
                               if (matchedT) {
                                 targetServiceName = matchedT.name;
                                }
                             }
                             onNavigateToBooking(targetServiceName, promo.id);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-700 hover:shadow-lg hover:shadow-gold-500/20 text-white font-sans text-[9px] sm:text-[10px] font-black rounded-lg shadow-md transition-all border border-gold-600/30 cursor-pointer w-fit uppercase tracking-widest active:scale-95 text-center shrink-0"
                        >
                          KLAIM PROMO
                        </button>
                      </div>
  
                      {/* Right Content */}
                      <div className="absolute right-[8px] sm:right-[14px] top-1/2 -translate-y-1/2 w-24 h-24 min-[390px]:w-26 min-[390px]:h-26 sm:w-29 sm:h-29 rounded-full aspect-square border-[3.5px] border-gold-400/80 shadow-[0_8px_24px_rgba(190,151,65,0.18)] overflow-hidden shrink-0 z-20 flex items-center justify-center transition-transform duration-500 hover:rotate-2">
                        <img 
                          src={treatmentImage} 
                          alt={promo.title} 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Bullets */}
            {bannerPromos.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 z-40">
                {bannerPromos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDirection(idx > activePromoIndex ? 1 : -1);
                      setPrevPromoIndex(activePromoIndex);
                      setActivePromoIndex(idx);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === activePromoIndex 
                        ? "bg-gold-500 w-3" 
                        : "bg-stone-200 hover:bg-stone-300"
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* LAYANAN PERAWATAN (SERVICES CATALOGUE) - MIDDLE SECTION  */}
      {/* ======================================================== */}
      <section className="space-y-4 animate-fade-in pt-1">
        {selectedCategory === "All" ? (
          <>
            {/* 1. Main Categories Grid (Elegant, Compact, Centered Grid) */}
            <div className="space-y-3">
              <div className="max-w-sm sm:max-w-md mx-auto w-full px-3 text-left pb-0.5">
                <h3 className="text-xs sm:text-sm font-sans font-black tracking-widest uppercase text-stone-950">
                  Treatment
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-2.5 max-w-sm sm:max-w-md mx-auto w-full px-2">
                {[
                  {
                    id: "Hair Treatment",
                    title: "Hair",
                    icon: Scissors,
                    bg: "bg-gradient-to-b from-[#FFFDF9] to-[#F6EFE9]/45",
                    border: "border-[#c0a48a]/30 hover:border-[#a07c5d]",
                    iconBg: "bg-[#faf6f2]",
                    iconColor: "text-[#8a6543]"
                  },
                  {
                    id: "Facial Treatment",
                    title: "Facial",
                    icon: Smile,
                    bg: "bg-gradient-to-b from-[#FFFDF9] to-[#EFEBE4]/45",
                    border: "border-[#bdafa0]/30 hover:border-[#968471]",
                    iconBg: "bg-[#f7f5f0]",
                    iconColor: "text-[#7c6a56]"
                  },
                  {
                    id: "Body Treatment",
                    title: "Body",
                    icon: Heart,
                    bg: "bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE0]/45",
                    border: "border-gold-300/35 hover:border-gold-500",
                    iconBg: "bg-gold-50/55",
                    iconColor: "text-gold-600"
                  },
                  {
                    id: "Spa",
                    title: "Spa",
                    icon: Bath,
                    bg: "bg-gradient-to-b from-[#FFFDF9] to-[#FCEBEB]/45",
                    border: "border-rose-200/40 hover:border-rose-400",
                    iconBg: "bg-rose-50/55",
                    iconColor: "text-rose-600"
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        triggerHaptic();
                        if (onNavigateToCategory) {
                          onNavigateToCategory(item.id);
                        } else {
                          setSelectedCategory(item.id);
                        }
                      }}
                      className="w-full flex flex-col items-center gap-2 cursor-pointer group select-none text-center"
                    >
                      {/* Elegant Box with Icon */}
                      <div className={`w-full aspect-square rounded-2xl border ${item.bg} ${item.border} flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.01)] group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-350 relative overflow-hidden`}>
                        {/* Subtle hover background highlight */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                        
                        <div className={`w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${item.iconBg} group-hover:scale-105 transition-transform duration-300 border border-stone-200/20 shadow-3xs`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconColor}`} />
                        </div>
                      </div>
                      
                      {/* Text Outside & Below Box */}
                      <span className="font-serif font-black text-[9.5px] sm:text-[11px] text-stone-850 tracking-wide group-hover:text-gold-700 transition-colors leading-none">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* ======================================================== */
          /* DEDICATED CATEGORY VIEW ("HALAMAN SENDIRI")               */
          /* ======================================================== */
          <div className="space-y-5.5 animate-fade-in-up">
            {/* Elegant Back Button & Header */}
            <div className="flex items-center gap-3.5 pb-2 border-b border-stone-200/60 text-left">
              <button 
                onClick={() => {
                  triggerHaptic();
                  setSelectedCategory("All");
                }}
                className="p-2.5 rounded-2xl bg-white border border-[#c0a48a]/30 hover:border-[#a07c5d] text-stone-700 hover:text-[#8a6543] shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center shrink-0"
                title="Kembali ke Kategori"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] text-[#8a6543] uppercase tracking-[0.08em] font-extrabold block">Katalog Layanan</span>
                <h3 className="text-lg md:text-xl font-serif font-black text-[#211F1D]">
                  {selectedCategory}
                </h3>
              </div>
            </div>

            {/* Category Description Tag */}
            <div className="p-4 bg-gradient-to-r from-[#FFFDF9] to-[#F6EFE9]/40 border border-[#c0a48a]/20 rounded-2xl text-left">
              <p className="text-[11.5px] text-stone-600 font-sans font-medium leading-relaxed">
                Menampilkan daftar menu perawatan terbaik dalam kategori <strong className="text-stone-900 font-serif">{selectedCategory}</strong> khusus wanita di Alisya Beauty. Semua ritual dijamin 100% syar'i, steril, dan ramah wudhu.
              </p>
            </div>

            {/* Category filtered list */}
            {loadingTreatments ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 font-sans">
                <div className="w-7 h-7 rounded-full border-2 border-[#A98436]/20 border-t-[#A98436] animate-spin" />
                <span className="text-xs text-stone-500 font-sans">Memuat menu perawatan...</span>
              </div>
            ) : filteredTreatments.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-stone-200/80 font-sans shadow-sm">
                <Info className="w-6 h-6 text-[#A98436] mx-auto mb-1.5 opacity-80" />
                <span className="text-xs text-stone-500 font-semibold">Perawatan tidak ditemukan di kategori ini.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {filteredTreatments.map((t, idx) => {
                  const cat = (t.category || "").toLowerCase();
                  let cardStyle = {
                    bg: "bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#F7EFE0]/65",
                    border: "border-gold-300/60 hover:border-gold-500",
                    accentBar: "bg-gradient-to-b from-gold-300 to-gold-500",
                    badgeBg: "bg-gold-50 text-gold-800 border-gold-200/60",
                    btn: "bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-700 hover:shadow-lg hover:shadow-gold-500/20 shadow-md",
                    iconColor: "text-gold-600",
                    iconBg: "bg-gold-50 border-gold-200/50"
                  };

                  if (cat.includes("hair") || cat.includes("spa") || cat.includes("rambut") || idx % 3 === 0) {
                    cardStyle = {
                      bg: "bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#F6EFE9]/70",
                      border: "border-[#c0a48a]/50 hover:border-[#a07c5d]",
                      accentBar: "bg-gradient-to-b from-[#c0a48a] to-[#8a6543]",
                      badgeBg: "bg-[#f6efe9] text-[#8a6543] border-[#e4d4c5]/60",
                      btn: "bg-gradient-to-r from-[#a07c5d] to-[#8a6543] hover:from-[#8a6543] hover:to-[#6d4c2f] hover:shadow-lg hover:shadow-[#a07c5d]/20 shadow-md",
                      iconColor: "text-[#8a6543]",
                      iconBg: "bg-[#faf6f2] border-[#e4d4c5]/50"
                    };
                  } else if (cat.includes("facial") || cat.includes("laser") || cat.includes("micro") || idx % 3 === 1) {
                    cardStyle = {
                      bg: "bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#EFEBE4]/75",
                      border: "border-[#bdafa0]/50 hover:border-[#968471]",
                      accentBar: "bg-gradient-to-b from-[#bdafa0] to-[#7c6a56]",
                      badgeBg: "bg-[#f2efe9] text-[#7c6a56] border-[#dfd9ce]/60",
                      btn: "bg-gradient-to-r from-[#968471] to-[#7c6a56] hover:from-[#7c6a56] hover:to-[#5d4f3e] hover:shadow-lg hover:shadow-[#968471]/20 shadow-md",
                      iconColor: "text-[#7c6a56]",
                      iconBg: "bg-[#f7f5f0] border-[#dfd9ce]/50"
                    };
                  }

                  return (
                    <article 
                      key={t.id}
                      className={`overflow-hidden transition-all duration-300 group p-3.5 sm:p-5.5 flex flex-col justify-between border text-left rounded-[20px] sm:rounded-[24px] ${cardStyle.bg} ${cardStyle.border} shadow-[0_8px_20px_rgba(0,0,0,0.025)] hover:shadow-[0_12px_28px_rgba(190,151,65,0.08)] relative`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 ${cardStyle.accentBar}`} />

                      <div className="space-y-2 flex-1 pl-1 sm:pl-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-serif font-black text-[12.5px] sm:text-[15.5px] text-[#211F1D] group-hover:text-gold-700 transition-colors leading-snug">
                            {t.name}
                          </h4>
                          <span className={`w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-full flex items-center justify-center shrink-0 border ${cardStyle.iconBg}`}>
                            <Sparkles className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${cardStyle.iconColor} animate-pulse`} />
                          </span>
                        </div>

                        <p className="text-[9.5px] sm:text-[11.5px] text-stone-605 leading-relaxed font-sans font-normal line-clamp-2 sm:line-clamp-3">
                          {t.description || "Ritual kecantikan eksklusif sesuai syariah khusus wanita di Alisya Beauty."}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-stone-200/40 flex flex-col gap-2 font-sans mt-3 shrink-0 pl-1 sm:pl-1.5">
                        <div className="font-sans text-left flex flex-col min-[350px]:flex-row min-[350px]:items-center justify-between gap-0.5 sm:gap-1">
                          <div className="text-[11.5px] sm:text-[13.5px] font-black text-stone-900">
                            Rp {Number(t.price || 0).toLocaleString('id-ID')}
                          </div>
                          {t.duration && (
                            <div className="text-[8.5px] sm:text-[10px] text-stone-500 font-bold flex items-center gap-0.5 font-sans">
                              <Clock className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${cardStyle.iconColor}`} /> {t.duration} m
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            triggerHaptic();
                            onNavigateToBooking(t.name);
                          }}
                          className={`text-white font-black text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all uppercase tracking-wider w-full ${cardStyle.btn}`}
                        >
                          <CalendarPlus className="w-3 h-3 text-white" /> Pesan
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* TESTIMONIALS SIDE (ULASAN SHALIHA) - BOTTOM SECTION       */}
      {/* ======================================================== */}
      <section className="space-y-4.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div>
            <h3 className="font-serif font-black text-base md:text-lg text-[#211F1D] flex items-center gap-2">
              <Star className="w-4.5 h-4.5 text-[#A98436] fill-[#A98436]" /> Ulasan Shaliha
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                triggerHaptic();
                onNavigate('reviews');
              }}
              className="text-[11px] font-bold text-[#A98436] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Semua Ulasan <ChevronRight className="w-3.5 h-3.5 text-[#A98436]" />
            </button>
          </div>
        </div>

        {reviewsList.length === 0 ? (
          <div className="py-10 text-center bg-stone-50/70 border border-[#EBE7DF]/70 rounded-[20px] p-6 flex flex-col items-center justify-center gap-2 shadow-xs">
            <Heart className="w-6 h-6 text-[#A98436]" />
            <p className="text-xs text-stone-500 font-medium font-sans">Belum ada ulasan dipublikasi baru-baru ini.</p>
            <p className="text-[10px] text-stone-400 font-sans">Berikan ulasan terbaik Anda di tab Riwayat setelah pendaftaran selesai dilakukan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviewsList.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white border border-[#EBE7DF]/75 p-5 rounded-[20px] space-y-4 shadow-3xs hover:shadow-xs hover:border-[#A98436]/40 transition-all text-left flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-0.5 text-[#A98436]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#A98436] text-[#A98436]' : 'text-stone-200'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-[11.5px] text-stone-600 italic leading-relaxed font-sans font-normal line-clamp-3">
                    &ldquo;{rev.comment || 'Ritual perawatan yang sangat tenang, rapi dan menenangkan hati.'}&rdquo;
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#EBE7DF]/50 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#FAF6EE] border border-[#EBE7DF] flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                      <img 
                        src={rev.userPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.userName || 'shaliha'}`} 
                        alt={rev.userName} 
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="leading-none text-left">
                      <h5 className="text-[11px] font-bold text-stone-900">{rev.userName || 'Pelanggan Setia'}</h5>
                      <span className="text-[8.5px] text-stone-400 font-medium">{rev.createdAt ? rev.createdAt.split('T')[0] : 'Baru saja'}</span>
                    </div>
                  </div>
                  {rev.service && (
                    <span className="text-[9px] font-sans font-bold bg-[#FAF6EE] text-[#A98436] border border-[#EBE7DF]/60 px-2 py-0.5 rounded-md max-w-[120px] truncate">
                      {rev.service}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
