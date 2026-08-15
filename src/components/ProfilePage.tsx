import React, { useState, useEffect } from 'react';
import { 
  fetchUserProfile, 
  updateUserWhatsapp, 
  fetchBookings,
  subscribeBookings,
  updateBookingStatus,
  createReview,
  fetchReviewedBookingIds,
  updateUserAddress,
  subscribeShopOrders
} from '../services/dataService';
import { UserProfile, Booking, CartItem, ShopOrder } from '../types';
import { 
  ShieldCheck, 
  Phone, 
  Bell, 
  LogOut, 
  Loader2, 
  Award, 
  Gift, 
  Heart, 
  Crown, 
  CheckCircle2, 
  Settings,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  MapPin,
  QrCode,
  Lock,
  Trash2,
  Sparkles,
  History,
  X,
  Share2,
  Copy,
  Plus,
  Star,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Instagram,
  Facebook,
  ShoppingBag
} from 'lucide-react';

const ADMIN_EMAIL = 'miftahilmi15@gmail.com';

const levelConfig = {
  Bronze:   { color: '#A88062', next: 'Silver',   nextPts: 500,  icon: '🥉' },
  Silver:   { color: '#8A9597', next: 'Gold',     nextPts: 1500, icon: '🥈' },
  Gold:     { color: '#D4AF37', next: 'Platinum', nextPts: 3000, icon: '🥇' },
  Platinum: { color: '#708090', next: null,       nextPts: null, icon: '💎' },
};

interface ProfilePageProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdatewhatsapp: (newNum: string) => void;
  onNavigate?: (tab: string) => void;
  cartItems?: CartItem[];
  onOpenCart?: () => void;
}

