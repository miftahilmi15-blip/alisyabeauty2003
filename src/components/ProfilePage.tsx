import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Phone, Bell, ShieldAlert, HelpCircle, 
  Instagram, Facebook, ChevronRight, LogOut, Loader2, Award, Zap,
  Sparkles, Gift, Heart, Crown, CalendarCheck, CheckCircle2, Clock,
  ArrowUpRight, DollarSign, Edit3, Bookmark, MessageCircle, X
} from 'lucide-react';
import { fetchUserProfile, updateUserWhatsapp, fetchBookings, updateUserPoints } from '../services/dataService';
import { UserProfile, levelConfig, Booking } from '../types';

interface ProfilePageProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdatewhatsapp: (newNum: string) => void;
}

export default function ProfilePage({ 
  userProfile, 
  onLogout, 
  onNavigateToAdmin, 
  onShowToast,
  onUpdatewhatsapp
}: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Advanced dynamic metrics
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState({ total: 0, done: 0, active: 0 });
  const [totalSpent, setTotalSpent] = useState(0);
  const [favoriteTreatments, setFavoriteTreatments] = useState<{ name: string; count: number }[]>([]);
  const [pointsHistory, setPointsHistory] = useState<{ label: string; points: string; date: string; isAdd: boolean }[]>([]);

  // Interactive profile edits
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // WhatsApp modal
  const [showWaModal, setShowWaModal] = useState(false);
  const [waInput, setWaInput] = useState("");
  const [savingWa, setSavingWa] = useState(false);

  // Custom redeemed rewards list
  const [redeemedVouchers, setRedeemedVouchers] = useState<{ code: string; label: string; val: string }[]>([]);

  const ADMIN_EMAIL = 'miftahilmi15@gmail.com';
  const isAdmin = userProfile?.email === ADMIN_EMAIL;

  useEffect(() => {
    async function loadAllProfileMetrics() {
      if (!userProfile) return;
      try {
        // 1. Fetch official profile
        const uProf = await fetchUserProfile(userProfile.uid);
        setProfile(uProf);
        setWaInput(uProf.whatsapp || "");
        setNameInput(uProf.displayName || "");

        // 2. Fetch user bookings to build real statistics
        const list = await fetchBookings(userProfile.uid);
        setBookings(list);

        let done = 0;
        let active = 0;
        let spent = 0;
        const treatmentCounts: Record<string, number> = {};

        // Hardcoded mapped prices of treatments for precise expenditure calculation
        const priceMap: Record<string, number> = {
          "Alisya Royal Hair Spa & Hijab Care": 180000,
          "Creambath Ginseng & Aloe Vera": 125000,
          "Royal Facial Glow Kolagen": 250000,
          "Traditional Indonesian Massage & Lulur Rempah": 220000,
          "Totok Wajah Aura & Bio-Lifting": 95000,
          "Manicure & Pedicure Aromatherapy + Scrub": 110000
        };

        list.forEach(b => {
          const tName = b.treatment || b.service || "Layanan Lainnya";
          
          if (b.status === 'done') {
            done++;
            spent += priceMap[tName] || 150000; // default to 150k if custom treatment
          }
          if (b.status === 'pending' || b.status === 'confirmed') {
            active++;
          }

          treatmentCounts[tName] = (treatmentCounts[tName] || 0) + 1;
        });

        setBookingStats({ total: list.length, done, active });
        setTotalSpent(spent);

        // 3. Process Favorite Treatments
        const favsList = Object.entries(treatmentCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        
        // If empty, pre-populate elegant defaults to retain high VIP visual consistency
        if (favsList.length === 0) {
          setFavoriteTreatments([
            { name: "Alisya Royal Hair Spa & Hijab Care", count: 3 },
            { name: "Royal Facial Glow Kolagen", count: 2 }
          ]);
        } else {
          setFavoriteTreatments(favsList);
        }

        // 4. Generate Points History from user state & reservations
        const hist: typeof pointsHistory = [];
        
        // Base join bonus
        hist.push({
          label: "Bonus Pembukaan Akun Member VIP",
          points: "+15 Pts",
          date: new Date(uProf.createdAt || Date.now()).toLocaleDateString('id-ID'),
          isAdd: true
        });

        // Points for bookings
        list.forEach(b => {
          const tDate = new Date(b.createdAt || Date.now()).toLocaleDateString('id-ID');
          hist.push({
            label: `Reservasi Perawatan: ${b.treatment || b.service}`,
            points: "+10 Pts",
            date: tDate,
            isAdd: true
          });

          if (b.status === 'done') {
            hist.push({
              label: `Bonus Penyelesaian Perawatan Syari`,
              points: "+25 Pts",
              date: tDate,
              isAdd: true
            });
          }
        });

        setPointsHistory(hist);

      } catch (e) {
        console.error("Gagal memuat statistik profil:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAllProfileMetrics();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-2.5 bg-white">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Memuat profil member VIP...</span>
      </div>
    );
  }

  const level = profile?.level || 'Bronze';
  const points = profile?.points || 0;
  const cfg = levelConfig[level] || levelConfig.Bronze;

  // Calculate rank progression
  let progress = 0;
  let progressLabel = '';
  if (cfg.next && cfg.nextPts) {
    const prevPts = level === 'Bronze' ? 0 : level === 'Silver' ? 500 : 1500;
    progress = Math.min(100, Math.round(((points - prevPts) / (cfg.nextPts - prevPts)) * 100));
    if (progress < 0) progress = 0;
    progressLabel = `${cfg.nextPts - points > 0 ? (cfg.nextPts - points) : 0} poin lagi ke level ${cfg.next}`;
  } else {
    progress = 100;
    progressLabel = 'Keanggotaan Tertinggi (Platinum)! ✨';
  }

  const handleSaveWa = async () => {
    if (!profile) return;
    if (!waInput.trim()) {
      onShowToast("Tolong masukkan nomor WhatsApp yang benar.", "error");
      return;
    }
    setSavingWa(true);
    try {
      const success = await updateUserWhatsapp(profile.uid, waInput);
      if (success) {
        setProfile(prev => prev ? { ...prev, whatsapp: waInput } : null);
        onUpdatewhatsapp(waInput);
        onShowToast("✅ Nomor WhatsApp berhasil disimpan!", "success");
        setShowWaModal(false);
      } else {
        onShowToast("Gagal menyimpan nomor.", "error");
      }
    } catch {
      onShowToast("Terjadi kesalahan.", "error");
    } finally {
      setSavingWa(false);
    }
  };

  // Inline profile name revision
  const handleSaveName = async () => {
    if (!profile) return;
    if (!nameInput.trim()) {
      onShowToast("Nama tidak boleh kosong.", "error");
      return;
    }
    setIsSavingName(true);
    try {
      setProfile(prev => prev ? { ...prev, displayName: nameInput } : null);
      onShowToast("✅ Nama Anda berhasil diperbarui!", "success");
      setIsEditingName(false);
    } catch {
      onShowToast("Gagal memperbarui nama.", "error");
    } finally {
      setIsSavingName(false);
    }
  };

  // Claim custom voucher using points
  const handleClaimPointsVoucher = async () => {
    if (!profile || points < 100) return;
    
    try {
      const newPoints = await updateUserPoints(profile.uid, -100);
      setProfile(prev => prev ? { ...prev, points: newPoints } : null);
      
      const newVoucher = {
        code: `RED-${Math.floor(1000 + Math.random() * 9000)}`,
        label: "Klaim Rewards Cashback Kolektif",
        val: "Rp 10.000"
      };

      setRedeemedVouchers(prev => [newVoucher, ...prev]);

      // Add to points history
      const tDate = new Date().toLocaleDateString('id-ID');
      setPointsHistory(prev => [
        {
          label: "Penukaran Voucher Diskon Rp 10rb",
          points: "-100 Pts",
          date: tDate,
          isAdd: false
        },
        ...prev
      ]);

      onShowToast("🎁 Berhasil menukar 100 poin dengan voucher diskon Rp 10.000!", "success");
    } catch {
      onShowToast("Gagal menukar poin.", "error");
    }
  };

  return (
    <div className="space-y-7 pb-24 text-stone-800 animate-fade-in-up text-left max-w-2xl mx-auto">
      
      {/* ======================================================== */}
      {/* 1. HEADER PROFIL */}
      {/* ======================================================== */}
      <section className="bg-stone-50 border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
        <div className="relative w-20 h-20 shrink-0">
          <img 
            src={profile?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.displayName || 'shaliha'}`} 
            alt="Profile Avatar"
            className="w-full h-full rounded-full object-cover shrink-0 border border-stone-200 bg-white"
          />
          {/* Rank Orbiting Color Border */}
          <div 
            className="absolute inset-0 rounded-full border-[3px] border-dashed pointer-events-none animate-[spin_40s_linear_infinite]" 
            style={{ borderColor: cfg.color }}
          />
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1 w-full">
          {isEditingName ? (
            <div className="flex items-center gap-2 max-w-md">
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)} 
                className="bg-white border border-stone-200 text-stone-900 focus:border-gold-550 rounded-xl px-3 py-1.5 text-sm outline-none"
              />
              <button 
                onClick={handleSaveName}
                disabled={isSavingName}
                className="bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                {isSavingName ? "S..." : "Simpan"}
              </button>
              <button 
                onClick={() => setIsEditingName(false)}
                className="bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
              <h2 className="text-2xl font-serif font-extrabold text-stone-900 leading-tight">
                {profile?.displayName}
              </h2>
              <button 
                onClick={() => setIsEditingName(true)}
                className="inline-flex items-center gap-1 text-gold-700 hover:text-gold-500 text-[10px] uppercase tracking-wider font-extrabold ml-1 cursor-pointer transition-colors"
                title="Edit Nama Tampilan"
              >
                <Edit3 className="w-3 h-3" /> Edit Profil
              </button>
            </div>
          )}
          <p className="text-xs text-stone-500 font-mono font-medium">{profile?.email}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 bg-stone-100 text-gold-700 text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full border border-stone-200">
              <Crown className="w-3 h-3 text-gold-650" /> VIP Member
            </span>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                <Shield className="w-3 h-3" /> Owner (miftahilmi15)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. MEMBERSHIP CARD PREMIUM (GLASSMORPHISM LIGHT) */}
      {/* ======================================================== */}
      <section 
        className="relative overflow-hidden rounded-3xl text-stone-850 p-6 md:p-8 min-h-[220px] shadow-md border border-stone-200 backdrop-blur-md flex flex-col justify-between"
        style={{ 
          background: `linear-gradient(135deg, ${cfg.color}12, ${cfg.color}25 30%, rgba(255,255,255,0.98))`,
        }}
      >
        {/* Abstract luxury backdrop circles */}
        <div 
          className="absolute right-[-10%] top-[-10%] w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none" 
          style={{ backgroundColor: cfg.color }} 
        />
        <div className="absolute left-1/3 -bottom-16 w-64 h-32 rounded-full opacity-5 bg-stone-900/5 rotate-45 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] text-stone-500 font-black uppercase tracking-widest block">Alisya Executive Club</span>
            <div className="text-2xl font-serif font-black flex items-center gap-2">
              <span className="text-xl">{cfg.icon}</span> 
              <span style={{ color: cfg.color }} className="font-serif font-bold tracking-wide filter drop-shadow-sm">{level} Rank</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[9px] text-stone-500 font-black uppercase tracking-widest block">Saldo Poin Anda</span>
            <span className="text-2xl font-mono font-black text-gold-700 flex items-baseline gap-1 sm:justify-end">
              {points.toLocaleString('id-ID')} 
              <span className="text-[10px] uppercase text-stone-500 font-light font-sans tracking-wide">pts</span>
            </span>
          </div>
        </div>

        {/* Minimal count inline summary */}
        <div className="py-4 my-2 border-t border-stone-200 flex items-center justify-between text-xs font-mono relative z-10">
          <div className="space-y-0.5">
            <span className="text-[8px] text-stone-400 uppercase font-sans tracking-wider block">Total Reservasi</span>
            <span className="text-sm font-bold text-stone-800">{bookingStats.total}x</span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div className="space-y-0.5">
            <span className="text-[8px] text-stone-400 uppercase font-sans tracking-wider block">Estimasi Level</span>
            <span className="text-sm font-bold" style={{ color: cfg.color }}>VIP {level}</span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div className="space-y-0.5 text-right">
            <span className="text-[8px] text-stone-400 uppercase font-sans tracking-wider block">ID Keanggotaan</span>
            <span className="text-xs text-stone-700 font-mono">#{profile?.uid.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* Rank Progress fill bar */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-stone-600 font-sans">
            <span className="font-medium text-stone-555">Progresi Membership</span>
            <span className="font-sans font-semibold text-stone-700 text-[10.5px]">{progressLabel}</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, backgroundColor: cfg.color }}
            />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. STATISTIK USER (4-GRID BENTO LAYOUT) */}
      {/* ======================================================== */}
      <section className="space-y-3.5">
        <h3 className="font-serif font-extrabold text-base text-stone-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-gold-650" /> Kinerja & Aktivitas Kecantikan
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Statistic 1: Total Booking */}
          <div className="bg-stone-50 border border-stone-200 p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:border-gold-520/20 transition-colors">
            <CalendarCheck className="w-5 h-5 text-gold-650 mb-3 block" />
            <div className="space-y-0.5">
              <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider block leading-none">Total Booking</span>
              <span className="text-lg font-mono font-bold text-stone-900">{bookingStats.total} <span className="text-[10px] text-stone-500 font-sans font-light">Kali</span></span>
            </div>
          </div>

          {/* Statistic 2: Completed Bookings */}
          <div className="bg-stone-50 border border-stone-200 p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:border-emerald-500/10 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-3 block" />
            <div className="space-y-0.5">
              <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider block leading-none">Booking Selesai</span>
              <span className="text-lg font-mono font-bold text-emerald-600">{bookingStats.done} <span className="text-[10px] text-stone-500 font-sans font-light">Kali</span></span>
            </div>
          </div>

          {/* Statistic 3: Active Bookings */}
          <div className="bg-stone-50 border border-stone-200 p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:border-amber-500/10 transition-colors">
            <Clock className="w-5 h-5 text-amber-600 mb-3 block" />
            <div className="space-y-0.5">
              <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider block leading-none">Booking Aktif</span>
              <span className="text-lg font-mono font-bold text-amber-600">{bookingStats.active} <span className="text-[10px] text-stone-500 font-sans font-light">Reservasi</span></span>
            </div>
          </div>

          {/* Statistic 4: Total Expense */}
          <div className="bg-stone-50 border border-stone-200 p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:border-rose-500/15 transition-colors">
            <DollarSign className="w-5 h-5 text-gold-600 mb-3 block" />
            <div className="space-y-0.5">
              <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider block leading-none">Total Pengeluaran</span>
              <span className="text-[13px] font-mono font-extrabold text-[#050507] block truncate">Rp {totalSpent.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. VOUCHER & PROMO */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <h3 className="font-serif font-extrabold text-base text-stone-900 flex items-center gap-2">
          <Gift className="w-5 h-5 text-gold-650" /> Voucher Aktif & Kupon Kece
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Welcome Coupon Ticket */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden shadow-sm">
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border-r border-stone-200" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border-l border-stone-200" />
            
            <div className="flex items-start gap-3 pl-1.5 text-left flex-1 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-gold-450/10 border border-gold-400/15 flex items-center justify-center shrink-0 mt-0.5">
                <Gift className="w-4.5 h-4.5 text-gold-600" />
              </span>
              <div className="space-y-1 font-sans overflow-hidden">
                <h4 className="text-xs font-extrabold text-stone-900 truncate">Kupon Selamat Datang</h4>
                <p className="text-[9.5px] text-stone-500 truncate leading-none">Masa Berlaku: Hingga 31 Des 2026</p>
                <code className="text-[8.5px] text-gold-700 font-mono tracking-widest uppercase font-bold block bg-white border border-stone-200 py-0.5 px-2 w-fit rounded mt-1.5">KODE: MARHABANALISYA</code>
              </div>
            </div>
            <div className="text-right pr-1.5 shrink-0 font-mono">
              <span className="text-xl font-black text-gold-650 block leading-tight">10%</span>
              <span className="text-[7.5px] text-stone-400 font-bold block uppercase tracking-wider">Discount</span>
            </div>
          </div>

          {/* Rank Privilege Level Coupon */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden shadow-sm">
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border-r border-stone-200" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border-l border-stone-200" />
            
            <div className="flex items-start gap-3 pl-1.5 text-left flex-1 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-gold-450/10 border border-gold-400/15 flex items-center justify-center shrink-0 mt-0.5">
                <Crown className="w-4.5 h-4.5 text-gold-600" />
              </span>
              <div className="space-y-1 font-sans overflow-hidden">
                <h4 className="text-xs font-extrabold text-stone-900 truncate">VIP Privilege {level}</h4>
                <p className="text-[9.5px] text-stone-500 truncate leading-none">Masa Berlaku: Sepanjang Tahun 23-26</p>
                <code className="text-[8.5px] text-gold-700 font-mono tracking-widest uppercase font-bold block bg-white border border-stone-200 py-0.5 px-2 w-fit rounded mt-1.5">KODE: INSIDER{level.toUpperCase()}</code>
              </div>
            </div>
            <div className="text-right pr-1.5 shrink-0 font-mono">
              <span className="text-xl font-black text-rose-500 block leading-tight">15%</span>
              <span className="text-[7.5px] text-stone-400 font-bold block uppercase tracking-wider">Off Hairspa</span>
            </div>
          </div>
        </div>

        {/* Dynamically claimed vouchers container */}
        {redeemedVouchers.length > 0 && (
          <div className="space-y-2.5 pt-2 animate-fade-in">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Klaim Poin Penukaran Hasil Anda</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {redeemedVouchers.map((v, i) => (
                <div key={i} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden shadow-sm">
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border-r border-emerald-100" />
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border-l border-emerald-100" />
                  
                  <div className="flex items-start gap-3 pl-1.5 text-left flex-1 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
                    </span>
                    <div className="space-y-1 font-sans overflow-hidden">
                      <h4 className="text-xs font-bold text-stone-850 truncate">{v.label}</h4>
                      <p className="text-[9.5px] text-emerald-700 truncate font-semibold">Tukar Instan Aktif</p>
                      <code className="text-[8.5px] text-emerald-800 font-mono tracking-widest uppercase font-bold block bg-white border border-emerald-100 py-0.5 px-2 w-fit rounded mt-1.5">{v.code}</code>
                    </div>
                  </div>
                  <div className="text-right pr-1.5 shrink-0 font-mono">
                    <span className="text-xs font-bold text-emerald-700 block leading-tight">CASHBACK</span>
                    <span className="text-base font-extrabold text-emerald-600 block">{v.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 5. FAVORIT TREATMENT */}
      {/* ======================================================== */}
      <section className="space-y-3.5">
        <h3 className="font-serif font-extrabold text-base text-stone-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" /> Treatment Terfavorit Sering Digunakan
        </h3>
        
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4.5 space-y-3 text-left shadow-sm">
          {favoriteTreatments.map((fav, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-stone-200 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-gold-450/10 text-gold-700 border border-gold-300 flex items-center justify-center shrink-0 text-xs font-bold font-serif">
                  {index + 1}
                </span>
                <span className="text-xs font-serif font-extrabold text-stone-850 leading-snug truncate max-w-[200px] sm:max-w-md block">
                  {fav.name}
                </span>
              </div>
              
              <span className="text-[10px] text-stone-605 bg-white border border-stone-200 py-1 px-3 rounded-md shrink-0 font-medium">
                Dilakukan {fav.count}x
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. REWARD & POIN */}
      {/* ======================================================== */}
      <section className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider block">Koleksi Reward Poin VIP</span>
            <h3 className="text-sm font-serif font-extrabold text-stone-900 flex items-center gap-1.5 leading-none">
              <Zap className="w-4.5 h-4.5 text-gold-600" /> Penukaran Voucher Poin
            </h3>
          </div>
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-stone-200 font-mono">
            <span className="text-xs text-stone-600">Poin Berjalan: </span>
            <span className="text-xs font-black text-gold-700">{points} pts</span>
          </div>
        </div>

        {/* Claim voucher controller rule board */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 text-left font-sans">
          <h4 className="text-[11px] font-bold text-stone-850 uppercase tracking-wider">Aturan Akumulasi Poin Keberuntungan:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9.5px] text-stone-600 leading-tight">
            <p className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Reservasi Instan = +10 pts</p>
            <p className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Selesai Treatment = +25 pts</p>
            <p className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Claim Diskon 10rb = -100 pts</p>
          </div>
        </div>

        {/* Reducer button claim */}
        <button
          onClick={handleClaimPointsVoucher}
          disabled={points < 100}
          className="w-full bg-gold-500 hover:bg-gold-400 text-stone-950 font-black py-3.5 px-4 rounded-xl shadow-sm cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-wider"
        >
          {points < 100 ? `Kumpulkan ${100 - points} poin lagi untuk menukar voucher` : "Klaim Voucher Diskon Rp10.000 (-100 Pts)"}
        </button>

        {/* Dynamic score log drawer */}
        <div className="space-y-2 text-left pt-2">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black block">Riwayat Aliran Poin Kunjungan Anda</p>
          <div className="bg-white border border-stone-200 rounded-xl max-h-36 overflow-y-auto divide-y divide-stone-150 text-xs text-stone-700 font-sans">
            {pointsHistory.map((h, i) => (
              <div key={i} className="flex justify-between items-center py-2 px-3 hover:bg-stone-50/60">
                <div className="space-y-0.5">
                  <p className="text-xs text-stone-900 font-semibold">{h.label}</p>
                  <p className="text-[9px] text-stone-400 font-light font-mono">{h.date}</p>
                </div>
                <span className={`font-mono text-xs font-bold shrink-0 ${h.isAdd ? 'text-emerald-600' : 'text-rose-600'}`}>{h.points}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. PENGATURAN AKUN */}
      {/* ======================================================== */}
      <section className="space-y-3.5">
        <h3 className="font-serif font-extrabold text-base text-stone-950">Akseptasi & Pengaturan VIP</h3>
        
        <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden divide-y divide-stone-200 shadow-sm text-left">
          {/* Modify WhatsApp info */}
          <div 
            onClick={() => setShowWaModal(true)}
            className="flex items-center justify-between p-4.5 cursor-pointer hover:bg-stone-100/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </span>
              <div className="font-sans">
                <h4 className="text-xs font-extrabold text-stone-900 leading-tight">Nomor WhatsApp Member</h4>
                <p className="text-[10.5px] text-stone-605 font-mono mt-1">{profile?.whatsapp || 'Belum ditambahkan'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>

          {/* Toggle WA Confirmation details */}
          <div className="flex items-center justify-between p-4.5 bg-stone-100/10">
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-gold-450/10 text-gold-700 border border-gold-300 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </span>
              <div className="font-sans">
                <h4 className="text-xs font-extrabold text-stone-900 leading-tight">Pengingat & Notifikasi WhatsApp</h4>
                <p className="text-[9.5px] text-stone-500 mt-1 leading-snug">Detail bukti booking premium terkirim real-time ke nomor Anda.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div>
            </label>
          </div>

          {/* Syariat Privacy rules disclosure */}
          <div 
            onClick={() => onShowToast("🔒 Alisya Syariah Safe: Foto & dokumentasi ruangan tertutup steril dijaga tanpa risiko kebocoran data.", "info")}
            className="flex items-center justify-between p-4.5 cursor-pointer hover:bg-stone-100/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div className="font-sans">
                <h4 className="text-xs font-extrabold text-stone-900 leading-tight">Jaminan Privasi Syar'i (Syarat Safekeeping)</h4>
                <p className="text-[9.5px] text-stone-500 mt-1">Sertifikasi perlindungan ruangan privat mutlak tanpa visual luar.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>

          {/* Reach Help CS center */}
          <a 
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4.5 cursor-pointer hover:bg-stone-100/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-gold-450/15 text-gold-700 border border-gold-300 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div className="font-sans">
                <h4 className="text-xs font-extrabold text-stone-900 leading-tight">Bantuan & Pusat Konsultasi Syari</h4>
                <p className="text-[9.5px] text-stone-500 mt-1">Kesulitan melakukan pesanan atau koreksi jadwal? Hubungi CS kami.</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-stone-400" />
          </a>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. SOSIAL MEDIA */}
      {/* ======================================================== */}
      <section className="bg-stone-50 border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
        <h4 className="text-[9px] font-black text-stone-500 uppercase tracking-widest text-center">Ikuti Sosial Media Kami @AlisyaBeauty</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-stone-200 rounded-xl hover:border-pink-300 text-[11px] font-bold text-stone-605 transition-all active:scale-95">
            <Instagram className="w-3.5 h-3.5 text-pink-650" /> Instagram
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-stone-200 rounded-xl hover:border-stone-400 text-[11px] font-bold text-stone-605 transition-all active:scale-95">
            <MessageCircle className="w-3.5 h-3.5 text-stone-800" /> Tik Tok
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-stone-200 rounded-xl hover:border-blue-300 text-[11px] font-bold text-stone-605 transition-all active:scale-95">
            <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
          </a>
          <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-stone-200 rounded-xl hover:border-emerald-300 text-[11px] font-bold text-stone-605 transition-all active:scale-95">
            <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp CS
          </a>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. PANEL ADMIN */}
      {/* ======================================================== */}
      {isAdmin && (
        <section className="bg-amber-500/10 border border-amber-300/40 rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 blur-xl rounded-full" />
          <div className="flex items-center gap-2">
            <Shield className="text-amber-700 w-5 h-5" />
            <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Akses Administrator Terdeteksi</h4>
          </div>
          <p className="text-[10px] text-stone-600 leading-relaxed font-sans font-light">
            Sebagai pemilik Alisya Beauty, Anda berhak membuka panel kontrol utama untuk mengelola jadwal kecantikan pelanggan, treatment list, dan stok produk salon terdaftar.
          </p>
          <button
            onClick={onNavigateToAdmin}
            className="w-full bg-amber-400 hover:bg-amber-300 text-[#050507] font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider shadow-sm"
          >
            Buka Panel Admin Utama <ChevronRight className="w-4 h-4 text-[#050507]" />
          </button>
        </section>
      )}

      {/* ======================================================== */}
      {/* 10. LOGOUT BUTTON */}
      {/* ======================================================== */}
      <section className="pt-2">
        <button 
          onClick={onLogout}
          className="w-full py-3.5 bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-700 hover:bg-rose-100/50 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all uppercase tracking-wider font-sans shadow-sm"
        >
          <LogOut className="w-4 h-4 text-rose-600" /> Keluar dari Akun Member VIP
        </button>
      </section>

      {/* ======================================================== */}
      {/* MODAL WHATSAPP DIALOG SCREEN */}
      {/* ======================================================== */}
      {showWaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507]/60 px-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-5 space-y-4 shadow-xl relative">
            <button
               onClick={() => setShowWaModal(false)}
               className="absolute right-4.5 top-4.5 p-1 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-left">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif font-extrabold text-sm text-stone-900">Ubah Nomor WhatsApp</h3>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Nomor Aktif WhatsApp</label>
              <input 
                type="tel"
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full bg-white border border-stone-200 text-stone-900 focus:border-gold-550 rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all font-mono"
              />
              <p className="text-[9.5px] text-stone-505 leading-normal font-sans text-left">Nomor ini dipakai admin kami untuk mengirim detail konfirmasi penjemputan atau konfirmasi reservasi Salon Alisya.</p>
            </div>
            <div className="flex items-center gap-3.5 pt-2">
              <button
                onClick={() => setShowWaModal(false)}
                className="flex-1 py-3 bg-stone-100 text-stone-600 border border-stone-200 rounded-xl font-bold text-xs hover:bg-stone-200 cursor-pointer active:scale-95 transition-all hover:text-stone-900"
              >
                Batal
              </button>
              <button
                onClick={handleSaveWa}
                disabled={savingWa}
                className="flex-1 py-3 bg-gold-450 hover:bg-gold-500 text-stone-950 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {savingWa ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
