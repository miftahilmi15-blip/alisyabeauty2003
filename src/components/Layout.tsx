import React from 'react';
import { 
  Home, Scissors, CalendarCheck2, ShoppingBag, Images, User, 
  Sparkles, LogOut, ShieldCheck, PhoneCall
} from 'lucide-react';
import { UserProfile } from '../types';
import logoImg from '../assets/images/alisya_dark_logo_1780913147183.png';

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
          
          {/* Logo Brand Header */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src={logoImg} 
              alt="Alisya Beauty Logo" 
              className="w-10 h-10 rounded-full object-contain shadow-md border border-gold-500/20 p-0.5 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-base font-serif font-black tracking-wide text-stone-900 flex items-center gap-1">
                Alisya Premium <Sparkles className="w-3.5 h-3.5 text-gold-550 shrink-0" />
              </h1>
              <p className="text-[9px] text-stone-500 uppercase tracking-widest font-black leading-none">Muslimah Salon & Spa</p>
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

          {/* User Profile Info Area (Desktop Actions) */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2.5 border-l border-stone-200 pl-4">
              <img 
                src={userProfile?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=shaliha'} 
                alt="UserProfile" 
                className="w-8 h-8 rounded-full border border-stone-200"
              />
              <div className="text-left font-sans">
                <span className="text-[10px] font-black text-stone-900 block leading-none truncate max-w-[124px]">
                  {userProfile?.displayName || "Member"}
                </span>
                <span className="text-[9px] text-stone-550 block truncate mt-0.5 max-w-[124px]">
                  {userProfile?.email}
                </span>
              </div>
            </div>

            {/* General LogOut Button */}
            <button 
              onClick={onLogout}
              className="px-3.5 py-2 hover:bg-rose-50 hover:text-rose-600 text-stone-600 rounded-xl text-[10.5px] font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 uppercase font-sans border border-stone-200"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">LogOut</span>
            </button>
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
