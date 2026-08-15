import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Trash2, Send, Clock, PlusCircle, AlertCircle, FileText, 
  Star, MessageSquare, Check, X, ShieldAlert, Smile, Phone, ChevronDown, Gift,
  User, Sparkles, MapPin, ArrowLeft, ArrowRight, CheckCircle, Info, ChevronRight,
  ShieldCheck, Percent, HelpCircle, Award
} from 'lucide-react';
import { 
  fetchTreatments, 
  subscribeBookings, 
  subscribeAllBookings,
  createBooking, 
  removeBooking,
  fetchReviews,
  createReview,
  fetchReviewedBookingIds,
  fetchBranches,
  fetchPromos
} from '../services/dataService';
import { Treatment, Booking, UserProfile, Review, Promo } from '../types';

interface BookingPageProps {
  userProfile: UserProfile | null;
  preselectedTreatment: string;
  clearPreselectedTreatment: () => void;
  preselectedPromoId?: string;
  clearPreselectedPromoId?: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onNavigate?: (tabId: string) => void;
  showHistoryDirectly?: boolean;
  onCloseHistory?: () => void;
}

// Senior Therapist Profiles Catalog
const THERAPISTS = [
  { 
    id: "any", 
    name: "Terapis Terbaik Alisya", 
    role: "Pilihan Utama Otomatis", 
    rating: "4.9", 
    description: "Terapis handal bersertifikat yang paling cocok untuk tipe kulit dan rambut Anda.", 
    specialty: "Sesuai Treatment", 
    avatar: "https://api.dicebear.com/7.x/micah/svg?seed=any_therapist" 
  },
  { 
    id: "Siti Farida", 
    name: "Ustadzah Siti Farida", 
    role: "Senior Hair & Scalp Specialist (8+ Thn)", 
    rating: "5.0", 
    description: "Ahli perawatan rambut rontok khusus hijab, creambath botani, dan akupresur totok kepala.", 
    specialty: "Hair Care Master", 
    avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Siti" 
  },
  { 
    id: "Fathia Az-Zahra", 
    name: "Khadijah Fathia Az-Zahra", 
    role: "Aesthetic Skin Therapist (6+ Thn)", 
    rating: "4.9", 
    description: "Spesialis detoks komedo medis, facial kolagen aura, masker pencerah, dan pijat peremajaan wajah.", 
    specialty: "Aura Facial Pro", 
    avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Fathia" 
  },
  { 
    id: "Nadia Amira", 
    name: "Nadia Amira", 
    role: "Spa Therapy & Body Care Expert", 
    rating: "4.9", 
    description: "Sangat terampil dalam lulur rempah Jawa tradisional, mud mask, pemijatan limfatik pembuang penat.", 
    specialty: "Body Comfort Expert", 
    avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Nadia" 
  },
  { 
    id: "Rania Safitri", 
    name: "Rania Safitri", 
    role: "Signature Stone & Balinese Treatment", 
    rating: "5.0", 
    description: "Spesialis relaksasi mendalam, massage batu vulkanik basalt hangat, aromaterapi atsiri organik murni.", 
    specialty: "Luxury Spa Architect", 
    avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Rania" 
  },
];

// Room catalogs with specific category links
const ROOMS = [
  { 
    id: "Ruangan 1", 
    name: "VIP Jasmine Suite Room", 
    category: "body",
    special: "Sangat tenang, wewangian melati, ideal untuk pijat tubuh & lulur rempah.", 
    icon: "🪷",
    tint: "border-amber-300 bg-amber-50/50"
  },
  { 
    id: "Ruangan 2", 
    name: "Premium Rose Styling Cabin", 
    category: "hair",
    special: "Privat absolut, dirancang untuk keramas, creambath, & vitamin infus akar.", 
    icon: "🌹",
    tint: "border-rose-300 bg-rose-50/50"
  },
  { 
    id: "Ruangan 3", 
    name: "Orchid Healing Spa Chamber", 
    category: "spa",
    special: "Lampu lilin redup, aromaterapi anggrek rileks, batu hangat pelepas stres.", 
    icon: "🌸",
    tint: "border-purple-300 bg-purple-50/50"
  },
  { 
    id: "Ruangan 4", 
    name: "Sakura Aesthetic Skin Sanctum", 
    category: "face",
    special: "Steril maksimal, pencahayaan lembut khusus uap komedo & peeling wajah.", 
    icon: "✨",
    tint: "border-emerald-300 bg-emerald-50/50"
  }
];

