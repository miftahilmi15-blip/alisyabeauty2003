import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Home, CalendarCheck2, ShoppingBag, Images, User, Tv,
  Sparkles, LogOut, ShieldCheck, PhoneCall, MapPin, Search,
  Bell, Award, CheckCircle2, X, ArrowLeft
} from 'lucide-react';
import { UserProfile, Booking, ShopOrder } from '../types';
import { subscribeBookings, fetchShopOrders } from '../services/dataService';
import PullToRefresh from './PullToRefresh';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tabId: string) => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  whatsappNum: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  doneBookingsCount?: number;
  activeCategory?: string;
  setActiveCategory?: (cat: string) => void;
  headerAction?: React.ReactNode;
  onOpenAlya?: () => void;
}

export default function Layout({ 
  children, 
  activeTab, 
  onNavigate, 
  userProfile, 
  onLogout,
  whatsappNum,
  searchQuery,
  onSearchChange,
  doneBookingsCount = 0,
  activeCategory,
  setActiveCategory,
  headerAction,
  onOpenAlya
}: LayoutProps) {
  const ADMIN_EMAIL = 'miftahilmi15@gmail.com';
  const isAdmin = userProfile?.email === ADMIN_EMAIL;

  const handlePullRefresh = async () => {
    // Simulating native-like background refresh/reload sequence
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Dynamic Notifications Engine
  interface LayoutNotification {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'treatment' | 'shop';
    createdAt: number;
  }

  const [notifications, setNotifications] = useState<LayoutNotification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const uid = userProfile?.uid;
    if (!uid) {
      setNotifications([]);
      setHasUnread(false);
      return;
    }

    let activeBookings: Booking[] = [];
    let activeOrders: ShopOrder[] = [];

    const handleSync = (userBookings: Booking[], userOrders: ShopOrder[]) => {
      const list: LayoutNotification[] = [];

      // 1. Process Booking Statuses (non-pending)
      userBookings
        .filter(b => b.status !== 'pending')
        .forEach(b => {
          const bookingTime = b.bookingDate ? `${b.bookingDate} pukul ${b.bookingTime || ''}` : `${b.date} pukul ${b.time || ''}`;
          let ts = Date.now();
          if (b.createdAt) {
            ts = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt.seconds ? b.createdAt.seconds * 1000 : Date.now());
          }

          let title = "🌸 Treatment Kecantikan";
          let description = `Treatment kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda saat ini berstatus ${b.status || ''}.`;

          if (b.status === 'confirmed') {
            title = "📅 Booking Dikonfirmasi";
            description = `Booking perawatan kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda telah dikonfirmasi oleh Admin. Cek jadwal Anda untuk hadir tepat waktu!`;
          } else if (b.status === 'done') {
            title = "🌸 Treatment Selesai";
            description = `Perawatan kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda telah sukses diselesaikan. Terima kasih atas kunjungannya!`;
          } else if (b.status === 'cancelled') {
            title = "❌ Booking Dibatalkan";
            description = `Booking perawatan kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda pada tanggal ${b.date || b.bookingDate || ''} telah dibatalkan. Silakan hubungi kami jika diperlukan.`;
          }

          list.push({
            id: `b_${b.id}`,
            title,
            description,
            date: bookingTime,
            type: 'treatment',
            createdAt: ts
          });
        });

      // 2. Process Shop Orders (non-pending)
      userOrders
        .filter(o => o.status !== 'pending')
        .forEach(o => {
          let ts = Date.now();
          if (o.createdAt) {
            ts = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : Date.now();
          }

          let title = "🛍️ Pesanan Butik";
          let description = `Pesanan produk butik "${o.productName}" Anda saat ini berstatus ${o.status || ''}.`;

          if (o.status === 'completed') {
            title = "🛍️ Pesanan Butik Selesai";
            description = `Pesanan produk butik "${o.productName}" Anda senilai Rp ${o.price?.toLocaleString('id-ID')} telah sukses diproses/dikirim. Terima kasih telah berbelanja!`;
          } else if (o.status === 'cancelled') {
            title = "❌ Pesanan Butik Dibatalkan";
            description = `Pesanan produk butik "${o.productName}" Anda senilai Rp ${o.price?.toLocaleString('id-ID')} telah dibatalkan karena suatu hal. Silakan hubungi admin kami untuk detailnya.`;
          }

          list.push({
            id: `o_${o.id}`,
            title,
            description,
            date: o.date || "Baru saja",
            type: 'shop',
            createdAt: ts
          });
        });

      // Sort newest first
      list.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(list);

      // Check unread
      const lastRead = Number(localStorage.getItem(`alisya_last_read_${uid}`) || "0");
      const hasNew = list.some(n => n.createdAt > lastRead);
      setHasUnread(hasNew);
    };

    const unsubBookings = subscribeBookings(uid, (userBookings) => {
      activeBookings = userBookings;
      handleSync(activeBookings, activeOrders);
    });

    const loadOrders = async () => {
      try {
        const orderData = await fetchShopOrders(uid);
        activeOrders = orderData;
        handleSync(activeBookings, activeOrders);
      } catch (e) {
        console.error("Gagal load shop orders:", e);
      }
    };

    loadOrders();
    const intv = setInterval(loadOrders, 10000);

    return () => {
      unsubBookings();
      clearInterval(intv);
    };
  }, [userProfile?.uid]);

  const handleOpenNotification = () => {
    onNavigate('notifications');
    setHasUnread(false);
    const uid = userProfile?.uid;
    if (uid) {
      localStorage.setItem(`alisya_last_read_${uid}`, String(Date.now()));
    }
  };

  const getFormattedDateIndonesian = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  const mainNavs = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5 stroke-[1.5]" /> },
    { id: 'gallery', label: 'Gallery', icon: <Images className="w-5 h-5 stroke-[1.5]" /> },
    { id: 'booking', label: 'Booking', icon: <CalendarCheck2 className="w-5 h-5 stroke-[1.5]" /> },
    { id: 'shop', label: 'Boutique', icon: <ShoppingBag className="w-5 h-5 stroke-[1.5]" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5 stroke-[1.5]" /> }
  ];

  const isHome = activeTab === 'home';

  const getSecondaryPageTitle = () => {
    switch (activeTab) {
      case 'services':
        if (activeCategory && activeCategory !== 'All') {
          if (activeCategory === 'Hair') return 'Hair Treatment';
          if (activeCategory === 'Facial') return 'Facial Treatment';
          if (activeCategory === 'Body') return 'Body Treatment';
          if (activeCategory === 'Spa') return 'Spa';
          if (activeCategory === 'Laser') return 'Pico Laser';
          if (activeCategory === 'Microbright') return 'Facial Microbright';
          return activeCategory;
        }
        return 'Menu Treatment';
      case 'gallery':
        return 'Gallery Portfolio';
      case 'live':
        return 'Alisya Live Selling';
      case 'booking':
        return 'My Booking';
      case 'shop':
        return 'Boutique';
      case 'profile':
        return 'My Profile';
      case 'admin':
        return 'Admin Dashboard';
      case 'notifications':
        return 'Kotak Masuk Notifikasi';
      case 'reviews':
        return 'Ulasan Shaliha';
      default:
        return 'Menu Treatment';
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col pb-24 md:pb-28">
      
      {/* ======================================================== */}
      {/* LUXURY ORGANIC CURVED HERO HEADER (HOME PAGE ONLY)       */}
      {/* ======================================================== */}
      {isHome ? (
        <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-[#EBE7DF]/30 select-none transition-all duration-300">
          {/* Seamless integrated Hero Section that flows naturally into the body with luxury pattern */}
          <div className="relative w-full px-5 sm:px-6 md:px-8 py-2.5 md:py-3 bg-transparent overflow-hidden text-left">
            
            {/* Ambient golden luxury blurs */}
            <div className="absolute top-[-40px] right-[-40px] w-80 h-80 rounded-full bg-[#A98436]/08 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-40px] left-[-60px] w-96 h-96 rounded-full bg-[#E7DEC8]/15 blur-3xl pointer-events-none" />
            <div className="absolute top-[30%] left-[30%] w-32 h-32 rounded-full bg-[#A98436]/03 blur-2xl pointer-events-none" />

            {/* High-End Arabesque Floral Watermark/Pattern with 2-3% opacity */}
            <div className="absolute right-[-20px] top-[-20px] w-[240px] h-[240px] md:w-[320px] md:h-[320px] opacity-[0.025] pointer-events-none select-none overflow-hidden">
              <svg viewBox="0 0 200 200" className="w-full h-full text-[#A98436]" fill="none" stroke="currentColor" strokeWidth="0.5">
                <circle cx="100" cy="100" r="90" />
                <circle cx="100" cy="100" r="70" strokeDasharray="3,3" />
                <circle cx="100" cy="100" r="50" />
                <circle cx="100" cy="100" r="30" strokeDasharray="2,2" />
                {/* Mandala floral petals */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 100 + Math.cos(angle) * 10;
                  const y1 = 100 + Math.sin(angle) * 10;
                  const x2 = 100 + Math.cos(angle) * 90;
                  const y2 = 100 + Math.sin(angle) * 90;
                  const cp1x = 100 + Math.cos(angle + 0.15) * 50;
                  const cp1y = 100 + Math.sin(angle + 0.15) * 50;
                  const cp2x = 100 + Math.cos(angle - 0.15) * 50;
                  const cp2y = 100 + Math.sin(angle - 0.15) * 50;
                  return (
                    <React.Fragment key={i}>
                      <path d={`M ${x1} ${y1} Q ${cp1x} ${cp1y} ${x2} ${y2} Q ${cp2x} ${cp2y} ${x1} ${y1}`} />
                      <circle cx={x2} cy={y2} r="1.5" fill="currentColor" />
                    </React.Fragment>
                  );
                })}
              </svg>
            </div>

            <div className="absolute left-[-40px] bottom-[-40px] w-[180px] h-[180px] opacity-[0.02] pointer-events-none select-none overflow-hidden">
              <svg viewBox="0 0 200 200" className="w-full h-full text-[#A98436]" fill="none" stroke="currentColor" strokeWidth="0.5">
                <circle cx="100" cy="100" r="80" />
                <circle cx="100" cy="100" r="60" strokeDasharray="4,4" />
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const x1 = 100 + Math.cos(angle) * 5;
                  const y1 = 100 + Math.sin(angle) * 5;
                  const x2 = 100 + Math.cos(angle) * 80;
                  const y2 = 100 + Math.sin(angle) * 80;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
                  );
                })}
              </svg>
            </div>

            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 relative z-20">
              
              {/* Left Side: User Avatar and Greeting */}
              <div className="flex items-center gap-3 text-left">
                {/* Premium circular profile image with thin white border, gold outline, and soft shadow */}
                <motion.div 
                  onClick={() => onNavigate('profile')}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center p-[1px] shadow-sm ring-[1.2px] ring-[#A98436]/40 ring-offset-1 shrink-0 overflow-hidden cursor-pointer transition-all duration-300"
                >
                  <img 
                    src={userProfile?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=shaliha'} 
                    alt="Avatar" 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
 
                {/* Hierarchy Layout */}
                <div className="flex flex-col text-left justify-center">
                  {/* Greeting & Nama User side-by-side (sejajar) */}
                  <div className="flex items-center gap-1.5 flex-wrap leading-none">
                    <span className="text-[12px] md:text-xs text-stone-500 font-medium tracking-wide">
                      Assalamualaikum,
                    </span>
                    <h1 className="text-xs md:text-sm font-serif font-black tracking-tight text-[#211F1D]">
                      {userProfile?.displayName || 'User'}
                    </h1>
                  </div>


                </div>
              </div>

              {/* Right Side: Elegant Notification Button & AI Alya Button */}
              <div className="flex items-center gap-2.5 shrink-0 self-center">
                <div className="hidden md:flex flex-col text-right font-sans">
                  <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold">Hari Ini</span>
                  <span className="text-[10px] text-[#A98436] font-black mt-0.5">{getFormattedDateIndonesian()}</span>
                </div>

                {/* Premium round notification bell */}
                <motion.button 
                  onClick={handleOpenNotification}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-[36px] h-[36px] rounded-full bg-white border border-[#EBE7DF]/85 shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center justify-center relative transition-all text-stone-700 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-[#A98436] stroke-[2]" />
                  {hasUnread && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Seamless floating search bar - Thinner & Premium */}
            {onSearchChange !== undefined && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="max-w-md mx-auto mt-3 px-1"
              >
                <div className="relative font-sans shadow-3xs rounded-full transition-all duration-300">
                  <input 
                    type="text"
                    value={searchQuery || ""}
                    onChange={(e) => {
                      onSearchChange(e.target.value);
                      if (activeTab !== 'home') {
                        onNavigate('home');
                      }
                    }}
                    placeholder="Cari treatment..."
                    className="w-full h-[36px] bg-white border border-[#EBE7DF]/80 focus:border-[#A98436]/60 hover:border-stone-300 text-stone-900 rounded-full pl-9 pr-5 text-[11px] outline-none transition-all font-medium placeholder:font-normal placeholder:text-stone-400 shadow-3xs"
                  />
                  <Search className="w-3.5 h-3.5 text-[#A98436] absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
              </motion.div>
            )}
          </div>
        </header>
      ) : activeTab === 'profile' ? null : (
        /* COMPACT TOP NAVIGATION HEADER (FOR OTHER PAGES) */
        <header className="sticky top-0 w-full z-40 bg-white/85 backdrop-blur-md border-b border-[#EBE7DF]/30 select-none px-5 py-3.5 transition-all duration-300">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3 text-left">
              {!['gallery', 'booking', 'shop'].includes(activeTab) && (
                <button 
                  onClick={() => {
                    if (setActiveCategory) {
                      setActiveCategory('All');
                    }
                    onNavigate('home');
                  }}
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-[#A98436] transition-colors cursor-pointer mr-0.5 shrink-0"
                  title="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
              
              {activeTab === 'shop' && onSearchChange !== undefined ? (
                <div className="relative w-full max-w-xs md:max-w-md font-sans shadow-3xs rounded-full transition-all duration-300">
                  <input 
                    type="text"
                    value={searchQuery || ""}
                    onChange={(e) => {
                      onSearchChange(e.target.value);
                    }}
                    placeholder="Cari produk butik..."
                    className="w-full h-[36px] bg-[#FAF8F5] border border-[#EBE7DF]/80 focus:border-[#A98436]/60 hover:border-stone-300 text-stone-900 rounded-full pl-9 pr-5 text-[11px] outline-none transition-all font-medium placeholder:font-normal placeholder:text-stone-400 shadow-3xs"
                  />
                  <Search className="w-3.5 h-3.5 text-[#A98436] absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
              ) : (
                <h1 className="text-xl md:text-2xl font-serif font-black tracking-tight text-stone-900 leading-none">
                  {getSecondaryPageTitle()}
                </h1>
              )}
            </div>

            {headerAction && (
              <div className="flex items-center shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </header>
      )}

      {/* ======================================================== */}
      {/* MAIN CONTAINER CONTENT                                   */}
      {/* ======================================================== */}
      <main className="flex-1 w-full bg-transparent flex flex-col items-center">
        <div className="w-full max-w-5xl px-4.5 py-6 md:py-10 md:px-8">
          <PullToRefresh onRefresh={handlePullRefresh}>
            {children}
          </PullToRefresh>
        </div>
      </main>

      {/* ======================================================== */}
      {/* COMPACT PREMIUM FLOATING BOTTOM NAVIGATION DOCK          */}
      {/* ======================================================== */}
      <nav 
        id="bottom-nav" 
        className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-[64px] bg-white/90 backdrop-blur-xl border border-[#EBE7DF]/60 shadow-[0_12px_40px_rgba(169,132,54,0.08)] rounded-[32px] flex items-center justify-around px-2.5 z-40 select-none"
      >
        {mainNavs.map((n) => {
          const isActive = activeTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  try { navigator.vibrate(12); } catch (_) {}
                }
                onNavigate(n.id);
              }}
              className="relative flex flex-col items-center justify-center flex-1 h-[48px] cursor-pointer transition-all duration-300 rounded-full select-none outline-none focus:outline-none animate-fade-in"
            >
              {/* Material Design 3 style sliding active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-x-1 inset-y-0.5 bg-[#A98436]/10 rounded-full border border-[#A98436]/15 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              
              <div className="flex flex-col items-center gap-0.5 relative z-10">
                <div className={`transition-all duration-300 ${isActive ? 'text-[#A98436] scale-110' : 'text-stone-400 hover:text-stone-600'}`}>
                  {React.cloneElement(n.icon as React.ReactElement, { className: `w-[19px] h-[19px] ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}` })}
                </div>
                <span className={`text-[9.5px] font-sans tracking-wide leading-none transition-all duration-300 ${
                  isActive 
                    ? 'text-[#A98436] font-extrabold' 
                    : 'text-stone-400 font-medium'
                }`}>
                  {n.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
