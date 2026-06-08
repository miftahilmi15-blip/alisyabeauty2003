import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Clock, CalendarHeart, Gift, ChevronRight, Star, 
  Heart, CheckCircle2, Scissors, CalendarPlus, Search, Info
} from 'lucide-react';
import { UserProfile, Review, Treatment } from '../types';
import { fetchReviews, fetchTreatments } from '../services/dataService';

interface HomePageProps {
  userProfile: UserProfile | null;
  onNavigate: (tabId: string) => void;
  onNavigateToBooking: (treatmentName: string) => void;
}

export default function HomePage({ userProfile, onNavigate, onNavigateToBooking }: HomePageProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  const firstName = userProfile?.displayName?.split(' ')[0] || 'Shaliha';

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Load spotlight reviews
        const reviewData = await fetchReviews();
        setReviewsList(reviewData.slice(0, 3));

        // 2. Load dynamic treatments list
        const treatmentData = await fetchTreatments();
        setTreatments(treatmentData);
        setFilteredTreatments(treatmentData);
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
    if (selectedCategory !== "Semua") {
      result = result.filter(t => {
        // Simple mapping rules for category classifications
        const nameLower = t.name.toLowerCase();
        if (selectedCategory === "Rambut") {
          return nameLower.includes("hair") || nameLower.includes("creambath") || nameLower.includes("shampoo");
        }
        if (selectedCategory === "Wajah") {
          return nameLower.includes("facial") || nameLower.includes("totok") || nameLower.includes("aura");
        }
        if (selectedCategory === "Tubuh") {
          return nameLower.includes("massage") || nameLower.includes("lulur") || nameLower.includes("body");
        }
        if (selectedCategory === "Kuku") {
          return nameLower.includes("manicure") || nameLower.includes("pedicure") || nameLower.includes("nail") || nameLower.includes("kuku");
        }
        return true;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    setFilteredTreatments(result);
  }, [selectedCategory, searchQuery, treatments]);

  const categories = ["Semua", "Rambut", "Wajah", "Tubuh", "Kuku"];

  return (
    <div className="space-y-8 pb-20 text-stone-800 animate-fade-in-up relative font-sans">
      
      {/* ======================================================== */}
      {/* GREETING HEADER */}
      {/* ======================================================== */}
      <section className="flex items-center justify-between py-2 border-b border-stone-100">
        <div className="space-y-1 text-left">
          <span className="text-[10px] text-gold-600 uppercase tracking-widest font-black block">Assalamu'alaikum</span>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-stone-900 leading-tight">
            Selamat Datang, <span className="text-gold-600">{firstName}</span>
          </h1>
        </div>
        
        <button 
          onClick={() => onNavigate('profile')}
          className="w-12 h-12 rounded-full border-2 border-gold-200 hover:border-gold-500 overflow-hidden shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <img 
            src={userProfile?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}`} 
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </button>
      </section>

      {/* ======================================================== */}
      {/* HERO BANNER SECTION */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-stone-50 border border-stone-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[220px]">
          
          {/* Content side */}
          <div className="p-6 md:p-8 flex flex-col justify-center space-y-4 relative z-20 lg:col-span-12 xl:col-span-7 bg-gradient-to-r from-stone-50 via-stone-50/95 to-transparent text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-200/20 rounded-full border border-gold-550/15 text-gold-600 text-[9px] tracking-widest uppercase font-black w-fit">
              <Sparkles className="w-3.5 h-3.5 text-gold-550 animate-pulse" /> Muslimah Luxury Salon
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 tracking-wide leading-tight">
              Alisya Beauty
            </h2>
            <p className="text-stone-600 text-xs md:text-sm font-light max-w-lg leading-relaxed font-sans">
              Menghadirkan pelayanan kecantikan syariah paling steril, aman, halal, dan wudhu-friendly untuk wanita berhijab di Indonesia. Nikmati ketenangan ritual privat bersama terapis bersertifikasi premium kami.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate('booking')}
                className="bg-gold-500 hover:bg-gold-600 text-[#050507] text-xs font-black px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-widest shrink-0 cursor-pointer"
              >
                <CalendarHeart className="w-4 h-4 text-[#050507]" /> Reservasi Online VIP
              </button>
            </div>
          </div>

          {/* Illustrative image side (Desktop only, responsive split) */}
          <div className="hidden xl:block xl:col-span-5 relative overflow-hidden bg-stone-100 border-l border-stone-100">
            <img 
              src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600" 
              alt="Premium Spa Room Setup" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-50/50 to-transparent" />
            
            {/* VIP Quick facts overlay */}
            <div className="absolute inset-y-0 right-0 p-6 flex flex-col justify-between items-end text-right z-20">
              <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-100 space-y-0.5 shadow-sm">
                <span className="text-[9px] text-gold-600 uppercase tracking-widest font-black block">Muslimah Private Space</span>
                <span className="text-[11px] text-stone-800 font-bold">100% Bebas Laki-Laki</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-100 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-gold-550 text-gold-550" />
                <span className="text-[10px] text-stone-800 font-bold font-mono">5.0 VIP Rating</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* DIRECT INTEGRATION: TREATMENT CATALOGUE (Layanan di Home) */}
      {/* ======================================================== */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="text-[9px] text-gold-600 uppercase tracking-widest font-black block">Alisya Treat Menu</span>
            <h3 className="text-xl font-serif font-black text-stone-900 flex items-center gap-2">
              <Scissors className="w-4.5 h-4.5 text-gold-550" /> Layanan Perawatan Premium
            </h3>
            <p className="text-xs text-stone-500 max-w-xl font-sans font-light">
              Pilih ritual kecantikan premium syari Anda. Terapis ahli bersertifikat kami melayani Anda di ruang privat mandiri.
            </p>
          </div>

          {/* Search bar inside Home Services */}
          <div className="relative w-full md:w-64 font-sans">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari perawatan..."
              className="w-full bg-stone-50 border border-stone-100 focus:bg-white focus:border-gold-500 text-stone-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none font-sans justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer tracking-wide transition-all ${
                selectedCategory === cat 
                  ? 'bg-gold-500 text-[#050507] shadow-sm font-black' 
                  : 'bg-stone-50 text-stone-600 border border-stone-100 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {cat === 'Semua' ? 'Semua Menu' : cat}
            </button>
          ))}
        </div>

        {/* Treatments List (Grid matching constraints) */}
        {loadingTreatments ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 font-sans">
            <div className="w-7 h-7 rounded-full border-2 border-gold-200 border-t-gold-500 animate-spin" />
            <span className="text-xs text-stone-500 font-sans">Memuat menu perawatan...</span>
          </div>
        ) : filteredTreatments.length === 0 ? (
          <div className="py-12 text-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl font-sans">
            <Info className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
            <span className="text-xs text-stone-500">Perawatan tidak ditemukan. Coba pencarian lain.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 pt-2">
            {filteredTreatments.map((t) => (
              <article 
                key={t.id}
                className="overflow-hidden rounded-2xl border border-stone-100 bg-white hover:bg-stone-50/50 flex flex-col justify-between hover:border-gold-300 shadow-sm hover:shadow-md transition-all group p-4.5 space-y-3.5 text-left"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="font-serif font-black text-sm text-stone-900 group-hover:text-gold-600 transition-colors leading-snug">
                      {t.name}
                    </h4>
                    <span className="w-6 h-6 rounded bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 border border-gold-100">
                      <Scissors className="w-3.5 h-3.5 text-gold-550" />
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-normal font-sans font-light line-clamp-3">
                    {t.description || "Ritual kecantikan eksklusif sesuai syariah khusus wanita di Alisya Beauty."}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between font-sans">
                  <div className="font-mono text-left">
                    <div className="text-[11.5px] font-bold text-gold-600">
                      Rp {Number(t.price || 0).toLocaleString('id-ID')}
                    </div>
                    {t.duration && (
                      <div className="text-[9.5px] text-stone-500 font-medium flex items-center gap-1 mt-0.5 font-sans">
                        <Clock className="w-3 h-3 text-gold-550" /> {t.duration} mnt
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigateToBooking(t.name)}
                    className="bg-gold-500 hover:bg-gold-600 text-[#050507] font-black text-[10px] py-1.5 px-3 rounded-lg shadow-sm cursor-pointer flex items-center gap-1 active:scale-95 transition-all uppercase tracking-wider"
                  >
                    <CalendarPlus className="w-3 h-3 text-[#050507]" /> Pesan
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* MONTHLY PROMO TICKET */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Special Offer (Col 7 on big desktop, otherwise full) */}
        <div className="lg:col-span-7 bg-stone-50 border border-stone-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between space-y-5 relative overflow-hidden">
          {/* Accent light highlight */}
          <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-gold-100/30 blur-2xl rounded-full" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold-105 text-gold-600 rounded-2xl border border-gold-200/50 shrink-0">
                <Gift className="w-5.5 h-5.5 animate-bounce" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-gold-600 tracking-widest block">Promosi Shaliha</span>
                <h4 className="text-base font-serif font-bold text-stone-900">Diskon 20% untuk semua Hair Spa & Hijab Care</h4>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
              Nikmati perawatan eksklusif **Alisya Royal Hair Spa & Hijab Care** sepanjang bulan ini. Dapatkan diskon langsung tanpa minimum transaksi bagi pemegang member terdaftar!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-200/60 text-center font-mono relative z-10">
            <div className="p-2 bg-white rounded-lg border border-stone-100">
              <span className="text-stone-500 text-[8px] block uppercase font-sans">Harga Normal</span>
              <span className="text-stone-600 line-through text-[11px]">Rp 150.000</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-stone-150 col-span-2">
              <span className="text-gold-600 text-[8px] block uppercase font-bold font-sans">Harga Spesial Member</span>
              <span className="text-gold-600 font-extrabold text-[12px]">Rp 120.000 <span className="text-[8px] text-stone-500 font-light font-sans">Selesai</span></span>
            </div>
          </div>
        </div>

        {/* Live Testimonial Card / Spotlight (Col 5 on desktop) */}
        <div className="lg:col-span-5 bg-stone-50 border border-stone-100 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between font-sans relative overflow-hidden">
          <div className="space-y-3.5 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-black text-rose-500 tracking-widest">VIP Spotlight</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 text-gold-250 fill-gold-250" />
                ))}
              </div>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-light italic">
              "Kamar perawatannya benar-benar tertutup rapat, privat sekali jadi tenang sebagai muslimah. Layanan ramah dan nyaman."
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3.5 border-t border-stone-200/60 mt-2 relative z-10">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" 
              alt="Testi profile" 
              className="w-9 h-9 rounded-full border border-stone-200"
            />
            <div>
              <span className="text-[11px] font-bold text-stone-900 block">Zulfa Shaliha</span>
              <span className="text-[9px] text-gold-600">Hair & Hijab Care Enthusiast</span>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* OTHER INFRASTRUCTURE & OPEN HOURS MATRICES */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Jam Operasional */}
        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4.5 flex items-center gap-4 text-left font-sans">
          <div className="p-3 bg-white rounded-xl text-stone-700 shrink-0 border border-stone-100">
            <Clock className="w-5.5 h-5.5 text-gold-550" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Jam Operasional Salon</h4>
            <p className="text-xs text-stone-900 font-bold font-sans">Senin - Minggu | 09:00 - 21:00 WIB</p>
            <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping" /> Buka Hari Ini
            </span>
          </div>
        </div>

        {/* Syariat Safety check info board */}
        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4.5 flex items-center gap-4 text-left font-sans">
          <div className="p-3 bg-white rounded-xl text-stone-700 shrink-0 border border-stone-100">
            <CheckCircle2 className="w-5.5 h-5.5 text-emerald-550" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Garansi Syariat Muslimah</h4>
            <p className="text-[11px] text-stone-600 leading-tight">Prosedur tertutup tanpa cermin luar, bebas pandangan pria non-mahram.</p>
          </div>
        </div>

      </section>

      {/* Final CTA styling */}
      <section className="text-center py-8 px-6 bg-gradient-to-r from-stone-50 via-stone-50/80 to-stone-50 border border-stone-100 rounded-3xl space-y-4 shadow-sm">
        <h4 className="font-serif italic text-xl text-gold-600 md:text-2xl">
          "Siap Tampil Cantik, Berseri, dan Percaya Diri?"
        </h4>
        <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed font-sans font-light">
          Dapatkan keistimewaan perawatan premium terbaik oleh pakar kecantikan Muslimah profesional. Tempat terbatas untuk menjaga eksklusivitas.
        </p>
        <button 
          onClick={() => onNavigate('booking')}
          className="bg-gold-500 hover:bg-gold-600 text-[#050507] text-xs font-black px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <CalendarHeart className="w-4 h-4 text-[#050507]" /> Booking Sekarang
        </button>
      </section>

    </div>
  );
}