export default function BookingPage({ 
  userProfile, 
  preselectedTreatment, 
  clearPreselectedTreatment,
  preselectedPromoId,
  clearPreselectedPromoId,
  onShowToast,
  onNavigate,
  showHistoryDirectly = false,
  onCloseHistory
}: BookingPageProps) {
  
  // Bookings list state & real-time
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [activePromo, setActivePromo] = useState<Promo | null>(null);
  
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Redesign step states (1 to 10)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<'hair' | 'face' | 'body' | 'spa'>('hair');

  // Filter status for booking history
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Form states
  const [formName, setFormName] = useState(userProfile?.displayName || '');
  const [formWhatsapp, setFormWhatsapp] = useState(userProfile?.whatsapp || '');
  const [formEmail, setFormEmail] = useState(userProfile?.email || '');
  const [formTreatment, setFormTreatment] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formRoom, setFormRoom] = useState("Ruangan 1");
  const [formTherapist, setFormTherapist] = useState("any");

  // Review Modal States
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [operatingHours, setOperatingHours] = useState("09:00 - 21:00 WIB (Senin - Minggu)");

  useEffect(() => {
    async function loadOperating() {
      try {
        const branchesData = await fetchBranches();
        if (branchesData && branchesData.length > 0) {
          setOperatingHours(branchesData[0].operatingHours || "09:00 - 21:00 WIB (Senin - Minggu)");
        }
      } catch (e) {
        console.error("Gagal memuat jam operasional kustom:", e);
      }
    }
    loadOperating();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Helper: map a treatment's name to category for automated flows
  const getCategoryOfTreatment = (name: string): 'hair' | 'face' | 'body' | 'spa' => {
    const l = name.toLowerCase();
    if (l.includes("hair") || l.includes("creambath") || l.includes("rambut") || l.includes("silk") || l.includes("ginseng") || l.includes("scalp")) {
      return "hair";
    }
    if (l.includes("facial") || l.includes("face") || l.includes("wajah") || l.includes("aura") || l.includes("eyelash")) {
      return "face";
    }
    if (l.includes("stone") || l.includes("aromatherapy") || l.includes("atsiri")) {
      return "spa";
    }
    return "body";
  };

  // Helper to map category/treatment to corresponding room automatically
  const autoAssignRoom = (treatmentName: string) => {
    const cat = getCategoryOfTreatment(treatmentName);
    if (cat === 'hair') return "Ruangan 2"; // Rose Cabin
    if (cat === 'face') return "Ruangan 4"; // Sakura Sanctum
    if (cat === 'spa') return "Ruangan 3";  // Orchid Chamber
    return "Ruangan 1";                     // Jasmine Suite
  };

  // Load static treatments once
  useEffect(() => {
    async function loadTreatmentsAndReviews() {
      try {
        const tData = await fetchTreatments();
        setTreatments(tData);

        const rData = await fetchReviews();
        setReviewsList(rData);

        const pData = await fetchPromos();
        setPromos(pData);
      } catch (err) {
        console.error("Gagal memuat katalog Alisya Beauty:", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadTreatmentsAndReviews();
  }, []);

  // Handle preselected treatment trigger from Home Page banner
  useEffect(() => {
    if (preselectedTreatment && treatments.length > 0) {
      const selectedT = treatments.find(t => t.name === preselectedTreatment);
      if (selectedT) {
        setFormTreatment(selectedT.name);
        const cat = getCategoryOfTreatment(selectedT.name);
        setSelectedCategory(cat);
        const assignedRoom = autoAssignRoom(selectedT.name);
        setFormRoom(assignedRoom);
        
        // Advance to Step 3 (Jadwal)
        setCurrentStep(3);
        onShowToast(`✨ Memulai booking langsung untuk "${selectedT.name}". Silakan tentukan tanggal & waktu!`, "info");
      }
      clearPreselectedTreatment();
    }
  }, [preselectedTreatment, treatments]);

  // Load preselected promotion if available
  useEffect(() => {
    if (preselectedPromoId && promos.length > 0) {
      const matched = promos.find(p => p.id === preselectedPromoId);
      if (matched) {
        setActivePromo(matched);
        onShowToast(`🎟️ Promo "${matched.title}" berhasil dialokasikan!`, "success");
      }
      if (clearPreselectedPromoId) {
        clearPreselectedPromoId();
      }
    }
  }, [preselectedPromoId, promos]);

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

  // Real-time subscribe to all bookings to prevent timeslot double bookings
  useEffect(() => {
    if (!userProfile) {
      setAllBookings([]);
      return;
    }
    const unsubscribeAll = subscribeAllBookings((data) => {
      setAllBookings(data);
    });
    return () => {
      unsubscribeAll();
    };
  }, [userProfile]);

  const isSlotBooked = (time: string) => {
    if (!formDate) return false;
    return allBookings.some((b) => {
      const bDate = b.bookingDate || b.date;
      const bTime = b.bookingTime || b.time;
      const bRoom = b.room || "Ruangan 1";
      const isSameDate = bDate === formDate;
      const isSameTime = bTime === time;
      const isSameRoom = bRoom === formRoom;
      const isNotCancelled = b.status !== 'cancelled';
      return isSameDate && isSameTime && isSameRoom && isNotCancelled;
    });
  };

  const calculateDiscount = (treatmentName: string, promo: Promo | null): { discountAmount: number; finalPrice: number; originalPrice: number } => {
    const selectedT = treatments.find(t => t.name === treatmentName);
    if (!selectedT) return { discountAmount: 0, finalPrice: 0, originalPrice: 0 };
    
    const originalPrice = Number(selectedT.price) || 0;
    if (!promo) return { discountAmount: 0, finalPrice: originalPrice, originalPrice };

    let discountAmount = 0;
    const cleanValue = promo.discountValue.toLowerCase();

    if (cleanValue.includes("diskon 40%") || cleanValue.includes("40%")) {
      discountAmount = originalPrice * 0.40;
    } else if (cleanValue.includes("hemat 25%") || cleanValue.includes("25%")) {
      discountAmount = originalPrice * 0.25;
    } else if (cleanValue.includes("potongan 15%") || cleanValue.includes("15%")) {
      discountAmount = originalPrice * 0.15;
    } else if (cleanValue.includes("35.000") || cleanValue.includes("35000")) {
      discountAmount = 35000;
    } else if (cleanValue.includes("%")) {
      const match = cleanValue.match(/(\d+)%/);
      if (match) {
        const percent = parseInt(match[1]);
        discountAmount = originalPrice * (percent / 100);
      }
    } else {
      const match = cleanValue.match(/([\d\.]+)/);
      if (match) {
        const val = parseInt(match[1].replace(/\./g, ''));
        discountAmount = val;
      }
    }

    if (discountAmount > originalPrice) {
      discountAmount = originalPrice;
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);
    return { discountAmount, finalPrice, originalPrice };
  };

  const handleCreateBookingSubmit = async () => {
    if (!userProfile) {
      onShowToast("Silakan login terlebih dahulu untuk membuat booking.", "error");
      return;
    }
    if (!formName.trim()) {
      onShowToast("Nama wajib diisi di langkah 1.", "error");
      setCurrentStep(1);
      return;
    }
    if (!formWhatsapp.trim()) {
      onShowToast("Nomor WhatsApp wajib diisi di langkah 1.", "error");
      setCurrentStep(1);
      return;
    }
    if (!formTreatment) {
      onShowToast("Pilih jenis layanan terlebih dahulu di langkah 2.", "error");
      setCurrentStep(2);
      return;
    }
    if (!formDate) {
      onShowToast("Pilih tanggal di langkah 3.", "error");
      setCurrentStep(3);
      return;
    }
    if (!formTime) {
      onShowToast("Pilih slot jam ketersediaan di langkah 3.", "error");
      setCurrentStep(3);
      return;
    }

    if (isSlotBooked(formTime)) {
      onShowToast(`Slot ${formTime} di ${formRoom} sudah penuh. Silakan pilih jam lain!`, "error");
      setCurrentStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const pricingInfo = calculateDiscount(formTreatment, activePromo);
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
        bookingTime: formTime,
        room: formRoom,
        therapist: formTherapist,
        appliedPromoId: activePromo?.id || undefined,
        appliedPromoTitle: activePromo?.title || undefined,
        originalPrice: pricingInfo.originalPrice,
        discountAmount: pricingInfo.discountAmount,
        finalPrice: pricingInfo.finalPrice
      });

      if (isSuccess) {
        onShowToast("🌸 Reservasi Eksklusif Anda Berhasil Didaftarkan!", "success");

        const selectedTherapistName = THERAPISTS.find(t => t.id === formTherapist)?.name || "Recommended Expert";
        const pricingText = activePromo 
          ? `${formTreatment}\nPromo Terpakai: ${activePromo.title} (${activePromo.discountValue})\nHarga Normal: Rp ${pricingInfo.originalPrice.toLocaleString('id-ID')}\nPotongan Diskon: -Rp ${pricingInfo.discountAmount.toLocaleString('id-ID')}\nTotal Bayar Akhir: Rp ${pricingInfo.finalPrice.toLocaleString('id-ID')}`
          : `${formTreatment}\nHarga: Rp ${pricingInfo.originalPrice.toLocaleString('id-ID')}`;

        // Format and send WhatsApp admin message
        const waMessageText = `🌸 RESERVASI BARU ALISYA LUXURY SPA 🌸

Nama Tamu:
${formName}

WhatsApp:
${formWhatsapp}

E-mail:
${formEmail || '-'}

Layanan & Potongan:
${pricingText}

Kamar Perawatan:
${formRoom} (${ROOMS.find(r => r.id === formRoom)?.name || ''})

Terapis Shaliha:
${selectedTherapistName}

Tanggal Kunjungan:
${formDate}

Waktu Kedatangan:
${formTime} WIB

Catatan Khusus:
${formNotes || '-'}

Status:
PROSES SEKAT PRIVASI DAN REKOMENDASI TERAPIS

Nomor Admin Alisya:
+62 812-3456-789`;

        // Direct next steps
        setCurrentStep(6); // Show absolute success milestone
        
        // Clear forms
        setFormTreatment("");
        setFormDate("");
        setFormTime("");
        setFormNotes("");
        setActivePromo(null);
        setFormTherapist("any");

        const adminWhatsappNumber = "628123456789";
        const trimmedNumber = adminWhatsappNumber.replace(/\D/g, "");
        const waURL = `https://api.whatsapp.com/send?phone=${trimmedNumber}&text=${encodeURIComponent(waMessageText)}`;
        
        onShowToast("Mengalihkan ke WhatsApp Admin...", "info");
        setTimeout(() => {
          window.open(waURL, '_blank');
        }, 1300);

      } else {
        onShowToast("Sistem gagal mengirim. Silakan hubungi kami.", "error");
      }
    } catch (e: any) {
      onShowToast(e?.message || "Gagal memproses pendaftaran.", "error");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan Reservasi ini?")) {
      try {
        const success = await removeBooking(id);
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

  // Filter Bookings List
  const filteredBookings = myBookings.filter((b) => {
    const s = getMappedStatus(b.status);
    if (statusFilter === 'all') return true;
    return s === statusFilter;
  });

  // Calculate dynamic 14 days starting from today
  const getNext14Days = () => {
    const list = [];
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short' };
    const monthOptions: Intl.DateTimeFormatOptions = { month: 'short' };
    
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      list.push({
        dateString,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('id-ID', dateOptions),
        monthName: d.toLocaleDateString('id-ID', monthOptions)
      });
    }
    return list;
  };

  const fourteenDays = getNext14Days();

  // Validate current step fields before going next
  const canGoNext = () => {
    if (currentStep === 1) {
      return formName.trim().length > 0 && formWhatsapp.trim().length > 0;
    }
    if (currentStep === 2) {
      return !!formTreatment;
    }
    if (currentStep === 3) {
      return !!formDate && !!formTime;
    }
    if (currentStep === 4) {
      return !!formRoom;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!canGoNext()) {
      if (currentStep === 1) onShowToast("Harap lengkapi Nama & Nomor WhatsApp Anda.", "error");
      if (currentStep === 2) onShowToast("Harap pilih salah satu layanan treatment kecantikan.", "error");
      if (currentStep === 3) {
        if (!formDate) {
          onShowToast("Harap tentukan tanggal kunjungan Anda.", "error");
        } else {
          onShowToast("Harap tentukan jam kedatangan Anda.", "error");
        }
      }
      return;
    }
    setCurrentStep(prev => Math.min(5, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Human descriptive step titles
  const stepTitles: Record<number, { title: string; desc: string }> = {
    1: { title: "Data Diri", desc: "Silakan lengkapi informasi kontak Anda" },
    2: { title: "Pilih Layanan", desc: "Pilih kategori dan treatment kecantikan muslimah" },
    3: { title: "Jadwal & Terapis", desc: "Tentukan tanggal, jam kunjungan, dan terapis ahli" },
    4: { title: "Bilik & Voucher", desc: "Alokasi bilik privat syar'i dan kupon promo diskon" },
    5: { title: "Konfirmasi Tiket", desc: "Tinjau detail keseluruhan tiket sebelum mendaftar" },
    6: { title: "Reservasi Selesai", desc: "Reservasi Anda berhasil terdaftar" }
  };

  // Helper to check if salon is open
  const openStatus = getIsOpenStatus(operatingHours);

  // Filter treatments under chosen category
  const filteredTreatmentsByCategory = treatments.filter(t => {
    const cat = getCategoryOfTreatment(t.name);
    return cat === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-20 text-[#2B2927] min-h-screen bg-[#F8F6F2] p-2 md:p-6 rounded-3xl border border-[#EBE7DF] shadow-sm relative overflow-hidden font-sans">
      
      {/* Elegance visual elements */}
      <div className="absolute top-[-150px] left-[-150px] w-96 h-96 rounded-full bg-[#A98436]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-[#A98436]/5 blur-3xl pointer-events-none" />

      <div className="max-w-[450px] mx-auto space-y-5 relative z-10 text-left font-sans">
          
          {/* HEADER CARD - only shown for input steps 1 to 5 */}
          {currentStep <= 5 && (
            <div className="flex items-center gap-3 font-sans px-1 select-none">
              <span className="text-[11px] font-extrabold text-[#B78B36] font-mono shrink-0 bg-[#B78B36]/10 px-2.5 py-1 rounded-lg">
                {currentStep}/5
              </span>
              <div className="flex-1 h-1.5 bg-[#ECE8E1] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${currentStep * 20}%`,
                    background: 'linear-gradient(90deg, #C79A43, #E6C780)'
                  }}
                />
              </div>
            </div>
          )}

          {/* ACTIVE STEP CARD */}
          <div className="bg-white rounded-[22px] p-5 border border-[#ECE8E1] shadow-xs text-left">
            <div className="text-[12px] tracking-[1.2px] uppercase text-[#9A8E84] font-bold mb-4 font-sans select-none border-b border-stone-100 pb-2">
              {currentStep === 1 && "DETAIL RESERVASI"}
              {currentStep === 2 && "KATEGORI & LAYANAN"}
              {currentStep === 3 && "WAKTU & TERAPIS AHLI"}
              {currentStep === 4 && "BILIK PRIVASI & PROMO"}
              {currentStep === 5 && "TINJAU TIKET CHECKOUT"}
              {currentStep === 6 && "STATUS PENDAFTARAN"}
            </div>

            {/* STEP 1: Customer Details */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in text-left font-sans">
                {userProfile ? null : (
                  <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl text-[11px] text-rose-800 flex items-start gap-2 leading-relaxed">
                    <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
                    <p><strong>Perhatian:</strong> Anda sedang mengisi formulir sebagai tamu. Kami sarankan Anda masuk/login terlebih dahulu.</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#2E2E2E] block">Nama Lengkap</label>
                    <input 
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full bg-[#FCFAF7] border border-[#ECE8E1] focus:border-[#C79A43] focus:bg-white text-[#211F1D] rounded-2xl py-3.5 px-4 text-[14px] outline-none transition-all placeholder:text-stone-400 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#2E2E2E] block">Nomor WhatsApp</label>
                    <input 
                      type="tel"
                      required
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full bg-[#FCFAF7] border border-[#ECE8E1] focus:border-[#C79A43] focus:bg-white text-[#211F1D] rounded-2xl py-3.5 px-4 text-[14px] outline-none transition-all placeholder:text-stone-400 font-mono font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#2E2E2E] block">Alamat Email (Opsional)</label>
                    <input 
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="Masukkan email (opsional)"
                      className="w-full bg-[#FCFAF7] border border-[#ECE8E1] focus:border-[#C79A43] focus:bg-white text-[#211F1D] rounded-2xl py-3.5 px-4 text-[14px] outline-none transition-all placeholder:text-stone-400 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Category & Treatment Selection */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in text-left">
                {/* Category Pills Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-[#8C8681] uppercase block tracking-wider">KATEGORI PERAWATAN</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "hair", name: "Hair Care", icon: "🌹" },
                      { id: "face", name: "Face Beauty", icon: "✨" },
                      { id: "body", name: "Body Spa", icon: "🪷" },
                      { id: "spa", name: "Wellness Spa", icon: "🌸" }
                    ].map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id as any);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 select-none font-bold text-[12px] ${
                            isSelected
                              ? "bg-[#FFF8ED] border-[#C79A43] text-[#B78B36] font-extrabold shadow-3xs"
                              : "bg-white border-[#ECE8E1] text-[#7B7B7B] hover:bg-[#FCFAF7]"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Treatment Grid of Active Category */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-[#8B8178]">
                    <span>PILIH TREATMENT LAYANAN:</span>
                    <span className="font-mono text-[10px] font-bold text-[#B78B36]">Kategori: {selectedCategory.toUpperCase()}</span>
                  </div>

                  {filteredTreatmentsByCategory.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-[#ECE8E1] rounded-2xl bg-[#FCFAF7]">
                      <p className="text-xs font-bold text-stone-500">Belum ada layanan di kategori ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {filteredTreatmentsByCategory.map((t) => {
                        const isSelected = formTreatment === t.name;
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => {
                              setFormTreatment(t.name);
                              const assignedRoom = autoAssignRoom(t.name);
                              setFormRoom(assignedRoom);
                              onShowToast(`Layanan terpilih: "${t.name}"`, "success");
                            }}
                            className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                              isSelected
                                ? "bg-[#FCFAF7] border-[#C79A43] ring-1 ring-[#C79A43]/10 shadow-3xs"
                                : "bg-white border-[#ECE8E1] hover:border-[#C79A43]/50"
                            }`}
                          >
                            <div className="space-y-1 text-left flex-1 min-w-0">
                              <h4 className="font-serif font-black text-[13.5px] text-[#211F1D] truncate flex items-center gap-1.5">
                                {isSelected && <span className="text-[#B78B36]">✓</span>}
                                {t.name}
                              </h4>
                              <p className="text-[10.5px] text-[#7B7B7B] leading-relaxed line-clamp-2 font-light">{t.description}</p>
                              <span className="inline-block text-[9.5px] font-mono text-[#8B8178] font-bold bg-stone-100 px-1.5 py-0.5 rounded">⏱ {t.duration || 60} Menit</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10.5px] font-mono font-black text-[#B78B36] bg-[#FFF8ED] px-2 py-1 rounded-lg border border-[#F4DFC2]">
                                Rp {Number(t.price).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Jadwal & Terapis */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in text-left">
                
                {/* 1. Date selector slider */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-[#8C8681] uppercase block tracking-wider">TANGGAL KUNJUNGAN</label>
                  <div className="grid grid-cols-4 gap-2">
                    {fourteenDays.slice(0, 8).map((dayItem) => {
                      const isSelected = formDate === dayItem.dateString;
                      return (
                        <button
                          type="button"
                          key={dayItem.dateString}
                          onClick={() => {
                            setFormDate(dayItem.dateString);
                            setFormTime(""); // reset slot to force selection
                          }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer select-none active:scale-95 flex flex-col justify-center items-center h-[64px] ${
                            isSelected
                              ? "bg-[#B78B36] text-white border-[#B78B36] shadow-sm font-bold scale-[1.02]"
                              : "bg-white border-[#ECE8E1] hover:border-[#C79A43]/50 text-stone-700"
                          }`}
                        >
                          <span className={`text-[7.5px] uppercase tracking-wider ${isSelected ? "text-amber-100 font-bold" : "text-[#8B8178]"}`}>
                            {dayItem.dayName}
                          </span>
                          <span className="text-[13px] font-mono font-black py-0.2">
                            {dayItem.dayNum}
                          </span>
                          <span className={`text-[8px] ${isSelected ? "text-amber-100 font-medium" : "text-[#8B8178]"}`}>
                            {dayItem.monthName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#ECE8E1] pt-2 text-[10.5px]">
                    <span className="text-[#8B8178] uppercase font-semibold">Atau ketik tanggal khusus:</span>
                    <input 
                      type="date"
                      min={today}
                      value={formDate}
                      onChange={(e) => {
                        setFormDate(e.target.value);
                        setFormTime("");
                      }}
                      className="bg-white border border-[#DDD] rounded-xl py-1 px-2 text-[11px] font-bold font-mono focus:border-[#C79A43]"
                    />
                  </div>
                </div>

                {/* 2. Timeslots selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-extrabold text-[#8C8681] uppercase block tracking-wider">JAM KEDATANGAN</label>
                  {!formDate ? (
                    <div className="p-3 text-center border border-dashed border-[#ECE8E1] rounded-xl text-[11px] text-[#8B8178] bg-[#FCFAF7]">
                      Silakan pilih Tanggal terlebih dahulu untuk memuat slot jam ketersediaan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => {
                        const isBooked = isSlotBooked(time);
                        const isSelected = formTime === time;
                        return (
                          <button
                            type="button"
                            disabled={isBooked}
                            key={time}
                            onClick={() => {
                              setFormTime(time);
                            }}
                            className={`py-2 rounded-xl border cursor-pointer text-center select-none transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                              isBooked
                                ? "bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed opacity-50"
                                : isSelected
                                ? "bg-[#B78B36] text-white border-[#B78B36] shadow-sm font-extrabold"
                                : "bg-white text-stone-700 border-[#ECE8E1] hover:border-[#C79A43]"
                            }`}
                          >
                            <span className="font-mono text-xs font-black">{time}</span>
                            <span className={`text-[8px] font-black uppercase inline-block leading-none rounded-md px-1 py-0.2 ${
                              isBooked 
                                ? "bg-rose-50 text-rose-300" 
                                : isSelected 
                                ? "bg-white/25 text-amber-100" 
                                : "bg-emerald-50 text-emerald-800"
                            }`}>
                              {isBooked ? "Penuh" : isSelected ? "✓ Dipilih" : "Sedia"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Therapist selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-extrabold text-[#8C8681] uppercase block tracking-wider">TERAPIS SHALIHA</label>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {THERAPISTS.map((therapist) => {
                      const isSelected = formTherapist === therapist.id;
                      return (
                        <button
                          type="button"
                          key={therapist.id}
                          onClick={() => {
                            setFormTherapist(therapist.id);
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 select-none ${
                            isSelected
                              ? "bg-[#FCFAF7] border-[#C79A43] ring-1 ring-[#C79A43]/10"
                              : "bg-white border-[#ECE8E1] hover:border-[#C79A43]/45"
                          }`}
                        >
                          <img 
                            src={therapist.avatar} 
                            alt={therapist.name} 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg bg-stone-50 border border-[#ECE8E1] shrink-0 object-contain shadow-3xs"
                          />
                          <div className="space-y-0.5 flex-1 min-w-0 text-left font-sans">
                            <div className="flex items-center justify-between gap-1 w-full">
                              <h4 className="font-serif font-extrabold text-[12px] text-[#211F1D] truncate leading-none">{therapist.name}</h4>
                              <span className="text-[9px] text-[#B78B36] font-mono font-bold shrink-0 leading-none">★ {therapist.rating}</span>
                            </div>
                            <p className="text-[9px] text-[#7B7B7B] leading-none truncate">{therapist.role}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* STEP 4: Rooms & Promos */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in text-left">
                
                {/* A. Assigned Room Panel with trust guidelines */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-[#8C8681] uppercase block tracking-wider">BILIK PRIVAT MUSLIMAH</label>
                  {(() => {
                    const matchedRoom = ROOMS.find(r => r.id === formRoom) || ROOMS[0];
                    return (
                      <div className="border border-[#F4DFC2] bg-[#FFF8ED]/80 rounded-[20px] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md px-2 py-0.5 uppercase tracking-wide font-bold">
                            Alokasi Bilik Otomatis
                          </span>
                          <span className="text-base">{matchedRoom.icon}</span>
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-serif font-black text-[14px] text-[#2E2E2E]">{matchedRoom.name}</h3>
                          <p className="text-[#6B5A3B] text-[10.5px] leading-relaxed italic">{matchedRoom.special}</p>
                        </div>

                        <div className="bg-white/90 border border-[#ECE8E1] rounded-xl p-3 flex items-start gap-2">
                          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-[#7B7B7B] leading-relaxed">
                            Bilik 100% tertutup tirai sekat mutlak tebal, bebas kamera, steril harian, dan aman penuh demi melindungi aurat muslimah.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Switch room picker */}
                  <div className="space-y-1 pt-1">
                    <span className="font-bold text-[#8C8681] text-[10px] uppercase block tracking-wider">Ubah Pilihan Bilik:</span>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      {ROOMS.map((r) => {
                        const isAssigned = formRoom === r.id;
                        return (
                          <button
                            type="button"
                            key={r.id}
                            onClick={() => {
                              setFormRoom(r.id);
                              onShowToast(`Kamar beralih ke "${r.name}"`, "info");
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                              isAssigned
                                ? "bg-[#FFF8ED] border-[#C79A43] font-bold text-[#B78B36]"
                                : "bg-white border-[#ECE8E1] hover:border-stone-300 text-stone-600"
                            }`}
                          >
                            <span>{r.icon}</span> <span className="truncate">{r.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* B. Vouchers selection list */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-extrabold text-[#8C8681] uppercase block tracking-wider">VOUCHER PROMO AKTIF</label>
                    {activePromo && (
                      <button type="button" onClick={() => { setActivePromo(null); }} className="text-rose-600 font-bold hover:underline text-[10px]">Lepas Kupon</button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {promos.map((p) => {
                      const isSelected = activePromo?.id === p.id;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setActivePromo(p);
                            onShowToast(`🎟️ Voucher "${p.title}" terpasang!`, "success");
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col select-none ${
                            isSelected
                              ? "bg-[#FCFAF7] border-[#C79A43] shadow-3xs"
                              : "bg-white border-[#ECE8E1] hover:border-stone-300"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full gap-2">
                            <h4 className="font-serif font-extrabold text-[12px] text-stone-900 truncate leading-none">{p.title}</h4>
                            <span className="shrink-0 text-[8px] font-black px-1.5 py-0.5 bg-amber-50 text-[#B78B36] border border-[#F4DFC2] rounded font-mono uppercase">
                              {p.discountValue}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-stone-500 leading-snug line-clamp-1 mt-1 font-light">{p.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* C. Optional Notes */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-extrabold text-[#8C8681] uppercase block tracking-wider">CATATAN KHUSUS (OPSIONAL)</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contoh: memiliki riwayat ketombe, alergi rempah, minta dipijat perlahan, dll..."
                    className="w-full bg-[#FCFAF7] border border-[#ECE8E1] focus:border-[#C79A43] focus:bg-white text-[#211F1D] rounded-xl py-2 px-3 text-[12px] outline-none transition-all placeholder:text-stone-400 font-sans"
                  />
                </div>

              </div>
            )}

            {/* STEP 5: Ticket Summary Checkout */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in text-left">
                <p className="text-[11.5px] text-[#7B7B7B] leading-relaxed">Harap tinjau detail tiket reservasi Anda sebelum mendaftarkan jadwal:</p>

                <div className="border border-[#F4DFC2] bg-[#FCFAF7] rounded-[20px] overflow-hidden text-[12px] space-y-3.5 p-4 relative font-sans shadow-3xs">
                  <div className="flex justify-between items-center border-b border-dashed border-[#ECE8E1] pb-3">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[9px] text-[#B78B36] font-extrabold block uppercase font-serif tracking-wider leading-none">Alisya Muslimah Spa</span>
                      <span className="text-[13px] font-black text-stone-900 uppercase">TIKET KUNJUNGAN PRIVAT</span>
                    </div>
                    <span className="text-xl">🌸</span>
                  </div>

                  <div className="space-y-2.5 pb-2 border-b border-[#ECE8E1]">
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-[9px] text-stone-400 block uppercase tracking-wider font-semibold">Nama Tamu</span>
                        <span className="font-extrabold text-stone-900 truncate block max-w-[150px]">{formName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 block uppercase tracking-wider font-semibold">Nomor WhatsApp</span>
                        <span className="font-extrabold text-stone-900 font-mono">{formWhatsapp}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-stone-400 block uppercase tracking-wider font-semibold">Layanan Treatment</span>
                        <span className="font-black text-[#B78B36] font-serif block truncate">{formTreatment}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 block uppercase tracking-wider font-semibold">Bilik Syar'i</span>
                        <span className="font-extrabold text-stone-900 truncate block">{ROOMS.find(r => r.id === formRoom)?.name || formRoom}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 block uppercase tracking-wider font-semibold">Tanggal & Jam</span>
                        <span className="font-extrabold text-stone-900 font-mono text-[10.5px] block truncate">{formDate} • {formTime} WIB</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 block uppercase tracking-wider font-semibold">Terapis Shaliha</span>
                        <span className="font-extrabold text-stone-900 font-serif block truncate">{THERAPISTS.find(t => t.id === formTherapist)?.name || "Recommended Expert"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing summaries block */}
                  {(() => {
                    const calcs = calculateDiscount(formTreatment, activePromo);
                    return (
                      <div className="space-y-1.5 text-[11.5px] pt-1">
                        <div className="flex justify-between text-stone-500">
                          <span>Biaya Normal:</span>
                          <span className="font-mono font-bold">Rp {calcs.originalPrice.toLocaleString('id-ID')}</span>
                        </div>
                        {activePromo && (
                          <div className="flex justify-between text-rose-600 font-bold">
                            <span>Kupon Promo ({activePromo.title}):</span>
                            <span className="font-mono">-Rp {calcs.discountAmount.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-stone-950 font-bold border-t border-dashed border-[#ECE8E1] pt-2 mt-1">
                          <span className="font-serif text-[11px] uppercase tracking-wide">Net Bayar di Kasir:</span>
                          <span className="font-mono text-[14.5px] text-[#B78B36] font-black">
                            Rp {calcs.finalPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-3 bg-[#FFF8ED] border border-[#F4DFC2] rounded-xl text-[10px] text-[#6B5A3B] leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#B78B36] shrink-0 mt-0.5" />
                  <p>
                    <strong>Metode Pembayaran:</strong> Pembayaran dilakukan langsung di meja kasir setelah Anda selesai menikmati perawatan (Bayar Belakangan). Mohon hadir 10 menit lebih awal untuk persiapan.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 6: Successful Screen */}
            {currentStep === 6 && (
              <div className="space-y-5 py-4 animate-fade-in text-center font-sans">
                <div className="w-14 h-14 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-black text-base text-[#2E2E2E]">Reservasi Terdaftar!</h3>
                  <p className="text-[11.5px] text-[#7B7B7B]">Kami mendaftarkan jadwal Anda ke server Alisya.</p>
                </div>

                <div className="p-4 bg-[#FFF8ED] border border-[#F4DFC2] rounded-2xl text-left text-[11px] space-y-1.5 leading-relaxed text-[#6B5A3B]">
                  <p className="font-bold uppercase font-serif tracking-wider">Langkah Selanjutnya:</p>
                  <ul className="list-disc pl-3.5 space-y-1 text-[#6B5A3B]/90 font-semibold">
                    <li>Kami telah mengalihkan browser Anda ke tab baru <strong>WhatsApp Admin Alisya</strong> untuk mempermudah koordinasi kedatangan.</li>
                    <li>Jika terblokir pop-up blocker, silakan hubungi admin Alisya di nomor WhatsApp <strong>+62 812-3456-789</strong>.</li>
                    <li>Anda bisa pantau status konfirmasi bilik syar'i kapan saja di halaman <strong>Riwayat</strong>.</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                    }}
                    className="flex-1 py-2.5 bg-white border border-[#ECE8E1] text-[#7B7B7B] font-bold text-[11.5px] rounded-xl cursor-pointer active:scale-95 transition-all hover:bg-stone-50"
                  >
                    Booking Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('profile');
                      }
                      setCurrentStep(1);
                    }}
                    className="flex-1 py-2.5 bg-[#B78B36] text-white font-extrabold text-[11.5px] rounded-xl cursor-pointer active:scale-95 transition-all shadow-3xs hover:bg-[#A3792E]"
                  >
                    Riwayat di Profil
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* DYNAMIC ESTIMATED SUMMARY PRE-TICKET - only shown for steps 3 & 4 before checkout */}
          {currentStep >= 3 && currentStep <= 4 && (
            <div className="bg-white rounded-[22px] p-4.5 border border-[#ECE8E1] text-left font-sans shadow-3xs animate-fade-in">
              <div className="text-[11px] tracking-[1px] uppercase text-[#9A8E84] font-bold mb-2">
                ESTIMASI RINGKASAN
              </div>
              <div className="space-y-1 text-[12.5px] text-stone-700">
                <p className="flex justify-between items-start">
                  <span className="text-[#8B8178]">Treatment:</span>
                  <span className="font-extrabold text-[#2E2E2E] text-right font-serif max-w-[240px] truncate">{formTreatment || "-"}</span>
                </p>
                {formTreatment && (
                  <>
                    <p className="flex justify-between items-center">
                      <span className="text-[#8B8178]">Durasi:</span>
                      <span className="font-bold text-stone-800 font-mono">
                        {(() => {
                          const matched = treatments.find(t => t.name === formTreatment);
                          return matched ? `${matched.duration || 60} Menit` : "60 Menit";
                        })()}
                      </span>
                    </p>
                    <p className="flex justify-between items-center border-t border-stone-100 pt-1 mt-1 font-bold text-[#B78B36]">
                      <span className="text-[#8B8178] font-normal">Estimasi Total:</span>
                      <span className="font-black font-mono">
                        {(() => {
                          const info = calculateDiscount(formTreatment, activePromo);
                          return `Rp ${info.finalPrice.toLocaleString('id-ID')}`;
                        })()}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM MAIN BUTTONS CONTROLLERS */}
          {currentStep <= 5 && (
            <div className="space-y-3 pt-1 select-none">
              {currentStep === 5 ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCreateBookingSubmit}
                  className="w-full py-[16px] bg-[#B78B36] text-white text-[15px] font-semibold border-none rounded-[18px] cursor-pointer transition-all hover:bg-[#A3792E] active:scale-95 flex items-center justify-center gap-2 shadow-sm uppercase font-sans tracking-wider"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-1" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Konfirmasi & Chat Admin <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-[16px] bg-[#B78B36] text-white text-[15px] font-semibold border-none rounded-[18px] cursor-pointer transition-all hover:bg-[#A3792E] active:scale-95 flex items-center justify-center gap-2 shadow-sm uppercase font-sans tracking-wider"
                >
                  Lanjutkan <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Prev back button */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full py-[14px] bg-white border border-[#ECE8E1] text-[#736E6A] text-[13px] font-semibold rounded-[18px] cursor-pointer transition-all hover:bg-stone-50 active:scale-95 flex items-center justify-center gap-1 uppercase tracking-wide"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              )}
            </div>
          )}

        </div>

      {/* ======================================================== */}
      {/* LUXURY RATING REVIEW COMPOSER MODAL (Glassmorphic) */}
      {/* ======================================================== */}
      {activeReviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form 
            onSubmit={handleSubmitReview}
            className="bg-white rounded-[32px] border border-[#EBE7DF] max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in-up text-left my-auto relative"
          >
            {/* Top Close */}
            <button 
              type="button"
              onClick={() => setActiveReviewBooking(null)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 bg-[#FCFAF7] p-1.5 rounded-full cursor-pointer transiton-colors border border-stone-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-stone-900 select-none font-sans">
              <Star className="w-5 h-5 text-gold-500 fill-current" />
              <div>
                <h3 className="font-serif font-black text-xs md:text-sm tracking-wide">Beri Ulasan Suara Shaliha</h3>
                <p className="text-[9.5px] text-[#736E6A]">Layanan: {activeReviewBooking.treatment || activeReviewBooking.service}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed">
              
              {/* Rating Star Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8681] uppercase tracking-wider block">DOKUMEN RATING BINTANG</label>
                <div className="flex gap-1.5 items-center justify-center p-3 bg-[#FCFAF7] border border-[#EBE7DF] rounded-2xl">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (reviewHoverRating || reviewRating);
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform active:scale-75"
                      >
                        <Star className={`w-7 h-7 transition-colors shrink-0 ${
                          isFilled ? 'text-gold-550 fill-[#A98436]' : 'text-stone-300'
                        }`} />
                      </button>
                    );
                  })}
                  <span className="font-mono font-black text-[#A98436] text-xs ml-2">({reviewRating}/5.0)</span>
                </div>
              </div>

              {/* Comment text area */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8681] uppercase tracking-wider block">ULASAN KESAN DAN PESAN KUNJUNGAN</label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan kepuasan Anda mengenai keamanan hijab, kesopanan terapis, pijatan, uap komedo, wewangian, atau kebersihan sekat ruko..."
                  className="w-full bg-[#FCFAF7] border border-[#EBE7DF] focus:border-[#A98436] focus:bg-white text-[#211F1D] rounded-2xl py-3 px-4 outline-none transition-all placeholder:text-stone-400 leading-relaxed text-[10.5px]"
                />
              </div>

            </div>

            <div className="flex items-center gap-3 pt-2 text-xs font-sans shrink-0 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setActiveReviewBooking(null)}
                className="flex-1 py-2 bg-stone-100 font-semibold rounded-xl text-stone-550 cursor-pointer active:scale-95 transition-all text-[11px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex-1 py-2 bg-gradient-to-r from-[#A98436] to-[#D3B674] text-stone-950 font-extrabold rounded-xl cursor-pointer active:scale-95 transition-all shadow-3xs hover:opacity-90 text-[11px]"
              >
                {submittingReview ? "Mengirim..." : "Kirim Ulasan ★"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* REAL-TIME SALON BOOKING HISTORY MODAL                    */}
      {/* ======================================================== */}
      {showHistoryDirectly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-[#FAF9F6] rounded-[28px] border border-[#ECE8E1] max-w-md w-full p-5 space-y-4 shadow-xl relative text-left animate-fade-in-up duration-250 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#ECE8E1]/60 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#A98436]" />
                <h3 className="font-serif text-base font-extrabold text-stone-900 leading-none">Riwayat Reservasi</h3>
              </div>
              <button onClick={onCloseHistory} className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter segments */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/80 rounded-xl text-[10.5px] shrink-0">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f === 'active' ? 'pending' : f === 'completed' ? 'completed' : 'all')}
                  className={`py-2 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                    (f === 'all' && statusFilter === 'all') ||
                    (f === 'active' && (statusFilter === 'pending' || statusFilter === 'confirmed')) ||
                    (f === 'completed' && statusFilter === 'completed')
                      ? 'bg-white text-[#A98436] shadow-3xs'
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
                </button>
              ))}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-left">
              {(() => {
                const list = myBookings.filter((b) => {
                  const s = getMappedStatus(b.status);
                  if (statusFilter === 'all') return true;
                  if (statusFilter === 'pending' || statusFilter === 'confirmed') return s === 'pending' || s === 'confirmed';
                  if (statusFilter === 'completed') return s === 'completed';
                  return s === statusFilter;
                });

                if (list.length === 0) {
                  return (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                      <span className="text-3xl">🌸</span>
                      <p className="text-xs text-stone-400 font-medium">Tidak ada data reservasi ditemukan.</p>
                    </div>
                  );
                }

                return list.map((b) => {
                  const mappedStatus = getMappedStatus(b.status);
                  const conf = getStatusConfig(b.status);
                  const isReviewed = reviewedBookingIds.includes(b.id);

                  return (
                    <div
                      key={b.id}
                      className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-3xs space-y-3 flex flex-col relative overflow-hidden"
                    >
                      {/* Booking card header */}
                      <div className="flex justify-between items-start gap-2 text-left">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[10px] text-stone-400 font-mono font-bold uppercase block">
                            {b.bookingDate || b.date} • {b.bookingTime || b.time} WIB
                          </span>
                          <h4 className="font-serif font-black text-xs text-stone-900 leading-tight">
                            {b.treatment || b.service}
                          </h4>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8.5px] font-extrabold border shrink-0 ${conf.tint}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                          {conf.label}
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 border-t border-stone-100 text-[10px] text-stone-500 font-medium text-left">
                        <div>
                          <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Kamar</span>
                          <span className="text-stone-850 font-bold">{b.room || "Ruangan Syar'i"}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Terapis</span>
                          <span className="text-stone-850 font-bold">{b.therapist === 'any' ? 'Rekomendasi Ahli' : b.therapist || 'Rekomendasi Ahli'}</span>
                        </div>
                        {b.finalPrice !== undefined && (
                          <div className="col-span-2">
                            <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Total Pembayaran Kasir</span>
                            <span className="text-[#A98436] font-mono font-black text-xs">
                              Rp {b.finalPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Action footer */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-stone-150">
                        {/* Cancel button if active */}
                        {(mappedStatus === 'pending' || mappedStatus === 'confirmed') && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Batalkan Booking
                          </button>
                        )}

                        {/* Review button if completed */}
                        {mappedStatus === 'completed' && (
                          isReviewed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold px-3 py-1.5">
                              ✓ Ulasan Terkirim
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReviewBooking(b);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                              className="px-4 py-1.5 bg-gradient-to-r from-[#A98436] to-[#C09A4E] hover:from-[#8e6e2b] hover:to-[#a48039] text-white rounded-xl text-[10px] font-black shadow-3xs cursor-pointer flex items-center gap-1 transition-all"
                            >
                              <span>Beri Ulasan</span>
                              <span>⭐</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <button
              type="button"
              onClick={onCloseHistory}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs rounded-xl transition-colors text-center shrink-0 cursor-pointer uppercase tracking-wider"
            >
              Kembali
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Check open status based on hours
const getIsOpenStatus = (hoursStr: string): { open: boolean; text: string } => {
  try {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibDate = new Date(utcTime + (3600000 * 7));
    
    const dayOfWeek = wibDate.getDay(); 
    const currentHours = wibDate.getHours();
    const currentMinutes = wibDate.getMinutes();
    const currentTimeInMins = currentHours * 60 + currentMinutes;

    const lowerStr = hoursStr.toLowerCase();
    let operatesToday = true;
    if (lowerStr.includes("senin - jumat") || lowerStr.includes("senin-jumat")) {
      operatesToday = dayOfWeek >= 1 && dayOfWeek <= 5;
    } else if (lowerStr.includes("senin - sabtu") || lowerStr.includes("senin-sabtu")) {
      operatesToday = dayOfWeek >= 1 && dayOfWeek <= 6;
    } else if (lowerStr.includes("sabtu - minggu") || lowerStr.includes("sabtu-minggu")) {
      operatesToday = dayOfWeek === 0 || dayOfWeek === 6;
    }
    
    if (!operatesToday) {
      return { open: false, text: "Tutup Hari Ini" };
    }

    const timeRegex = /(\d{1,2})[:.](\d{2})\s*(?:-|\s+sampai\s+|s\/d)\s*(\d{1,2})[:.](\d{2})/;
    const match = hoursStr.match(timeRegex);
    if (!match) {
      const defaultStart = 9 * 60; 
      const defaultEnd = 21 * 60;  
      const open = currentTimeInMins >= defaultStart && currentTimeInMins < defaultEnd;
      return { open, text: open ? "Buka Hari Ini" : "Tutup" };
    }

    const startH = parseInt(match[1], 10);
    const startM = parseInt(match[2], 10);
    const endH = parseInt(match[3], 10);
    const endM = parseInt(match[4], 10);

    const startTimeInMins = startH * 60 + startM;
    const endTimeInMins = endH * 60 + endM;

    let open = false;
    if (endTimeInMins < startTimeInMins) {
      open = currentTimeInMins >= startTimeInMins || currentTimeInMins < endTimeInMins;
    } else {
      open = currentTimeInMins >= startTimeInMins && currentTimeInMins < endTimeInMins;
    }

    return { 
      open, 
      text: open ? "Buka • Silakan Datang" : "Tutup • Diluar Jam Operasional"
    };
  } catch (e) {
    console.error("Error checking operating hours:", e);
    return { open: true, text: "Buka Hari Ini" };
  }
};
