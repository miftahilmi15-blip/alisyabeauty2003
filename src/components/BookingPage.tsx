import React, { useState, useEffect } from 'react';
import { 
  Calendar, Trash2, Send, Clock, PlusCircle, AlertCircle, FileText, 
  Star, MessageSquare, Check, X, ShieldAlert, Sparkles, Smile, Phone
} from 'lucide-react';
import { 
  fetchTreatments, 
  subscribeBookings, 
  createBooking, 
  removeBooking,
  fetchReviews,
  createReview,
  fetchReviewedBookingIds
} from '../services/dataService';
import { Treatment, Booking, UserProfile, Review } from '../types';

interface BookingPageProps {
  userProfile: UserProfile | null;
  preselectedTreatment: string;
  clearPreselectedTreatment: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function BookingPage({ 
  userProfile, 
  preselectedTreatment, 
  clearPreselectedTreatment,
  onShowToast
}: BookingPageProps) {
  // Tabs "create" / "history"
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create');
  
  // Bookings list state & real-time
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Filter status for booking history
  // ALL | PENDING | CONFIRMED | COMPLETED | CANCELLED
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Form states
  const [formName, setFormName] = useState(userProfile?.displayName || '');
  const [formWhatsapp, setFormWhatsapp] = useState(userProfile?.whatsapp || '');
  const [formEmail, setFormEmail] = useState(userProfile?.email || '');
  const [formTreatment, setFormTreatment] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Review Modal States
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Load static treatments once
  useEffect(() => {
    async function loadTreatmentsAndReviews() {
      try {
        const tData = await fetchTreatments();
        setTreatments(tData);

        const rData = await fetchReviews();
        setReviewsList(rData);
        
        if (preselectedTreatment) {
          setFormTreatment(preselectedTreatment);
          clearPreselectedTreatment();
        }
      } catch (err) {
        console.error("Gagal memuat katalog Alisya Beauty:", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadTreatmentsAndReviews();
  }, [preselectedTreatment]);

  // Set Profile Default values when log in state updates
  useEffect(() => {
    if (userProfile) {
      if (!formName) setFormName(userProfile.displayName || '');
      if (!formWhatsapp) setFormWhatsapp(userProfile.whatsapp || '');
      if (!formEmail) setFormEmail(userProfile.email || '');
    }
  }, [userProfile]);

  // Real-time Bookings and Reviewed Booking IDs
  useEffect(() => {
    if (!userProfile) {
      setMyBookings([]);
      setLoadingBookings(false);
      return;
    }

    setLoadingBookings(true);
    
    // Subscribe to real-time changes
    const unsubscribe = subscribeBookings(userProfile.uid, (data) => {
      setMyBookings(data);
      setLoadingBookings(false);
    });

    // Fetch already reviewed mapping
    async function loadReviewedIds() {
      try {
        const reviewedIds = await fetchReviewedBookingIds(userProfile.uid);
        setReviewedBookingIds(reviewedIds);
      } catch (e) {
        console.error(e);
      }
    }
    loadReviewedIds();

    return () => {
      unsubscribe();
    };
  }, [userProfile]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      onShowToast("Silakan login terlebih dahulu untuk membuat booking.", "error");
      return;
    }
    if (!formName.trim()) {
      onShowToast("Nama wajib diisi.", "error");
      return;
    }
    if (!formWhatsapp.trim()) {
      onShowToast("Nomor WhatsApp wajib diisi.", "error");
      return;
    }
    if (!formTreatment) {
      onShowToast("Pilih jenis layanan terlebih dahulu.", "error");
      return;
    }
    if (!formDate || !formTime) {
      onShowToast("Pilih tanggal dan waktu reservasi.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const isSuccess = await createBooking({
        userId: userProfile.uid,
        userName: formName,
        userEmail: formEmail,
        treatment: formTreatment,
        date: formDate,
        time: formTime,
        notes: formNotes,
        customerName: formName,
        whatsapp: formWhatsapp,
        email: formEmail,
        service: formTreatment,
        bookingDate: formDate,
        bookingTime: formTime
      });

      if (isSuccess) {
        onShowToast("🌸 Booking Alisya Beauty Berhasil Ditampung!", "success");

        // Format and send WhatsApp admin message
        const waMessageText = `🌸 BOOKING BARU ALISYA BEAUTY 🌸

Nama:
${formName}

WhatsApp:
${formWhatsapp}

Email:
${formEmail || '-'}

Layanan:
${formTreatment}

Tanggal:
${formDate}

Jam:
${formTime}

Catatan:
${formNotes || '-'}

Status:
PENDING

Mohon segera lakukan konfirmasi.

Nomor Admin:
628123456789`;

        // Clear fields
        setFormTreatment("");
        setFormDate("");
        setFormTime("");
        setFormNotes("");
        
        // Open WhatsApp admin redirect automatically
        const adminWhatsappNumber = "628123456789";
        const trimmedNumber = adminWhatsappNumber.replace(/\D/g, "");
        const waURL = `https://api.whatsapp.com/send?phone=${trimmedNumber}&text=${encodeURIComponent(waMessageText)}`;
        
        onShowToast("Membuka WhatsApp Admin untuk konfirmasi...", "info");
        setTimeout(() => {
          window.open(waURL, '_blank');
        }, 1100);

        // Auto move to history tab to watch the processing state
        setActiveSubTab('history');
      } else {
        onShowToast("Gagal membuat booking. Silakan coba lagi.", "error");
      }
    } catch (e) {
      onShowToast("Gagal memproses booking.", "error");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan booking ini?")) {
      try {
        const success = await removeBooking(id);
        if (success) {
          onShowToast("Booking berhasil dibatalkan.", "success");
        } else {
          onShowToast("Gagal menghapus booking.", "error");
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
        
        // Refresh reviews list
        const rData = await fetchReviews();
        setReviewsList(rData);
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

  // Maps done vs completed, cancel vs cancelled
  const getMappedStatus = (status: Booking['status']): 'pending' | 'confirmed' | 'completed' | 'cancelled' => {
    if (status === 'done') return 'completed';
    return status;
  };

  // Get status details
  const getStatusConfig = (status: Booking['status']) => {
    const mapped = getMappedStatus(status);
    const configs = {
      pending: { label: "PENDING", tint: "text-amber-400 bg-amber-400/10 border-amber-400/30", dot: "bg-amber-400" },
      confirmed: { label: "CONFIRMED", tint: "text-amber-200 bg-amber-550/10 border-gold-400/40", dot: "bg-gold-400" },
      completed: { label: "COMPLETED", tint: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", dot: "bg-emerald-400" },
      cancelled: { label: "CANCELLED", tint: "text-rose-400 bg-rose-400/10 border-rose-400/30", dot: "bg-rose-400" }
    };
    return configs[mapped] || configs.pending;
  };

  // Filter & sort bookings list
  const filteredBookings = myBookings.filter((b) => {
    const s = getMappedStatus(b.status);
    if (statusFilter === 'all') return true;
    return s === statusFilter;
  });

  return (
    <div className="space-y-8 pb-24 text-stone-800 min-h-screen bg-white p-1 md:p-4 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden animate-fade-in-up">
      
      {/* Decorative ambient background lights */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 rounded-full bg-gold-200/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-rose-200/5 blur-3xl pointer-events-none" />

      {/* Header Alisya VIP Brand style */}
      <div className="relative text-center max-w-xl mx-auto space-y-2 pt-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-200/20 rounded-full border border-gold-550/15 text-gold-600 text-[10px] tracking-widest uppercase font-black">
          <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-pulse" /> VIP Booking Center
        </div>
        <h2 className="text-3.5xl font-serif font-bold tracking-wide text-stone-900">
          Alisya Beauty
        </h2>
        <p className="text-xs text-stone-650 max-w-sm mx-auto leading-relaxed font-light">
          Wujudkan impian kecantikan Muslimah Anda. Setiap reservasi menjamin privasi total, kenyamanan ekstra, dan terapis berlisensi syariah.
        </p>
      </div>

      {/* SUB-TABS INTERFACES switch: Booking Baru | Riwayat Booking */}
      <div className="flex justify-center max-w-md mx-auto pt-2">
        <div className="grid grid-cols-2 bg-stone-50 border border-stone-200 p-1 rounded-2xl w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('create')}
            className={`py-2.5 rounded-xl text-xs font-bold tracking-wider cursor-pointer uppercase transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'create'
                ? 'bg-gold-500 text-stone-950 shadow-sm scale-95 font-extrabold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> BOOKING BARU
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`py-2.5 rounded-xl text-xs font-bold tracking-wider cursor-pointer uppercase transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-gold-500 text-stone-950 shadow-sm scale-95 font-extrabold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4" /> RIWAYAT BOOKING
            {myBookings.length > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono ${
                activeSubTab === 'history' ? 'bg-[#050507] text-gold-455' : 'bg-gold-500/10 text-gold-700 border border-gold-300/20'
              }`}>
                {myBookings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT SPLITTER OR VIEWS */}
      <div className="max-w-3xl mx-auto">
        {activeSubTab === 'create' ? (
          /* ======================================================== */
          /* FORM BOOKING VIEW */
          /* ======================================================== */
          <section className="bg-stone-50 border border-stone-200 p-5 md:p-8 rounded-3xl shadow-sm relative overflow-hidden backdrop-blur-lg space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h3 className="font-serif font-extrabold text-lg text-stone-900 flex items-center gap-2">
                <Calendar className="w-5.5 h-5.5 text-gold-550" /> Formulir Reservasi VIP
              </h3>
              <p className="text-[11px] text-stone-605 mt-1">
                Silakan isi data kunjungan Anda. Sistem kami akan memperbarui status secara real-time.
              </p>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-5">
              {/* Profile Details (Row of Name & WhatsApp) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 animate-fade-in-up">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-widest block">Nama Customer</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full bg-white border border-stone-200 focus:border-gold-550 focus:bg-white text-stone-900 rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-400 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-widest block">WhatsApp Aktif</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-gold-600"><Phone className="w-3.5 h-3.5" /></span>
                    <input
                      type="tel"
                      required
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      placeholder="Contoh: 08123456789 atau 62812..."
                      className="w-full bg-white border border-stone-200 focus:border-gold-550 focus:bg-white text-stone-900 rounded-xl py-3 pl-11 pr-4 text-xs outline-none transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* Email (Optional/Helper) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-widest block">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-white border border-stone-200 focus:border-gold-550 focus:bg-white text-[#050507] rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              {/* Treatment Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-widest block">Pilih Layanan Treatment</label>
                <select
                  value={formTreatment}
                  onChange={(e) => setFormTreatment(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-200 focus:border-gold-550 focus:bg-white text-stone-850 rounded-xl py-3 px-4 text-xs outline-none transition-all cursor-pointer shadow-inner"
                >
                  <option value="" className="text-stone-400 bg-white font-serif">-- Pilih Layanan Premium --</option>
                  {treatments.map((t) => (
                    <option key={t.id} value={t.name} className="text-stone-800 bg-white">
                      {t.name} (Rp {Number(t.price).toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time slots Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-widest block font-sans">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    min={today}
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-200 focus:border-gold-550 focus:bg-white text-stone-900 rounded-xl py-2.5 px-4 text-xs outline-none transition-all cursor-pointer font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-widest block">Waktu Kunjungan (Slot Jam)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {timeSlots.map((time) => {
                      const isSelected = formTime === time;
                      return (
                        <button
                          type="button"
                          key={time}
                          onClick={() => setFormTime(time)}
                          className={`py-2 rounded-lg text-[11px] font-mono border cursor-pointer text-center transition-all ${
                            isSelected 
                              ? 'bg-gold-500 text-stone-950 border-gold-500 shadow-sm font-bold scale-95' 
                              : 'bg-white text-stone-605 border-stone-200 hover:border-gold-450/45 hover:bg-stone-50'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notes Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-widest block flex items-center gap-1">
                  Catatan Khusus <span className="text-[9px] text-stone-500 font-light lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Tuliskan permintaan khusus (contoh: preferensi terapis, riwayat alergi skincare, atau detail lainnya)..."
                  className="w-full bg-white border border-stone-200 focus:border-gold-550 focus:bg-white text-stone-850 rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              {/* Booking Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full relative overflow-hidden bg-gold-500 hover:bg-gold-400 text-stone-950 font-extrabold text-xs tracking-widest py-4 px-6 rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                    Memproses Reservasi...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-stone-950" /> Booking Sekarang & Hubungi Admin
                  </>
                )}
              </button>
            </form>
          </section>
        ) : (
          /* ======================================================== */
          /* BOOKING HISTORY & TRACKING VIEW */
          /* ======================================================== */
          <section className="space-y-6">
            {/* Status filters */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pb-2">
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((filter) => {
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-widest uppercase border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gold-500 text-stone-950 border-gold-500 shadow-sm scale-95'
                        : 'bg-stone-50 text-stone-605 border-stone-200 hover:text-stone-900 hover:border-stone-300'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* List entries */}
            {loadingBookings ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 bg-stone-50 border border-stone-200 rounded-3xl">
                <div className="w-8 h-8 border-2 border-gold-400/40 border-t-gold-500 rounded-full animate-spin" />
                <span className="text-xs text-stone-600">Sinkronisasi Database Alisya...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 px-6 bg-stone-50 border border-dashed border-stone-200 rounded-3xl space-y-3">
                <AlertCircle className="w-9 h-9 text-stone-400 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs text-stone-800 font-bold">Tidak ada riwayat booking ditemukan.</p>
                  <p className="text-[10px] text-stone-500 max-w-xs mx-auto">Reservasi yang Anda lakukan akan muncul di sini secara real-time dari Firebase Database.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('create')}
                  className="bg-gold-500/15 hover:bg-gold-500/25 text-gold-800 border border-gold-400/20 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-transform active:scale-95"
                >
                  Buat Booking Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => {
                  const statusConf = getStatusConfig(b.status);
                  const isCompleted = getMappedStatus(b.status) === 'completed';
                  const alreadyReviewed = reviewedBookingIds.includes(b.id);
                  const bookingDateVal = b.bookingDate || b.date;
                  const bookingTimeVal = b.bookingTime || b.time;
                  const treatmentVal = b.treatment || b.service;

                  return (
                    <article 
                      key={b.id}
                      className="p-5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col gap-4 relative hover:border-gold-500/35 transition-all text-left shadow-sm overflow-hidden animate-fade-in-up"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-serif font-extrabold text-stone-900 text-base tracking-wide">{treatmentVal}</h4>
                          <span className="text-[10px] text-stone-600 font-medium flex items-center gap-1.5 mt-1 font-sans">
                            <Clock className="w-3.5 h-3.5 text-gold-600" /> {bookingDateVal} pukul {bookingTimeVal} WIB
                          </span>
                        </div>

                        {/* Status elements */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-black tracking-widest px-3 py-1 rounded-full border ${statusConf.tint}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot} animate-pulse`} />
                            {statusConf.label}
                          </span>

                          {/* Delete pending/cancelled option */}
                          {(!isCompleted && getMappedStatus(b.status) !== 'confirmed') && (
                            <button 
                              onClick={() => handleCancelBooking(b.id)}
                              className="text-stone-400 hover:text-rose-600 p-1.5 rounded-xl cursor-pointer hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-100"
                              title="Batalkan Booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Info fields */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-stone-600 border-b border-stone-200 pb-3 font-sans">
                        <div>
                          <span className="text-stone-400 block">Atas Nama:</span>
                          <span className="text-stone-800 font-bold">{b.customerName || b.userName}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">WhatsApp:</span>
                          <span className="text-stone-800 font-mono">{b.whatsapp || "-"}</span>
                        </div>
                      </div>

                      {b.notes && (
                        <div className="bg-white border border-stone-200 p-2.5 rounded-xl text-[10px] italic text-stone-600 flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                          <span>"{b.notes}"</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] font-mono text-stone-400 gap-3 pt-1">
                        <span>BOOKING ID: {b.id ? b.id.substring(0, 16) : ""}</span>
                        
                        {/* Rating click triggers */}
                        {isCompleted && (
                          alreadyReviewed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl font-bold uppercase font-sans">
                              <Check className="w-3.5 h-3.5 shrink-0" /> Sudah Direview
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReviewBooking(b);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                              className="bg-gold-500/15 hover:bg-gold-500 text-gold-800 hover:text-stone-950 border border-gold-300 px-3 py-1.5 rounded-xl font-bold uppercase font-sans tracking-wide transition-all duration-300 transform hover:scale-103 cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5 fill-current shrink-0" /> Beri Review
                            </button>
                          )
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ======================================================== */}
      {/* BEAUTIFUL LUXURIOUS PUBLIC REVIEWS & TESTIMONIALS SECTION */}
      {/* ======================================================== */}
      <section className="max-w-3xl mx-auto pt-8 border-t border-stone-200 text-left space-y-6">
        <div>
          <span className="text-[10px] text-gold-650 uppercase tracking-widest font-black block">Customer Testimonials</span>
          <h3 className="font-serif font-extrabold text-xl text-stone-900 flex items-center gap-2">
            <Smile className="w-5.5 h-5.5 text-rose-455" /> Ulasan Kepuasan VIP
          </h3>
          <p className="text-[11px] text-stone-600">
            Dengarkan tanggapan jujur dari Shaliha member kami setelah merasakan sensasi pelayanan Alisya Beauty.
          </p>
        </div>

        {reviewsList.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
            <p className="text-xs text-stone-550">Belum ada ulasan untuk ditampilkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.map((rev) => (
              <article 
                key={rev.id}
                className="bg-stone-50 border border-stone-200 p-4.5 rounded-2xl flex flex-col justify-between gap-3.5 hover:border-gold-500/20 transition-all font-sans relative shadow-sm"
              >
                <div className="space-y-2">
                  {/* Rating Stars and Service title */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-gold-500 fill-gold-500' : 'text-stone-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-700 leading-relaxed font-light italic">
                    "{rev.comment || "Sangat memuaskan!"}"
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-stone-200">
                  <img 
                    src={rev.userPhoto || 'https://api.dicebear.com/7.x/adventurer/svg?seed=shaliha'} 
                    alt={rev.userName} 
                    className="w-8 h-8 rounded-full border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-stone-955 block truncate leading-none">{rev.userName}</span>
                    <span className="text-[9px] text-gold-650 truncate block mt-1 tracking-wider">{rev.service}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* REVIEW & RATING SUBMISSION MODAL DIALOG */}
      {/* ======================================================== */}
      {activeReviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507]/60 backdrop-blur-md px-4 py-8 animate-fade-in-up">
          <div className="bg-white border border-stone-200 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl space-y-5 animate-fade-in-up">
            <button
              onClick={() => setActiveReviewBooking(null)}
              className="absolute right-4.5 top-4.5 p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center mx-auto text-gold-600 mb-2">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <h4 className="font-serif font-extrabold text-stone-900 text-base">Berikan Penilaian Salon</h4>
              <p className="text-[10px] text-stone-600">
                Ulasan Anda untuk layanan <span className="text-gold-700 font-bold">"{activeReviewBooking.treatment || activeReviewBooking.service}"</span>
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star selector interactable */}
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono">Bintang Penilaian</span>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = reviewHoverRating ? star <= reviewHoverRating : star <= reviewRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 focus:outline-none focus:scale-110 active:scale-95 transition-all text-stone-200 hover:text-gold-550 cursor-pointer"
                      >
                        <Star 
                          className={`w-7 h-7 transition-all ${
                            isFilled 
                              ? 'text-gold-500 fill-gold-500 drop-shadow-[0_0_8px_rgba(212,175,55,0.45)] scale-110' 
                              : 'text-stone-300'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-gold-600 font-bold mt-1">
                  {reviewRating === 5 && "Sempurna (5/5) 🌟"}
                  {reviewRating === 4 && "Sangat Baik (4/5) ✨"}
                  {reviewRating === 3 && "Cukup Memuaskan (3/5) 👍"}
                  {reviewRating === 2 && "Perlu Peningkatan (2/5) ⚠️"}
                  {reviewRating === 1 && "Kurang Memuaskan (1/5) ❌"}
                </span>
              </div>

              {/* Textarea review comment */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-stone-605 uppercase block">Komentar Ulasan (Opsional)</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan pengalaman menyenangkan Anda di Alisya Beauty..."
                  className="w-full bg-white border border-stone-200 text-xs focus:border-gold-500 text-stone-900 rounded-xl py-3 px-4 outline-none transition-all placeholder:text-stone-400 shadow-inner"
                />
              </div>

              {/* submit button */}
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-gold-500 hover:bg-gold-400 text-stone-950 font-extrabold text-xs tracking-widest py-3 px-4 rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase"
              >
                {submittingReview ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                    Mengirim Ulasan...
                  </>
                ) : (
                  "Kirim Feedback Premium"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