export default function ProfilePage({ 
  userProfile, 
  onLogout, 
  onNavigateToAdmin, 
  onShowToast,
  onUpdatewhatsapp,
  onNavigate,
  cartItems = [],
  onOpenCart
}: ProfilePageProps) {
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState({ total: 0, done: 0, active: 0 });
  const [favoriteTreatments, setFavoriteTreatments] = useState<{ name: string; count: number }[]>([]);
  
  // Settings & Notification state
  const [notifEnabled, setNotifEnabled] = useState(true);

  // Modals state
  const [showWaModal, setShowWaModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFavModal, setShowFavModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Booking history details states
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);

  // Boutique order history details states
  const [myOrders, setMyOrders] = useState<ShopOrder[]>([]);
  const [orderStats, setOrderStats] = useState({ total: 0, done: 0, active: 0 });

  // Review states
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Sub-states
  const [waInput, setWaInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number; accuracy?: number; mapsUrl?: string } | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingWa, setSavingWa] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);
  
  // Local active vouchers
  const [vouchers, setVouchers] = useState([
    { id: 'v1', name: 'Selamat Datang!', discount: 'Potongan 10%', code: 'WELCOMESALON', expiry: '31 Des 2026', desc: 'Gunakan saat memesan treatment salon pertama Anda' }
  ]);

  // Point history log
  const [historyLogs, setHistoryLogs] = useState([
    { id: 'h1', desc: 'Bonus Pendaftaran Member', points: '+100', date: '30 Juni 2026' }
  ]);

  useEffect(() => {
    if (!userProfile) return;

    // Load initial profile data & reviewed bookings
    async function loadInitial() {
      try {
        const uProf = await fetchUserProfile(userProfile!.uid);
        setProfile(uProf);
        setWaInput(uProf.whatsapp || "");
        setAddressInput(uProf.address || "");
        setGpsLocation(uProf.gpsLocation || null);
        setCurrentPoints(uProf.points || 0);

        const revIds = await fetchReviewedBookingIds(userProfile!.uid);
        setReviewedBookingIds(revIds);
      } catch (err) {
        console.error("loadInitial error:", err);
      }
    }
    loadInitial();

    // Subscribe to bookings in real-time
    const unsubscribeBookings = subscribeBookings(userProfile.uid, (list) => {
      setMyBookings(list);

      let total = 0, done = 0, active = 0;
      const treatmentCounts: Record<string, number> = {};

      list.forEach(d => {
        total++;
        if (d.status === 'done') done++;
        if (['pending', 'confirmed'].includes(d.status)) active++;

        const tName = d.treatment || d.service || "Layanan";
        treatmentCounts[tName] = (treatmentCounts[tName] || 0) + 1;
      });

      setBookingStats({ total, done, active });

      const sortedFavs = Object.entries(treatmentCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      setFavoriteTreatments(sortedFavs);

      // Populate mock histories dynamically based on total bookings
      const mockLogs = [
        { id: 'h1', desc: 'Bonus Pendaftaran Member', points: '+100', date: '30 Juni 2026' }
      ];
      if (total > 0) {
        mockLogs.push({
          id: 'h2',
          desc: `Bonus Transaksi Reservasi (${total} Booking)`,
          points: `+${total * 10}`,
          date: 'Baru saja'
        });
      }
      if (done > 0) {
        mockLogs.push({
          id: 'h3',
          desc: `Reward Treatment Selesai (${done} Done)`,
          points: `+${done * 25}`,
          date: 'Baru saja'
        });
      }
      setHistoryLogs(mockLogs);
      setLoading(false);
    });

    // Subscribe to boutique shop orders in real-time
    const unsubscribeOrders = subscribeShopOrders(userProfile.uid, (list) => {
      setMyOrders(list);

      let total = 0, done = 0, active = 0;
      list.forEach(o => {
        total++;
        if (o.status === 'completed') done++;
        if (o.status === 'pending') active++;
      });
      setOrderStats({ total, done, active });
    });

    return () => {
      unsubscribeBookings();
      unsubscribeOrders();
    };
  }, [userProfile]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 bg-[#FCFAF8] min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#A98436] animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Membuat profil premium...</span>
      </div>
    );
  }

  const level = profile?.level || 'Bronze';
  const cfg = levelConfig[level] || levelConfig.Bronze;
  const isAdmin = profile?.email === ADMIN_EMAIL;

  // Level Progression Math
  let progress = 0;
  let progressLabel = '';
  if (cfg.next && cfg.nextPts) {
    const prevPts = level === 'Bronze' ? 0 : level === 'Silver' ? 500 : 1500;
    progress = Math.min(100, Math.round(((currentPoints - prevPts) / (cfg.nextPts - prevPts)) * 100));
    if (progress < 0) progress = 0;
    progressLabel = `${cfg.nextPts - currentPoints > 0 ? cfg.nextPts - currentPoints : 0} poin lagi ke level ${cfg.next}`;
  } else {
    progress = 100;
    progressLabel = 'Level Tertinggi!';
  }

  const handleSaveWa = async () => {
    if (!profile) return;
    if (!waInput.trim()) {
      onShowToast("Tolong masukkan nomor WhatsApp.", "error");
      return;
    }
    setSavingWa(true);
    try {
      const success = await updateUserWhatsapp(profile.uid, waInput.trim());
      if (success) {
        setProfile(prev => prev ? { ...prev, whatsapp: waInput.trim() } : null);
        onUpdatewhatsapp(waInput.trim());
        onShowToast("✅ Nomor WhatsApp disimpan!", "success");
        setShowWaModal(false);
      } else {
        onShowToast("Gagal menyimpan nomor.", "error");
      }
    } catch (e) {
      onShowToast("Terjadi kesalahan.", "error");
    } finally {
      setSavingWa(false);
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      onShowToast("❌ Browser atau perangkat Anda tidak mendukung pelacakan GPS.", "error");
      return;
    }

    setDetectingGps(true);
    onShowToast("📡 Menghubungi satelit GPS... Mohon izinkan akses lokasi jika diminta.", "info");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setGpsLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          mapsUrl
        });
        setDetectingGps(false);
        onShowToast(`🎯 GPS Berhasil Dideteksi! Akurasi: ±${Math.round(accuracy)} meter.`, "success");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDetectingGps(false);
        let errorMsg = "Gagal melacak lokasi GPS.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Akses lokasi ditolak. Tolong izinkan GPS pada pengaturan browser/app Anda.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Sinyal GPS tidak tersedia atau tidak akurat.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Waktu pencarian GPS habis. Silakan coba lagi.";
        }
        onShowToast(`❌ ${errorMsg}`, "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSaveAddress = async () => {
    if (!profile) return;
    if (!addressInput.trim()) {
      onShowToast("Mohon masukkan alamat lengkap pengiriman.", "error");
      return;
    }

    setSavingAddress(true);
    try {
      const success = await updateUserAddress(profile.uid, addressInput.trim(), gpsLocation || undefined);
      if (success) {
        setProfile(prev => prev ? { ...prev, address: addressInput.trim(), gpsLocation: gpsLocation || undefined } : null);
        onShowToast("✅ Alamat pengiriman & koordinat GPS disimpan!", "success");
        setShowAddressModal(false);
      } else {
        onShowToast("Gagal menyimpan alamat.", "error");
      }
    } catch (e) {
      onShowToast("Terjadi kesalahan saat menyimpan alamat.", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  // Redeem Points Handler
  const handleRedeem = (cost: number, giftName: string, discountVal: string, code: string) => {
    if (currentPoints < cost) {
      onShowToast("Poin Anda tidak mencukupi.", "error");
      return;
    }
    setCurrentPoints(prev => prev - cost);
    // Add to active vouchers
    const newVoucher = {
      id: `v_redeem_${Date.now()}`,
      name: giftName,
      discount: discountVal,
      code,
      expiry: '31 Des 2026',
      desc: `Ditukarkan dengan ${cost} poin member Alisya`
    };
    setVouchers(prev => [newVoucher, ...prev]);
    // Add to logs
    setHistoryLogs(prev => [
      {
        id: `h_redeem_${Date.now()}`,
        desc: `Penukaran Poin: ${giftName}`,
        points: `-${cost}`,
        date: 'Baru saja'
      },
      ...prev
    ]);
    onShowToast(`🎉 Sukses menukar ${cost} poin dengan ${giftName}!`, "success");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    onShowToast("📋 Kode kupon disalin!", "success");
  };

  const handleResetAkun = () => {
    // Clear local storage and show simulation toast
    localStorage.clear();
    onShowToast("🔄 Data akun peranti berhasil di-reset!", "success");
    setShowResetModal(false);
    setTimeout(() => {
      onLogout();
    }, 1500);
  };

  // Booking History Helpers
  const getMappedStatus = (status: Booking['status']): 'pending' | 'confirmed' | 'completed' | 'cancelled' => {
    if (status === 'done') return 'completed';
    return status;
  };

  const getStatusConfig = (status: Booking['status']) => {
    const mapped = getMappedStatus(status);
    const configs = {
      pending: { label: "Menunggu Persetujuan", tint: "text-amber-700 bg-amber-50/70 border-amber-200/50 font-sans font-semibold tracking-wide", dot: "bg-amber-500" },
      confirmed: { label: "Dipersilakan Datang", tint: "text-emerald-800 bg-emerald-50/70 border-emerald-200/50 font-sans font-semibold tracking-wide", dot: "bg-emerald-500" },
      completed: { label: "Selesai", tint: "text-emerald-850 bg-emerald-100/50 border-emerald-200/40 font-sans font-extrabold tracking-wide", dot: "bg-emerald-600" },
      cancelled: { label: "Dibatalkan", tint: "text-rose-700 bg-rose-50 border-rose-200/60 font-sans font-semibold tracking-wide", dot: "bg-rose-500" }
    };
    return configs[mapped] || configs.pending;
  };

  const handleCancelBooking = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan Reservasi ini?")) {
      try {
        const success = await updateBookingStatus(id, 'cancelled');
        if (success) {
          onShowToast("Reservasi berhasil dibatalkan.", "success");
        } else {
          onShowToast("Gagal memproses pembatalan.", "error");
        }
      } catch (err) {
        onShowToast("Terjadi kesalahan pembatalan.", "error");
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !activeReviewBooking) return;

    setSubmittingReview(true);
    try {
      const isSuccess = await createReview({
        bookingId: activeReviewBooking.id,
        userId: userProfile.uid,
        userName: userProfile.displayName || "Member Shaliha",
        userPhoto: userProfile.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userProfile.displayName}`,
        rating: reviewRating,
        comment: reviewComment,
        service: activeReviewBooking.treatment || activeReviewBooking.service || "Layanan Salon",
        createdAt: new Date().toISOString()
      });

      if (isSuccess) {
        onShowToast("🌟 Terima kasih atas ulasan premium Anda!", "success");
        setReviewedBookingIds(prev => [...prev, activeReviewBooking.id]);
        setActiveReviewBooking(null);
        setReviewComment('');
        setReviewRating(5);
      } else {
        onShowToast("Gagal mengirim ulasan.", "error");
      }
    } catch (e) {
      console.error(e);
      onShowToast("Kesalahan sistem mengirim ulasan.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-[#FCFAF8] min-h-screen text-stone-800">
      {showSettingsModal ? (
        <div className="max-w-md mx-auto px-4.5 pt-6 pb-24 font-sans space-y-7 text-stone-800 animate-fade-in text-left">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#ECE8E1] mb-5">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="flex items-center gap-1 text-stone-600 hover:text-[#A98436] font-extrabold text-xs transition-colors cursor-pointer border-0 bg-transparent"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              <span>Kembali</span>
            </button>
            <h2 className="font-serif font-black text-base text-stone-900 leading-none">Pengaturan Akun</h2>
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="text-xs font-black text-[#A98436] uppercase tracking-wider hover:text-[#8e6e2b] border-0 bg-transparent cursor-pointer"
            >
              Selesai
            </button>
          </div>

          {/* Profile Quick Overview Flat */}
          <div className="flex items-center gap-3.5 py-3 px-4 bg-white border border-[#ECE8E1] rounded-[18px] shadow-3xs">
            <div className="w-11 h-11 rounded-full border-2 border-[#A98436]/30 p-0.5 bg-white shrink-0">
              <img 
                src={profile?.photoURL || 'assets/logo/default-avatar.png'} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'assets/logo/default-avatar.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-stone-900 truncate leading-tight">{profile?.displayName || 'mfthilmi_15'}</div>
              <div className="text-[10px] text-stone-500 truncate mt-0.5">{profile?.email}</div>
              {profile?.level && (
                <span className="inline-block bg-[#A98436]/10 text-[#A98436] border border-[#A98436]/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full mt-1.5 leading-none uppercase">
                  Member {profile.level} ({profile.points || 0} Pts)
                </span>
              )}
            </div>
          </div>

          {/* Group 1: Profil & Keamanan */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold pl-1">Profil & Keamanan</span>
            <div className="bg-white border border-[#ECE8E1] rounded-[18px] overflow-hidden divide-y divide-[#ECE8E1] shadow-3xs">
              {/* WhatsApp */}
              <div 
                onClick={() => setShowWaModal(true)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-stone-850">Nomor WhatsApp</div>
                    <div className="text-[9px] text-stone-400 mt-0.5">Untuk koordinasi salon & butik</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-stone-400">
                  <span className="text-[10px] font-medium text-stone-500 font-mono">
                    {profile?.whatsapp || 'Belum diisi'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Alamat & GPS */}
              <div 
                onClick={() => setShowAddressModal(true)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7.5 h-7.5 rounded-full bg-[#A98436]/10 flex items-center justify-center text-[#A98436] border border-[#A98436]/20 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-stone-850">Alamat & GPS Akurat</div>
                    <div className="text-[9px] text-stone-400 mt-0.5 truncate">
                      {profile?.gpsLocation ? `🎯 GPS Terkalibrasi (±${profile.gpsLocation.accuracy}m)` : 'Atur alamat kirim & koordinat GPS'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-stone-400 max-w-[45%] shrink-0">
                  <span className="text-[10px] font-medium text-stone-500 truncate">
                    {profile?.address || 'Belum diisi'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Preferensi */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold pl-1">Preferensi</span>
            <div className="bg-white border border-[#ECE8E1] rounded-[18px] overflow-hidden divide-y divide-[#ECE8E1] shadow-3xs">
              {/* Toggle Notification */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-stone-850">Notifikasi Booking</div>
                    <div className="text-[9px] text-stone-400 mt-0.5">Dapatkan kabar otomatis via WA</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={notifEnabled}
                    onChange={() => {
                      setNotifEnabled(!notifEnabled);
                      onShowToast(notifEnabled ? "🔕 Notifikasi dimatikan." : "🔔 Notifikasi WhatsApp diaktifkan!", "info");
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4.5 bg-stone-200/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>
            </div>
          </div>

          {/* Group 3: Sistem */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold pl-1">Sistem</span>
            <div className="bg-white border border-[#ECE8E1] rounded-[18px] overflow-hidden divide-y divide-[#ECE8E1] shadow-3xs">
              {/* Privacy */}
              <div 
                onClick={() => setShowPrivacyModal(true)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-stone-850">Kebijakan Privasi</div>
                    <div className="text-[9px] text-stone-400 mt-0.5">Cara kami melindungi data Anda</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Reset Account */}
              <div 
                onClick={() => setShowResetModal(true)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/50">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#E11D48]">Reset Data Akun</div>
                    <div className="text-[9px] text-stone-400 mt-0.5">Bersihkan cache aplikasi di peranti</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Keluar dari Akun */}
              <div 
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
                    onLogout();
                  }
                }}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-rose-50/40 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100/50">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-rose-600">Keluar dari Akun</div>
                    <div className="text-[9px] text-stone-400 mt-0.5">Keluar dari sesi akun aktif Anda</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Selesai Button */}
          <div className="pt-4 pb-10">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-3 bg-[#A98436] hover:bg-[#8e6e2b] text-white font-bold text-xs uppercase tracking-wider rounded-[14px] cursor-pointer shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 border-0"
            >
              Simpan & Selesai
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto px-0 pt-0 pb-20 font-sans space-y-3.5 text-stone-800 animate-fade-in text-left">
        
        {/* ==========================================
            SECTION 1: PREMIUM ALISYA-STYLE HEADER PROFILE (Shopee Layout)
           ========================================== */}
        <div className="-mx-4.5 md:-mx-8 -mt-6 md:-mt-10 mb-1 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#EFE7D8] pt-5 pb-3 px-4.5 md:px-8 text-stone-800 relative overflow-hidden rounded-none border-b border-[#E5DAC9] shadow-[0_2px_12px_rgba(169,132,54,0.03)]">
          {/* Subtle Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[radial-gradient(circle_at_center,_#A98436_1.2px,_transparent_1.2px)] bg-[size:12px_12px]" />
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #A98436 10%, transparent 11%), radial-gradient(circle, #A98436 10%, transparent 11%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
          
          {/* Top Row: Utility Icons on Right */}
          <div className="flex items-center justify-end mb-3.5 relative z-10">
            {/* Right: Settings, Notification, Chat Icons */}
            <div className="flex items-center gap-2.5 text-stone-600">
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="hover:text-[#A98436] hover:bg-white/80 active:scale-90 transition-all cursor-pointer p-2 bg-white/50 border border-[#EBE7DF] rounded-full text-stone-600"
                title="Pengaturan Akun"
              >
                <Settings className="w-4.5 h-4.5 stroke-[2]" />
              </button>
              
              <button 
                onClick={onOpenCart}
                className="relative hover:text-[#A98436] hover:bg-white/80 active:scale-90 transition-all cursor-pointer p-2 bg-white/50 border border-[#EBE7DF] rounded-full text-stone-600"
                title="Keranjang Belanja"
              >
                <div className="w-4 h-4 relative flex items-center justify-center text-[13px] leading-none">
                  🛒
                </div>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#A98436] text-white text-[8px] font-extrabold px-1 py-0.2 rounded-full min-w-4 border border-white shadow-3xs">
                    {totalCartCount}
                  </span>
                )}
              </button>
              
              <a 
                href="https://wa.me/628123456789" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative hover:text-[#A98436] hover:bg-white/80 active:scale-90 transition-all cursor-pointer p-2 bg-white/50 border border-[#EBE7DF] rounded-full text-stone-600 flex items-center justify-center"
                title="Chat Customer Service"
              >
                <MessageCircle className="w-4 h-4 stroke-[2]" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </a>
            </div>
          </div>
          
          {/* Middle Row: Avatar and User Info */}
          <div className="flex items-center gap-4.5 mb-3.5 relative z-10">
            {/* Avatar Circle with Camera/Edit Indicator */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-[#A98436]/40 p-0.5 bg-white shadow-md">
                <img 
                  src={profile?.photoURL || 'assets/logo/default-avatar.png'} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'assets/logo/default-avatar.png';
                  }}
                />
              </div>
              {/* Edit camera circle overlay */}
              <button 
                onClick={() => setShowWaModal(true)}
                className="absolute bottom-0 right-0 w-5 h-5 bg-[#A98436] text-white rounded-full border border-white flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
              >
                <span className="text-[9px] leading-none">✏️</span>
              </button>
            </div>
            
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-serif font-extrabold text-stone-900 tracking-wide leading-tight truncate">
                  {profile?.displayName || 'mfthilmi_15'}
                </h2>
                {/* Level Badge Pill matching screenshot */}
                <span 
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border shadow-3xs uppercase"
                  style={{ 
                     borderColor: `${cfg.color}35`, 
                     backgroundColor: `${cfg.color}15`, 
                     color: cfg.color 
                  }}
                >
                  <span className="text-[10px] leading-none">{cfg.icon}</span>
                  <span>{level}</span>
                  <ChevronRight className="w-2.5 h-2.5 opacity-80" />
                </span>
              </div>
              
              {/* Followers info exactly matching screenshot but in stone colors */}
              <div className="flex items-center gap-3.5 mt-1.5 text-[11.5px] text-stone-500">
                <span>
                  <span className="font-extrabold text-stone-800">193</span> Pengikut
                </span>
                <span>
                  <span className="font-extrabold text-stone-800">226</span> Mengikuti
                </span>
              </div>
              
              {/* Seamless Level Progress Text */}
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-[#A98436]">
                <span>✨</span>
                <span>{progressLabel}</span>
              </div>
            </div>
          </div>
          
          {/* Floating VIP Card/Banner inside the header */}
          <div 
            onClick={() => setShowRedeemModal(true)}
            className="bg-gradient-to-r from-[#FFFDF9] via-[#FAF8F5] to-[#F5EAD2] border-t border-[#EBE7DF] rounded-none -mx-4.5 md:-mx-8 mt-2 mb-[-12px] px-4.5 md:px-8 py-2.5 flex items-center justify-between text-stone-800 shadow-[0_-2px_10px_rgba(169,132,54,0.02)] cursor-pointer hover:bg-[#F2E5CA] transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              {/* VIP Gold badge */}
              <div className="bg-gradient-to-r from-[#A98436] to-[#C09A4E] text-white px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-wider flex items-center gap-0.5 shadow-3xs uppercase">
                <span>👑</span>
                <span>VIP</span>
              </div>
              <span className="text-[10px] font-extrabold text-[#A98436] truncate max-w-[190px]">
                Dapatkan Extra Diskon 20% Setiap Hari
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-[#A98436] stroke-[2.5]" />
          </div>
        </div>
        
        {/* ==========================================
            SECTIONS WRAPPER (Nested with padding for beautiful rounded-card and grid layouts like the screenshot)
           ========================================== */}
        <div className="-mx-4.5 md:-mx-0 px-0 md:px-0 space-y-2">
          
          {/* ==========================================
              SECTION 2: RIWAYAT PESANAN (Status Bar layout inside a clean card for boutique orders)
             ========================================== */}
          <div className="animate-fade-in text-left">
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-2 pl-0.5">
                Riwayat Pesanan
              </h3>
              
              <div className="grid grid-cols-3 gap-1 text-center">
                {/* Total Pesanan */}
                <button 
                  onClick={() => {
                    setBookingFilter('all');
                    setShowBookingsModal(true);
                  }}
                  className="flex flex-col items-center justify-center py-1 hover:bg-stone-50/50 active:scale-95 transition-all cursor-pointer border-0 bg-transparent group"
                >
                  <div className="relative w-8 h-8 flex items-center justify-center mb-1.5">
                    <ShoppingBag className="w-5.5 h-5.5 text-[#A98436] stroke-[1.8] group-hover:scale-105 transition-transform duration-200" />
                    <span className="absolute -top-1.5 -right-1.5 bg-[#A98436] text-white text-[8.5px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-3xs">
                      {orderStats.total}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-stone-700 group-hover:text-[#A98436] transition-colors leading-none">Semua</span>
                </button>
                
                {/* Aktif */}
                <button 
                  onClick={() => {
                    setBookingFilter('active');
                    setShowBookingsModal(true);
                  }}
                  className="flex flex-col items-center justify-center py-1 hover:bg-stone-50/50 active:scale-95 transition-all cursor-pointer border-0 bg-transparent group"
                >
                  <div className="relative w-8 h-8 flex items-center justify-center mb-1.5">
                    <Clock className="w-5.5 h-5.5 text-stone-600 stroke-[1.8] group-hover:scale-105 transition-transform duration-200" />
                    {orderStats.active > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#A98436] text-white text-[8.5px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-3xs">
                        {orderStats.active}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-stone-700 group-hover:text-[#A98436] transition-colors leading-none">Aktif</span>
                </button>
                
                {/* Selesai */}
                <button 
                  onClick={() => {
                    setBookingFilter('completed');
                    setShowBookingsModal(true);
                  }}
                  className="flex flex-col items-center justify-center py-1 hover:bg-stone-50/50 active:scale-95 transition-all cursor-pointer border-0 bg-transparent group"
                >
                  <div className="relative w-8 h-8 flex items-center justify-center mb-1.5">
                    <CheckCircle2 className="w-5.5 h-5.5 text-stone-600 stroke-[1.8] group-hover:scale-105 transition-transform duration-200" />
                    {orderStats.done > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-stone-400 text-white text-[8.5px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-3xs">
                        {orderStats.done}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-stone-700 group-hover:text-[#A98436] transition-colors leading-none">Selesai</span>
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              SECTION 3: AKSES CEPAT (Quick Access - nested beautifully inside a clean white card)
             ========================================== */}
          <div className="animate-fade-in text-left">
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-2 pl-0.5">
                Akses Cepat
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Hubungi CS */}
                <a 
                  href="https://wa.me/628123456789" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-stone-50/60 border border-stone-100/70 rounded-xl p-3 flex items-center justify-between text-left hover:bg-stone-100/60 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/60 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-extrabold text-stone-850 leading-tight truncate">Hubungi CS</h4>
                      <p className="text-[8.5px] font-bold text-emerald-600 mt-0.5 leading-none truncate">WhatsApp</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>
                
                {/* Favorit Treatment */}
                <div 
                  onClick={() => setShowFavModal(true)}
                  className="bg-stone-50/60 border border-stone-100/70 rounded-xl p-3 flex items-center justify-between text-left hover:bg-stone-100/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/60 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-extrabold text-stone-850 leading-tight truncate">Favorit</h4>
                      <p className="text-[8.5px] font-bold text-rose-500 mt-0.5 leading-none truncate">Treatment</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
                
                {/* Lokasi Cabang */}
                <div 
                  onClick={() => onNavigate?.('maps')}
                  className="bg-stone-50/60 border border-stone-100/70 rounded-xl p-3 flex items-center justify-between text-left hover:bg-stone-100/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100/60 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-extrabold text-stone-850 leading-tight truncate">Lokasi</h4>
                      <p className="text-[8.5px] font-bold text-[#A98436] mt-0.5 leading-none truncate">Cabang</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
                
                {/* QR Member */}
                <div 
                  onClick={() => setShowQrModal(true)}
                  className="bg-stone-50/60 border border-stone-100/70 rounded-xl p-3 flex items-center justify-between text-left hover:bg-stone-100/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-stone-50 flex items-center justify-center text-stone-700 border border-stone-200/65 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-extrabold text-stone-850 leading-tight truncate">QR Member</h4>
                      <p className="text-[8.5px] font-bold text-stone-500 mt-0.5 leading-none truncate">Scan Diskon</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
          
          {/* ==========================================
              SECTION 4: LOYALTY & REWARD (Beautiful 2-column rectangular cards grid like Keuangan nested inside a clean white card)
             ========================================== */}
          <div className="animate-fade-in text-left">
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-2 pl-0.5">
                Loyalty & Reward
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Tukar Poin Reward */}
                <div 
                  onClick={() => setShowRedeemModal(true)}
                  className="bg-stone-50/60 border border-stone-100/70 rounded-xl p-3 flex items-center justify-between text-left hover:bg-stone-100/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-amber-50 flex items-center justify-center text-[#A98436] border border-amber-100/60 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-extrabold text-stone-850 leading-tight truncate">Tukar Poin</h4>
                      <p className="text-[8.5px] font-bold text-[#A98436] mt-0.5 leading-none truncate">{currentPoints} Pts Tersedia</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
                
                {/* Voucher Aktif Anda */}
                <div 
                  onClick={() => setShowVoucherModal(true)}
                  className="bg-stone-50/60 border border-stone-100/70 rounded-xl p-3 flex items-center justify-between text-left hover:bg-stone-100/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/60 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-extrabold text-stone-850 leading-tight truncate">Voucher Anda</h4>
                      <p className="text-[8.5px] font-bold text-rose-500 mt-0.5 leading-none truncate">{vouchers.length} Kupon Aktif</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
                
                {/* Riwayat Perolehan Poin */}
                <div 
                  onClick={() => setShowHistoryModal(true)}
                  className="bg-stone-50/60 border border-stone-100/70 rounded-xl p-3 col-span-2 flex items-center justify-between text-left hover:bg-stone-100/60 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-200/50 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-extrabold text-stone-850 leading-tight">Riwayat Poin & Aktivitas</h4>
                      <p className="text-[8.5px] text-stone-400 font-semibold mt-0.5 leading-none">Catatan perolehan, klaim & klaim diskon Anda</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================
              SECTION 5: SOSMED (Socials - Horizontal Grid inside One Card)
             ========================================== */}
          <div className="animate-fade-in text-left">
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-2 pl-0.5">
                Sosmed
              </h3>
              <div className="grid grid-cols-4 gap-1 text-center">
                {/* Instagram */}
                <a 
                  href="https://instagram.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="py-1 flex flex-col items-center justify-center hover:bg-stone-50/55 rounded-xl transition-colors duration-250 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-stone-50/50 border border-stone-100 flex items-center justify-center mb-0.5 shadow-3xs transition-transform duration-250 group-hover:scale-105">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="ig-icon-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#feda75" />
                        <stop offset="25%" stopColor="#fa7e1e" />
                        <stop offset="50%" stopColor="#d62976" />
                        <stop offset="75%" stopColor="#962fbf" />
                        <stop offset="100%" stopColor="#4f5bd5" />
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-icon-grad)" strokeWidth="2.2" />
                    <circle cx="12" cy="12" r="3.8" stroke="url(#ig-icon-grad)" strokeWidth="2.2" />
                    <circle cx="17.5" cy="6.5" r="1.1" fill="url(#ig-icon-grad)" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-stone-700">Instagram</span>
              </a>

              {/* TikTok */}
              <a 
                href="https://tiktok.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-1 flex flex-col items-center justify-center hover:bg-stone-50/55 rounded-xl transition-colors duration-250 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-stone-50/50 border border-stone-100 flex items-center justify-center mb-0.5 shadow-3xs transition-transform duration-250 group-hover:scale-105">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    {/* Cyan Glow Layer */}
                    <path 
                      d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.14 2.29 1.88 3.72 2.14v3.9c-1.39-.03-2.76-.46-3.92-1.23-.74-.49-1.37-1.14-1.84-1.89v7.1c0 1.27-.3 2.52-.89 3.63-.78 1.48-2.12 2.61-3.71 3.12-1.57.51-3.29.41-4.79-.29C5.12 20.1 4.02 18.7 3.52 17.1c-.5-1.6-.37-3.35.39-4.85.74-1.46 2.06-2.58 3.64-3.11 1.07-.36 2.21-.44 3.32-.23v3.91c-.81-.24-1.69-.15-2.42.27-.72.41-1.25 1.13-1.45 1.94-.21.84-.04 1.74.45 2.44.49.7 1.27 1.13 2.11 1.18.91.06 1.84-.31 2.39-1.04.42-.56.63-1.25.61-1.95V.02z" 
                      fill="#00f2fe" 
                      transform="translate(-0.4, -0.4)"
                    />
                    {/* Magenta Glow Layer */}
                    <path 
                      d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.14 2.29 1.88 3.72 2.14v3.9c-1.39-.03-2.76-.46-3.92-1.23-.74-.49-1.37-1.14-1.84-1.89v7.1c0 1.27-.3 2.52-.89 3.63-.78 1.48-2.12 2.61-3.71 3.12-1.57.51-3.29.41-4.79-.29C5.12 20.1 4.02 18.7 3.52 17.1c-.5-1.6-.37-3.35.39-4.85.74-1.46 2.06-2.58 3.64-3.11 1.07-.36 2.21-.44 3.32-.23v3.91c-.81-.24-1.69-.15-2.42.27-.72.41-1.25 1.13-1.45 1.94-.21.84-.04 1.74.45 2.44.49.7 1.27 1.13 2.11 1.18.91.06 1.84-.31 2.39-1.04.42-.56.63-1.25.61-1.95V.02z" 
                      fill="#fe0979" 
                      transform="translate(0.4, 0.4)"
                    />
                    {/* Black note on top */}
                    <path 
                      d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.14 2.29 1.88 3.72 2.14v3.9c-1.39-.03-2.76-.46-3.92-1.23-.74-.49-1.37-1.14-1.84-1.89v7.1c0 1.27-.3 2.52-.89 3.63-.78 1.48-2.12 2.61-3.71 3.12-1.57.51-3.29.41-4.79-.29C5.12 20.1 4.02 18.7 3.52 17.1c-.5-1.6-.37-3.35.39-4.85.74-1.46 2.06-2.58 3.64-3.11 1.07-.36 2.21-.44 3.32-.23v3.91c-.81-.24-1.69-.15-2.42.27-.72.41-1.25 1.13-1.45 1.94-.21.84-.04 1.74.45 2.44.49.7 1.27 1.13 2.11 1.18.91.06 1.84-.31 2.39-1.04.42-.56.63-1.25.61-1.95V.02z" 
                      fill="#1C1A17" 
                    />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-stone-700">TikTok</span>
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-1 flex flex-col items-center justify-center hover:bg-stone-50/55 rounded-xl transition-colors duration-250 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-stone-50/50 border border-stone-100 flex items-center justify-center mb-0.5 shadow-3xs transition-transform duration-250 group-hover:scale-105">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-stone-700">Facebook</span>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/6289661946783" 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-1 flex flex-col items-center justify-center hover:bg-stone-50/55 rounded-xl transition-colors duration-250 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-stone-50/50 border border-stone-100 flex items-center justify-center mb-0.5 shadow-3xs transition-transform duration-250 group-hover:scale-105">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12.004 0C5.373 0 0 5.373 0 12.004C0 14.28 0.638 16.49 1.842 18.423L0.264 23.771C0.218 23.928 0.259 24.099 0.373 24.213C0.461 24.3 0.583 24.347 0.707 24.347C0.748 24.347 0.79 24.342 0.831 24.33L6.347 22.842C8.192 23.834 10.215 24.357 12.28 24.357C12.296 24.357 12.312 24.357 12.328 24.357C18.955 24.348 24.321 18.973 24.321 12.336C24.321 5.673 18.736 0 12.004 0Z" fill="#25D366" />
                    <path d="M18.232 17.202C17.971 17.937 16.738 18.497 16.143 18.552C15.688 18.594 15.093 18.618 13.069 17.771C10.482 16.688 8.805 14.054 8.676 13.883C8.547 13.712 7.603 12.457 7.603 11.162C7.603 9.867 8.261 9.232 8.519 8.963C8.713 8.761 9.034 8.675 9.307 8.675C9.395 8.675 9.476 8.68 9.548 8.684C9.761 8.693 9.914 8.706 10.059 9.054C10.24 9.489 10.678 10.559 10.732 10.67C10.786 10.781 10.84 10.93 10.766 11.079C10.692 11.228 10.63 11.313 10.518 11.442C10.406 11.571 10.283 11.721 10.183 11.821C10.076 11.928 9.957 12.045 10.093 12.279C10.229 12.513 10.7 13.284 11.396 13.904C12.292 14.702 13.024 14.956 13.256 15.053C13.434 15.127 13.593 15.111 13.717 14.975C13.864 14.814 14.052 14.547 14.246 14.275C14.383 14.082 14.551 14.056 14.729 14.122C14.907 14.188 15.86 14.657 16.053 14.754C16.246 14.851 16.381 14.898 16.427 14.978C16.473 15.058 16.473 15.437 16.212 16.172Z" fill="white" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-stone-700">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
          
          {/* ==========================================
              SECTION 6: OWNER ACCESS
             ========================================== */}
          {isAdmin && (
            <div className="space-y-1.5 text-left animate-fade-in">
              <span className="text-[10px] uppercase tracking-wider text-amber-750 font-bold pl-1">Owner Access</span>
              <div 
                onClick={onNavigateToAdmin}
                className="relative rounded-2xl border border-amber-200/60 p-3.5 text-stone-800 overflow-hidden shadow-xs cursor-pointer bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:shadow-sm transition-all duration-250 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-200/50 shadow-3xs">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Admin Dashboard</h4>
                      <p className="text-[10px] text-stone-600 font-medium leading-none">Kelola seluruh reservasi, promo & analytics</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
      )}

      {/* ==========================================
          MODAL SECTION (iOS Styled & Seamless Transitions)
         ========================================== */}

      {/* 0. GENERAL SETTINGS MODAL (GIRI ICON TRIGGERED) */}
      {false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FCFAF8] rounded-[28px] border border-[#ECE8E1] max-w-sm w-full overflow-hidden shadow-2xl relative text-left animate-fade-in-up duration-250">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FFFDF9] to-[#FAF6F0] p-5 border-b border-[#ECE8E1] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#A98436]/10 flex items-center justify-center text-[#A98436]">
                  <Settings className="w-4.5 h-4.5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-serif text-[15px] font-extrabold text-stone-900 leading-none">Pengaturan Akun</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">Kelola data profil, alamat & privasi</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer border-0 bg-transparent"
                title="Tutup"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Profile Card Summary inside settings */}
              <div className="bg-white border border-[#ECE8E1] rounded-[18px] p-3.5 flex items-center gap-3 shadow-3xs">
                <div className="w-11 h-11 rounded-full border-2 border-[#A98436]/30 p-0.5 bg-white shrink-0">
                  <img 
                    src={profile?.photoURL || 'assets/logo/default-avatar.png'} 
                    alt="Avatar" 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'assets/logo/default-avatar.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-stone-900 truncate">{profile?.displayName || 'mfthilmi_15'}</div>
                  <div className="text-[10px] text-stone-500 truncate">{profile?.email}</div>
                </div>
              </div>

              {/* Group 1: Profil & Keamanan */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold pl-1">Profil & Keamanan</span>
                <div className="bg-white border border-[#ECE8E1] rounded-[18px] overflow-hidden divide-y divide-[#ECE8E1] shadow-3xs">
                  {/* WhatsApp */}
                  <div 
                    onClick={() => {
                      setShowWaModal(true);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7.5 h-7.5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-stone-850">Nomor WhatsApp</div>
                        <div className="text-[9px] text-stone-400 mt-0.5">Untuk koordinasi salon & butik</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-stone-400">
                      <span className="text-[10px] font-medium text-stone-500 font-mono">
                        {profile?.whatsapp || 'Belum diisi'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Alamat & GPS */}
                  <div 
                    onClick={() => {
                      setShowAddressModal(true);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-7.5 h-7.5 rounded-full bg-[#A98436]/10 flex items-center justify-center text-[#A98436] border border-[#A98436]/20 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-stone-850">Alamat & GPS Akurat</div>
                        <div className="text-[9px] text-stone-400 mt-0.5 truncate">
                          {profile?.gpsLocation ? '🎯 GPS Terkalibrasi' : 'Atur alamat kirim & koordinat GPS'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-stone-400 max-w-[45%] shrink-0">
                      <span className="text-[10px] font-medium text-stone-500 truncate">
                        {profile?.address || 'Belum diisi'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Preferensi */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold pl-1">Preferensi</span>
                <div className="bg-white border border-[#ECE8E1] rounded-[18px] overflow-hidden divide-y divide-[#ECE8E1] shadow-3xs">
                  {/* Toggle Notification */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7.5 h-7.5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-stone-850">Notifikasi Booking</div>
                        <div className="text-[9px] text-stone-400 mt-0.5">Dapatkan kabar otomatis via WA</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={notifEnabled}
                        onChange={() => {
                          setNotifEnabled(!notifEnabled);
                          onShowToast(notifEnabled ? "🔕 Notifikasi dimatikan." : "🔔 Notifikasi WhatsApp diaktifkan!", "info");
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4.5 bg-stone-200/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Group 3: Sistem */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold pl-1">Sistem</span>
                <div className="bg-white border border-[#ECE8E1] rounded-[18px] overflow-hidden divide-y divide-[#ECE8E1] shadow-3xs">
                  {/* Privacy */}
                  <div 
                    onClick={() => {
                      setShowPrivacyModal(true);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7.5 h-7.5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-stone-850">Kebijakan Privasi</div>
                        <div className="text-[9px] text-stone-400 mt-0.5">Cara kami melindungi data Anda</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Reset Account */}
                  <div 
                    onClick={() => {
                      setShowResetModal(true);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-50/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7.5 h-7.5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/50">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#E11D48]">Reset Data Akun</div>
                        <div className="text-[9px] text-stone-400 mt-0.5">Bersihkan cache aplikasi di peranti</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="p-4 border-t border-[#ECE8E1] bg-stone-50 flex items-center justify-center">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-[#A98436] to-[#D3B674] hover:from-[#c29f2e] hover:to-[#A98436] text-stone-950 font-black text-xs uppercase tracking-wider rounded-[14px] cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. WHATSAPP MODAL */}
      {showWaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-xs w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Ubah WhatsApp</h3>
              </div>
              <button onClick={() => setShowWaModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Nomor WhatsApp Aktif</label>
              <input 
                type="tel"
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-white border border-[#ECE8E1] text-stone-900 rounded-[12px] py-2.5 px-3.5 text-xs outline-none focus:border-[#A98436] font-mono transition-colors"
              />
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setShowWaModal(false)}
                className="flex-1 py-2.5 bg-stone-50 text-stone-600 border border-[#ECE8E1] rounded-[14px] font-bold text-xs hover:bg-stone-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveWa}
                disabled={savingWa}
                className="flex-1 py-2.5 bg-[#A98436] hover:bg-[#8e6e2b] text-white rounded-[14px] font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                {savingWa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1b. SHIPPING ADDRESS & GPS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-sm w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#A98436]" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Alamat & GPS Pengiriman</h3>
              </div>
              <button onClick={() => setShowAddressModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Alamat Lengkap Pengiriman</label>
                <textarea 
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="Nama Penerima, No. HP Aktif, Jalan, Blok, RT/RW, Kecamatan, Kota, Kode Pos..."
                  className="w-full bg-white border border-[#ECE8E1] text-stone-900 rounded-[12px] py-2.5 px-3.5 text-xs outline-none focus:border-[#A98436] font-sans transition-colors min-h-[90px] resize-none leading-relaxed"
                />
              </div>

              {/* GPS Detection Sub-Section */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Koordinat GPS Akurat</span>
                  {gpsLocation && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      ✓ Terkalibrasi
                    </span>
                  )}
                </div>

                {gpsLocation ? (
                  <div className="text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between text-[11px] text-stone-600">
                      <span>Latitude:</span>
                      <span className="font-bold text-stone-800">{gpsLocation.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-600">
                      <span>Longitude:</span>
                      <span className="font-bold text-stone-800">{gpsLocation.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-600">
                      <span>Akurasi GPS:</span>
                      <span className="font-bold text-amber-700">±{gpsLocation.accuracy} meter</span>
                    </div>
                    
                    <a 
                      href={gpsLocation.mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#A98436] hover:underline font-sans font-bold"
                    >
                      🗺️ Lihat di Google Maps
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                    Koordinat GPS belum dikalibrasi. Kalibrasi GPS sekarang agar kurir dapat menemukan lokasi Anda dengan sangat akurat.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 disabled:bg-stone-50 text-stone-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border border-stone-200/50 cursor-pointer"
                >
                  {detectingGps ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A98436]" />
                      <span className="animate-pulse">Menghubungi GPS...</span>
                    </>
                  ) : (
                    <>
                      📍 {gpsLocation ? "Kalibrasi Ulang GPS" : "Deteksi Lokasi GPS Saya"}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 py-2.5 bg-stone-50 text-stone-600 border border-[#ECE8E1] rounded-[14px] font-bold text-xs hover:bg-stone-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={savingAddress || detectingGps}
                className="flex-1 py-2.5 bg-[#A98436] hover:bg-[#8e6e2b] text-white rounded-[14px] font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {savingAddress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan Alamat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QR CODE MEMBER MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-xs w-full p-6 space-y-5 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#A98436]" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Kartu Digital</h3>
              </div>
              <button onClick={() => setShowQrModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
              {/* Styled Mock QR Code */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#ECE8E1] shadow-xs relative">
                <div className="w-40 h-40 flex flex-wrap gap-0.5 justify-center items-center opacity-90">
                  {/* Styled QR elements with center logo space */}
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-9 h-9 rounded-md transition-all ${
                        (i % 3 === 0 || i % 4 === 1 || i === 0 || i === 15 || i === 3 || i === 12) 
                        ? 'bg-stone-900' 
                        : 'bg-stone-100'
                      }`}
                    />
                  ))}
                  {/* Tiny logo badge over QR code */}
                  <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full border border-[#ECE8E1] flex items-center justify-center p-1 shadow-md">
                    <img src="assets/logo/logo.png" alt="" className="w-full h-auto object-contain rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = 'assets/logo/default-avatar.png'; }} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-stone-800">{profile?.displayName}</div>
                <div className="text-[10px] font-mono text-stone-400">UID: {profile?.uid?.substring(0, 10).toUpperCase()}</div>
                <span 
                  className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border shadow-3xs"
                  style={{ 
                    borderColor: `${cfg.color}35`, 
                    backgroundColor: `${cfg.color}15`, 
                    color: cfg.color 
                  }}
                >
                  {cfg.icon} {level} Member
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-stone-450 bg-stone-50 border border-stone-200/50 p-2.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-[#A98436] shrink-0" />
              <span className="text-stone-500 font-medium">Tunjukkan kode QR ke kasir salon untuk klaim diskon, poin, atau penukaran reward.</span>
            </div>

            <button
              onClick={() => onShowToast("🔄 Kode diperbarui!", "success")}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
            >
              Perbarui Kode
            </button>
          </div>
        </div>
      )}

      {/* 3. FAVORIT TREATMENT MODAL */}
      {showFavModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-xs w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Treatment Terfavorit</h3>
              </div>
              <button onClick={() => setShowFavModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 py-1">
              {favoriteTreatments && favoriteTreatments.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Perawatan yang sering dipesan</p>
                  {favoriteTreatments.slice(0, 5).map((fav, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-stone-400 font-mono text-xs font-bold w-4">#{i+1}</span>
                        <span className="text-xs font-semibold text-stone-700 truncate max-w-[170px]">{fav.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#A98436] bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        {fav.count} Kali
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 border border-rose-100">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-800">Belum ada favorit</div>
                    <p className="text-[10px] text-stone-400 max-w-[200px] leading-relaxed">Pesan berbagai perawatan premium kami untuk mulai melacak kecintaan Anda.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowFavModal(false);
                onNavigate?.('booking');
              }}
              className="w-full py-2.5 bg-[#A98436] hover:bg-[#8e6e2b] text-white font-bold text-xs rounded-xl transition-colors text-center cursor-pointer shadow-sm"
            >
              Cari Treatment Salon
            </button>
          </div>
        </div>
      )}

      {/* 4. REDEEM POIN REWARD MODAL */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-sm w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#A98436]" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Tukar Poin Alisya</h3>
              </div>
              <button onClick={() => setShowRedeemModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between items-center bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
              <div className="text-xs font-semibold text-stone-700">Poin Member Anda:</div>
              <div className="text-base font-mono font-bold text-[#A98436]">{currentPoints} Pts</div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {/* Reward 1 */}
              <div className="flex items-center justify-between p-3 bg-white border border-[#ECE8E1] rounded-xl hover:border-amber-200 transition-colors">
                <div className="text-left space-y-0.5">
                  <div className="text-xs font-bold text-stone-800">Potongan Rp 15.000</div>
                  <div className="text-[10px] text-stone-400">Dapat digunakan untuk semua booking</div>
                  <div className="text-[10px] font-bold text-[#A98436] font-mono">150 Poin</div>
                </div>
                <button
                  disabled={currentPoints < 150}
                  onClick={() => handleRedeem(150, "Kupon Diskon Rp 15.000", "Diskon Rp 15.000", "REDEEM15K")}
                  className="px-3 py-1.5 bg-[#A98436] hover:bg-[#8e6e2b] disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                >
                  Tukar
                </button>
              </div>

              {/* Reward 2 */}
              <div className="flex items-center justify-between p-3 bg-white border border-[#ECE8E1] rounded-xl hover:border-amber-200 transition-colors">
                <div className="text-left space-y-0.5">
                  <div className="text-xs font-bold text-stone-800">Gratis Premium Creambath</div>
                  <div className="text-[10px] text-stone-400">Hanya berlaku di outlet utama</div>
                  <div className="text-[10px] font-bold text-[#A98436] font-mono">350 Poin</div>
                </div>
                <button
                  disabled={currentPoints < 350}
                  onClick={() => handleRedeem(350, "Kupon Creambath Premium", "Creambath Gratis", "FREEHAIRBATH")}
                  className="px-3 py-1.5 bg-[#A98436] hover:bg-[#8e6e2b] disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                >
                  Tukar
                </button>
              </div>

              {/* Reward 3 */}
              <div className="flex items-center justify-between p-3 bg-white border border-[#ECE8E1] rounded-xl hover:border-amber-200 transition-colors">
                <div className="text-left space-y-0.5">
                  <div className="text-xs font-bold text-stone-800">Diskon 25% Semua Layanan</div>
                  <div className="text-[10px] text-stone-400">Berlaku untuk paket perawatan komplit</div>
                  <div className="text-[10px] font-bold text-[#A98436] font-mono">200 Poin</div>
                </div>
                <button
                  disabled={currentPoints < 200}
                  onClick={() => handleRedeem(200, "Kupon Diskon 25% Paket", "Diskon 25% Paket", "REDEEM25PKG")}
                  className="px-3 py-1.5 bg-[#A98436] hover:bg-[#8e6e2b] disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                >
                  Tukar
                </button>
              </div>
            </div>

            <div className="text-[9px] text-stone-400 text-center italic">
              Poin didapatkan secara otomatis setiap kali Anda melakukan reservasi dan menyelesaikan perawatan di Alisya.
            </div>
          </div>
        </div>
      )}

      {/* 5. VOUCHER AKTIF MODAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-sm w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Voucher Aktif Anda</h3>
              </div>
              <button onClick={() => setShowVoucherModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {vouchers.map((voucher) => (
                <div 
                  key={voucher.id} 
                  className="border border-[#ECE8E1] rounded-xl overflow-hidden relative shadow-[0_1px_4px_rgba(0,0,0,0.01)] bg-stone-50/20"
                >
                  {/* Left Ticket color bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-450" />
                  
                  <div className="p-3.5 pl-5 space-y-2 text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-extrabold text-stone-800 leading-tight">{voucher.name}</div>
                        <div className="text-[10px] text-stone-500 font-medium mt-0.5">{voucher.desc}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md shrink-0">
                          {voucher.discount}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-stone-200">
                      <div>
                        <div className="text-[8px] text-stone-400 uppercase tracking-wider font-bold">Kode Kupon</div>
                        <div className="text-xs font-mono font-bold text-stone-700 tracking-wide">{voucher.code}</div>
                      </div>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#ECE8E1] hover:border-stone-400 text-stone-600 rounded-lg text-[9px] font-bold transition-all duration-200 cursor-pointer shadow-3xs"
                      >
                        <Copy className="w-3 h-3" /> Salin
                      </button>
                    </div>

                    <div className="text-[8px] text-stone-400 text-right">
                      Selesai: {voucher.expiry}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowVoucherModal(false);
                onNavigate?.('booking');
              }}
              className="w-full py-2.5 bg-[#A98436] hover:bg-[#8e6e2b] text-white font-bold text-xs rounded-xl transition-colors text-center"
            >
              Gunakan Kupon Sekarang
            </button>
          </div>
        </div>
      )}

      {/* 6. RIWAYAT REWARD MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-sm w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-stone-600" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Riwayat Aktivitas Poin</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {historyLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center py-2.5 border-b border-stone-100 last:border-0 text-xs">
                  <div className="text-left space-y-0.5">
                    <div className="font-bold text-stone-800">{log.desc}</div>
                    <div className="text-[10px] text-stone-400 font-medium">{log.date}</div>
                  </div>
                  <div className={`font-mono font-bold text-sm ${log.points.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {log.points}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors text-center"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 7. PRIVASI MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-xs w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-serif text-[16px] font-bold text-stone-900 leading-none">Kebijakan Privasi</h3>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-3 max-h-60 overflow-y-auto pr-1 leading-relaxed">
              <p>Selamat datang di Alisya Beauty Salon. Kami sangat menghargai dan melindungi kerahasiaan data pribadi Anda.</p>
              <p className="font-bold text-stone-800">1. Data yang Kami Kumpulkan</p>
              <p>Kami menyimpan informasi nama, email, nomor WhatsApp, serta histori booking perawatan untuk membantu efisiensi reservasi Anda.</p>
              <p className="font-bold text-stone-800">2. Keamanan Data</p>
              <p>Semua data dienkripsi dengan aman melalui arsitektur cloud server kami. Kami menjamin data Anda tidak akan disebarkan kepada pihak ketiga tanpa persetujuan tertulis.</p>
              <p>Jika ada pertanyaan atau permintaan penghapusan data, silakan hubungi tim Customer Service kami.</p>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 bg-stone-150 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors text-center"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* 8. RESET AKUN MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-xs w-full p-6 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <h3 className="font-serif text-[16px] font-bold text-[#E11D48] leading-none">Konfirmasi Reset</h3>
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-2">
              <p className="font-semibold text-stone-800">Tindakan ini tidak dapat dibatalkan!</p>
              <p className="leading-relaxed">Reset akan menghapus seluruh data cache Alisya Beauty, riwayat kupon yang Anda kumpulkan, serta info WhatsApp dari perangkat lokal ini. Anda harus login kembali.</p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 bg-stone-100 text-stone-600 border border-[#ECE8E1] rounded-[14px] font-bold text-xs hover:bg-stone-200 cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleResetAkun}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[14px] font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. BOOKINGS HISTORY DETAILS MODAL (Now repurposed for Boutique orders history) */}
      {showBookingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF9F6] rounded-[28px] border border-[#ECE8E1] max-w-md w-full p-5 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#A98436]" />
                <h3 className="font-serif text-base font-extrabold text-stone-900 leading-none">Riwayat Pesanan</h3>
              </div>
              <button onClick={() => setShowBookingsModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter segments */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/80 rounded-xl text-[10.5px] shrink-0 font-sans">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  className={`py-2 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                    bookingFilter === f
                      ? 'bg-white text-[#A98436] shadow-3xs'
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
                </button>
              ))}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-sans">
              {(() => {
                const list = myOrders.filter((o) => {
                  if (bookingFilter === 'all') return true;
                  if (bookingFilter === 'active') return o.status === 'pending';
                  if (bookingFilter === 'completed') return o.status === 'completed';
                  return true;
                });

                if (list.length === 0) {
                  return (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                      <span className="text-3xl">🛍️</span>
                      <p className="text-xs text-stone-400 font-medium font-sans">Tidak ada riwayat pesanan barang ditemukan.</p>
                    </div>
                  );
                }

                return list.map((o) => {
                  const getOrderStatusConfig = (status: typeof o.status) => {
                    switch (status) {
                      case 'completed':
                        return { label: 'Selesai', dot: 'bg-emerald-500', tint: 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50' };
                      case 'cancelled':
                        return { label: 'Dibatalkan', dot: 'bg-rose-500', tint: 'bg-rose-50/50 text-rose-700 border-rose-100/50' };
                      default:
                        return { label: 'Diproses', dot: 'bg-amber-500', tint: 'bg-amber-50/50 text-amber-700 border-amber-100/50' };
                    }
                  };

                  const conf = getOrderStatusConfig(o.status);
                  const formattedDate = new Date(o.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={o.id}
                      className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-3xs space-y-3 flex flex-col relative overflow-hidden"
                    >
                      {/* Order card header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-stone-400 font-mono font-bold uppercase block">
                            {formattedDate} WIB
                          </span>
                          <h4 className="font-serif font-black text-xs text-stone-900 leading-tight">
                            {o.productName}
                          </h4>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8.5px] font-extrabold border ${conf.tint}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                          {conf.label}
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 border-t border-stone-100 text-[10px] text-stone-500 font-medium">
                        <div>
                          <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Kategori</span>
                          <span className="text-stone-850 font-bold">Produk Boutique</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Jumlah Item</span>
                          <span className="text-stone-850 font-bold">{o.quantity} pcs</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Total Pembayaran</span>
                          <span className="text-[#A98436] font-mono font-black text-xs">
                            Rp {o.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <button
              onClick={() => setShowBookingsModal(false)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs rounded-xl transition-colors text-center shrink-0 cursor-pointer uppercase tracking-wider"
            >
              Kembali ke Profil
            </button>
          </div>
        </div>
      )}

      {/* 10. INTERACTIVE REVIEW COMPOSER MODAL */}
      {activeReviewBooking && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/55 px-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] border border-[#ECE8E1] max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-left animate-fade-in-up duration-250">
            <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-serif text-base font-extrabold text-stone-900 leading-none">Ulasan Layanan</h3>
              </div>
              <button 
                onClick={() => setActiveReviewBooking(null)} 
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-[#FCFAF7] border border-[#EBE7DF] rounded-xl text-left space-y-1 shrink-0">
                <span className="text-[9px] text-[#8C8681] uppercase block tracking-wider font-bold">Treatment yang dinilai</span>
                <p className="font-serif text-xs font-extrabold text-stone-900 leading-tight">
                  {activeReviewBooking.treatment || activeReviewBooking.service}
                </p>
                <span className="text-[9px] text-stone-400 block font-mono">
                  Tanggal: {activeReviewBooking.bookingDate || activeReviewBooking.date}
                </span>
              </div>

              {/* Rating selection stars */}
              <div className="space-y-1.5 text-center">
                <label className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-wider block">Berapa bintang untuk layanan ini?</label>
                <div className="flex justify-center items-center gap-2 py-1 select-none">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = (reviewHoverRating || reviewRating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 focus:outline-none cursor-pointer transition-transform duration-100 hover:scale-120 border-0 bg-transparent"
                      >
                        <Star 
                          className={`w-7 h-7 ${
                            isLit 
                              ? "text-amber-500 fill-amber-400 filter drop-shadow-3xs" 
                              : "text-stone-200 fill-transparent"
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] font-extrabold text-[#A98436] min-h-4">
                  {reviewRating === 5 && "😍 Sempurna & Sangat Rekomendasi!"}
                  {reviewRating === 4 && "😊 Bagus & Nyaman"}
                  {reviewRating === 3 && "😐 Cukup Baik"}
                  {reviewRating === 2 && "🙁 Perlu Peningkatan"}
                  {reviewRating === 1 && "😡 Kurang Memuaskan"}
                </p>
              </div>

              {/* Comment text area */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9.5px] font-extrabold text-[#8C8681] uppercase tracking-wider block">Tulis Ulasan Anda</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan pengalaman nyaman Anda di Alisya Beauty..."
                  className="w-full bg-[#FCFAF7] border border-[#EBE7DF] focus:border-[#A98436] focus:bg-white text-stone-800 rounded-xl p-3 outline-none transition-all placeholder:text-stone-400 leading-relaxed font-medium"
                />
              </div>

              {/* Submit / Cancel Footer row */}
              <div className="flex items-center gap-2.5 pt-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveReviewBooking(null)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-600 border border-[#ECE8E1] rounded-xl font-bold hover:bg-stone-200 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-[#A98436] hover:bg-[#8e6e2b] text-white rounded-xl font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submittingReview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Kirim Ulasan</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
