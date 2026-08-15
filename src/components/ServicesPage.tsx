import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  CalendarPlus, 
  Clock, 
  Sparkles, 
  Sparkle, 
  Bath, 
  Dna, 
  Zap, 
  Search, 
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { fetchTreatments } from '../services/dataService';
import { Treatment } from '../types';

interface ServicesPageProps {
  onNavigateToBooking: (treatmentName: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

const CATEGORIES = [
  { id: 'All', name: 'All Services', icon: Sparkles },
  { id: 'Hair', name: 'Hair Treatment', icon: Sparkle },
  { id: 'Body', name: 'Body Treatment', icon: Heart },
  { id: 'Spa', name: 'Spa Treatment', icon: Bath },
  { id: 'Facial', name: 'Facial Glowing', icon: Sparkle },
  { id: 'Microbright', name: 'Facial Microbright', icon: Dna },
  { id: 'Laser', name: 'Pico Laser', icon: Zap },
];

export default function ServicesPage({ 
  onNavigateToBooking,
  activeCategory,
  setActiveCategory
}: ServicesPageProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchTreatments();
        setTreatments(data);
      } catch (e) {
        console.error("Gagal memuat layanan:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTreatments = treatments.filter(t => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 text-stone-800 animate-fade-in-up text-left">
      {/* Header - Only shown on 'All' category for a clean sub-page experience */}
      {activeCategory === 'All' && (
        <div className="border-b border-stone-200 pb-4">
          <span className="text-[11px] text-[#A98436] uppercase tracking-[0.08em] font-semibold block">Alisya Treat Menu</span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2 mt-0.5">
            <Sparkles className="w-5.5 h-5.5 text-[#A98436]" /> Katalog Layanan & Price List
          </h2>
          <p className="text-xs text-stone-600 mt-1.5 max-w-xl font-sans leading-relaxed font-normal">
            Setiap ritual perawatan tubuh, rambut, kecantikan, dan spa didesain khusus agar sesuai syariat Muslimah, dikerjakan terapis ahli bersertifikat dalam ruangan eksklusif yang tenang dan privat.
          </p>
        </div>
      )}

      {/* Search & Categories Container */}
      {activeCategory === 'All' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#A98436]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari perawatan (e.g. Creambath, Bekam, Laser)..."
              className="block w-full pl-9 pr-4 py-2.5 bg-white border border-[#A98436]/35 focus:border-[#A98436] hover:border-[#A98436]/55 rounded-xl text-xs placeholder-stone-400 text-stone-800 font-semibold focus:outline-none transition-colors shadow-xs"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#A98436] to-[#D3B674] text-stone-950 shadow-sm font-bold'
                      : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50/50 border border-stone-200 shadow-xs'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-[#A98436]'}`} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-[#A98436]/40 border-t-[#A98436] animate-spin" />
          <span className="text-xs text-stone-500 font-medium font-sans">Memuat katalog kecantikan syari...</span>
        </div>
      ) : filteredTreatments.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-stone-200 bg-white rounded-2xl shadow-sm">
          <Heart className="w-8 h-8 text-[#A98436] mx-auto mb-2 opacity-80" />
          <p className="text-sm text-stone-600 font-semibold font-sans">Tidak menemukan perawatan yang cocok.</p>
          <button 
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="mt-2 text-xs text-[#A98436] font-bold hover:underline"
          >
            Reset filter pencarian
          </button>
        </div>
      ) : (
        /* RESPONSIVE LAYOUT SYSTEM: 2-columns vertical portrait layout on mobile and tablet for beautiful bento feel */
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTreatments.map((t, idx) => {
            const catInfo = CATEGORIES.find(c => c.id === t.category);
            const LabelIcon = catInfo ? catInfo.icon : Bookmark;

            // Custom premium Android-style combined color palette mapper based on category & index
            const cat = (t.category || "").toLowerCase();
            let cardStyle = {
              bg: "bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#F7EFE0]/65",
              border: "border-gold-300/60 hover:border-gold-500",
              accentBar: "bg-gradient-to-b from-gold-300 to-gold-500",
              badgeBg: "bg-gold-50 text-gold-800 border-gold-200/60",
              btn: "bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-700 hover:shadow-lg hover:shadow-gold-500/20 text-white shadow-md font-bold",
              iconColor: "text-gold-600",
              iconBg: "bg-gold-50 border-gold-200/50"
            };

            if (cat.includes("hair") || cat.includes("spa") || cat.includes("rambut") || idx % 3 === 0) {
              cardStyle = {
                bg: "bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#F6EFE9]/70",
                border: "border-[#c0a48a]/50 hover:border-[#a07c5d]",
                accentBar: "bg-gradient-to-b from-[#c0a48a] to-[#8a6543]",
                badgeBg: "bg-[#f6efe9] text-[#8a6543] border-[#e4d4c5]/60",
                btn: "bg-gradient-to-r from-[#a07c5d] to-[#8a6543] hover:from-[#8a6543] hover:to-[#6d4c2f] hover:shadow-lg hover:shadow-[#a07c5d]/20 text-white shadow-md font-bold",
                iconColor: "text-[#8a6543]",
                iconBg: "bg-[#faf6f2] border-[#e4d4c5]/50"
              };
            } else if (cat.includes("facial") || cat.includes("laser") || cat.includes("micro") || idx % 3 === 1) {
              cardStyle = {
                bg: "bg-gradient-to-br from-[#FFFDF9] via-[#FFFFFF] to-[#EFEBE4]/75",
                border: "border-[#bdafa0]/50 hover:border-[#968471]",
                accentBar: "bg-gradient-to-b from-[#bdafa0] to-[#7c6a56]",
                badgeBg: "bg-[#f2efe9] text-[#7c6a56] border-[#dfd9ce]/60",
                btn: "bg-gradient-to-r from-[#968471] to-[#7c6a56] hover:from-[#7c6a56] hover:to-[#5d4f3e] hover:shadow-lg hover:shadow-[#968471]/20 text-white shadow-md font-bold",
                iconColor: "text-[#7c6a56]",
                iconBg: "bg-[#f7f5f0] border-[#dfd9ce]/50"
              };
            }

            return (
              <article 
                key={t.id}
                className={`overflow-hidden rounded-2xl border shadow-xs hover:shadow-[0_8px_20px_rgba(190,151,65,0.05)] transition-all duration-300 flex flex-col justify-between relative ${cardStyle.bg} ${cardStyle.border} p-3.5 gap-3 h-full text-left`}
              >
                {/* Visual Premium Side Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${cardStyle.accentBar}`} />

                {/* Top block containing treatment details */}
                <div className="min-w-0 pl-1.5 space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-1">
                    {t.category && (
                      <span className={`inline-flex items-center gap-1 text-[8px] sm:text-[8.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded font-bold ${cardStyle.badgeBg}`}>
                        <LabelIcon className="w-2 h-2" /> {catInfo?.name || t.category}
                      </span>
                    )}
                    {t.duration && (
                      <span className={`text-[8px] sm:text-[8.5px] rounded px-1.5 py-0.5 inline-flex items-center gap-1 font-bold font-sans border ${cardStyle.iconBg} ${cardStyle.iconColor}`}>
                        <Clock className="w-2.5 h-2.5" /> {t.duration} m
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-black text-[12px] sm:text-sm text-[#2D2926] leading-tight pt-0.5 line-clamp-2">
                    {t.name}
                  </h3>
                  <p className="text-[9.5px] sm:text-[10.5px] text-stone-600 leading-relaxed font-sans font-normal line-clamp-2 sm:line-clamp-3" title={t.description}>
                    {t.description || 'Ritual kecantikan premium dirancang khusus dengan penjagaan privasi terbaik bagi muslimah.'}
                  </p>
                </div>

                {/* Bottom block: CTA and Price */}
                <div className="pt-2.5 border-t border-stone-200/40 flex flex-col gap-2 font-sans pl-1.5 shrink-0">
                  <div className="text-left">
                    <span className="text-[8px] uppercase text-stone-400 font-mono tracking-wider font-semibold block">Harga</span>
                    <span className="text-[11.5px] sm:text-[13px] font-black text-stone-900 font-mono">
                      Rp {Number(t.price || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateToBooking(t.name)}
                    className={`font-black text-[9px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all uppercase tracking-wider w-full ${cardStyle.btn}`}
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
  );
}
