import React from 'react';
import { 
  Home, Scissors, CalendarCheck2, ShoppingBag, Images, User, 
  Sparkles, LogOut, ShieldCheck, PhoneCall, MapPin
} from 'lucide-react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tabId: string) => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  whatsappNum: string;
}

export default function Layout({ 
  children, 
  activeTab, 
  onNavigate, 
  userProfile, 
  onLogout,
  whatsappNum
}: LayoutProps) {
  const ADMIN_EMAIL = 'miftahilmi15@gmail.com';
  const isAdmin = userProfile?.email === ADMIN_EMAIL;

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
    { id: 'home', label: 'Home', icon: <Home className="w-4.5 h-4.5" /> },
    { id: 'gallery', label: 'Gallery', icon: <Images className="w-4.5 h-4.5" /> },
    { id: 'booking', label: 'Booking', icon: <CalendarCheck2 className="w-4.5 h-4.5" /> },
    { id: 'shop', label: 'Boutique', icon: <ShoppingBag className="w-4.5 h-4.5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4.5 h-4.5" /> }
  ];

  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      
      {/* ======================================================== */}
      {/* LUXURY TOP NAVIGATION BAR (DESKTOP & MOBILE INTEGRATION) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-stone-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Dynamic User Profile Greeting Header */}
          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shadow-sm border border-gold-400/25 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <img 
                src={userProfile?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=shaliha'} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left font-sans">
              <h1 className="text-[13px] md:text-[14.5px] font-sans font-black tracking-wide text-stone-900 leading-tight">
                Assalamualaikum, <span className="text-gold-600 font-extrabold">{userProfile?.displayName || 'User'}</span>
              </h1>
              <p className="text-[9.5px] text-stone-500 tracking-wide font-medium mt-0.5 leading-none">{getFormattedDateIndonesian()}</p>
            </div>
          </div>

          {/* Desktop Tab Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 font-sans">
            {mainNavs.map((n) => {
              const isActive = activeTab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => onNavigate(n.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-gold-500 text-[#050507] shadow-md scale-95' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <span className={isActive ? 'text-[#050507]' : 'text-gold-550'}>{n.icon}</span>
                  <span>{n.label}</span>
                </button>
              );
            })}

            {/* Special Admin Tab */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all border ${
                  activeTab === 'admin' 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md font-black' 
                    : 'text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Empty spacer or right context placeholder */}
          <div className="flex items-center gap-3">
          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTAINER CONTENT */}
      {/* ======================================================== */}
      <main className="flex-1 w-full bg-white flex flex-col items-center">
        <div className="w-full max-w-5xl px-4.5 py-6 md:py-10 md:px-8">
          {children}
        </div>
      </main>

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      {/* ======================================================== */}
      <nav id="bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-stone-100 flex items-center justify-around text-stone-500 select-none z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[safe-area-inset-bottom]">
        {mainNavs.map((n) => {
          const isActive = activeTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${
                isActive ? 'text-gold-600 font-bold' : 'hover:text-stone-800'
              }`}
            >
              <div className={`p-1 ${isActive ? 'scale-110 text-gold-600' : 'text-stone-400'}`}>
                {n.icon}
              </div>
              <span className="text-[9px] tracking-wider mt-0.5 font-bold uppercase">{n.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
