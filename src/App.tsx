import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Heart, HelpCircle, Loader2, Play, 
  CheckCircle, Info, Lock, ChevronRight, User, AlertTriangle 
} from 'lucide-react';
import { auth, provider } from './config/firebase';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { fetchUserProfile, updateUserWhatsapp } from './services/dataService';
import { UserProfile } from './types';

// Importing subcomposed components
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import BookingPage from './components/BookingPage';
import ShopPage from './components/ShopPage';
import GalleryPage from './components/GalleryPage';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';
import Toast from './components/Toast';
import logoImg from './assets/logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [preselectedTreatment, setPreselectedTreatment] = useState("");
  const [whatsappNum, setWhatsappNum] = useState("");

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Login input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<{ code: string; message: string; title: string; hint: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (userProfile) {
      document.body.className = 'app-page';
    } else {
      document.body.className = 'login-page';
    }
  }, [userProfile]);

  useEffect(() => {
    // 1. Check local storage for active local/demo user first
    const localUser = localStorage.getItem('alisya_local_user');
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        setUserProfile(u);
        setWhatsappNum(u.whatsapp || "");
        setLoading(false);
        return;
      } catch {
        // Continue to firebase if parse fails
      }
    }

    // 2. Firebase auth state listener
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const profile = await fetchUserProfile(fbUser.uid, {
            displayName: fbUser.displayName || 'Shaliha Member',
            email: fbUser.email || 'guest@alisyabeauty.com',
            photoURL: fbUser.photoURL
          });
          setUserProfile(profile);
          setWhatsappNum(profile.whatsapp || "");
        } else {
          setUserProfile(null);
        }
      } catch (e) {
        console.warn("Firebase Auth error:", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Standard Login via Google Popup
  const handleGoogleLogin = async () => {
    if (!auth || !provider) {
      showToast("Firebase Auth belum sepenuhnya terkonfigurasi. Gunakan Demo Mode.", "info");
      return;
    }
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, provider);
      const googleUser = res.user;
      const profile = await fetchUserProfile(googleUser.uid, {
        displayName: googleUser.displayName || 'Member Alisya',
        email: googleUser.email || 'customer@gmail.com',
        photoURL: googleUser.photoURL
      });
      setUserProfile(profile);
      showToast(`Assalamu'alaikum, ${profile.displayName}!`, "success");
    } catch (e: any) {
      console.error("Popup login error:", e);
      const errCode = e.code || "";
      const errMsg = e.message || "";
      
      let title = "Gagal Menghubungkan Google";
      let hint = "Pastikan koneksi internet stabil dan konfigurasi di Firebase Console sudah diaktifkan.";

      if (errCode === "auth/popup-blocked") {
        title = "Popup Diblokir Browser";
        hint = "Browser Anda memblokir jendela popup Google Login. Silakan izinkan popup untuk situs ini atau klik tombol 'buka di tab baru' di pojok kanan atas AI Studio.";
        showToast("Popup login diblokir browser. Pastikan Anda mengizinkan popup atau buka aplikasi di tab baru.", "error");
      } else if (errCode === "auth/unauthorized-domain") {
        title = "Domain Belum Terdaftar (Nama Domain Tidak Diizinkan)";
        hint = "Domain web latihan Anda belum ditambahkan ke daftar 'Authorized Domains' di Firebase Console Anda. Anda HARUS menyalin domain ini dan menambahkannya di menu Firebase Console: Authentication -> Settings -> Authorized Domains.";
        showToast(`Domain ini belum didaftarkan di Firebase Console Anda. Harap tambahkan domain ini ke 'Authorized Domains' di Firebase.`, "error");
      } else if (errCode === "auth/operation-not-allowed") {
        title = "Metode Google Sign-In Belum Aktif";
        hint = "Provider login Google belum diaktifkan di Firebase Console. Masuk ke Firebase Console Anda -> klik menu Authentication -> klik tab Sign-in method -> aktifkan 'Google' dan isi email dukungan.";
        showToast("Provider Google belum diaktifkan di Firebase Console Anda (Authentication -> Sign-in method).", "error");
      } else {
        showToast(`Gagal menghubungkan ke Google: ${errCode || errMsg || 'Koneksi ditolak'}. Gunakan Demo Mode terlebih dahulu.`, "error");
      }

      setAuthError({
        code: errCode,
        message: errMsg,
        title,
        hint
      });
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Email dan password wajib diisi.", "error");
      return;
    }
    
    // Simple verification
    if (email === 'miftahilmi15@gmail.com' || email.toLowerCase().includes('admin')) {
      handleLocalDemoLogin('admin');
    } else {
      handleLocalDemoLogin('guest');
    }
  };

  // Demo Login flows to bypass blocked frame environments
  const handleLocalDemoLogin = async (role: 'guest' | 'admin') => {
    setLoading(true);
    let sampleUser: UserProfile;

    if (role === 'admin') {
      sampleUser = {
        uid: 'adm_15',
        displayName: 'Miftah Ilmi (Admin)',
        email: 'miftahilmi15@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        level: 'Platinum',
        points: 3500,
        whatsapp: '08123456789',
        createdAt: new Date().toISOString()
      };
    } else {
      sampleUser = {
        uid: 'guest_99',
        displayName: 'Zulfa Shaliha',
        email: 'shaliha.beauty@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        level: 'Gold',
        points: 1750,
        whatsapp: '085399998888',
        createdAt: new Date().toISOString()
      };
    }

    try {
      localStorage.setItem('alisya_local_user', JSON.stringify(sampleUser));
      setUserProfile(sampleUser);
      setWhatsappNum(sampleUser.whatsapp || "");
      showToast(`Assalamu'alaikum, ${sampleUser.displayName} (Demo Mode)`, "success");
    } catch {
      showToast("Gagal memulai demo.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      localStorage.removeItem('alisya_local_user');
      if (auth) {
        await fbSignOut(auth);
      }
      setUserProfile(null);
      setActiveTab('home');
      showToast("Anda telah keluar dari keanggotaan.", "info");
    } catch {
      showToast("Gagal logout.", "error");
    }
  };

  const handleNavigateToBooking = (treatmentName: string) => {
    setPreselectedTreatment(treatmentName);
    setActiveTab('booking');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 text-center gap-4">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
        <div className="space-y-1">
          <p className="font-serif font-bold text-lg text-white tracking-wide">Alisya Beauty</p>
          <p className="text-xs text-stone-400 font-light max-w-xs">Menghubungkan dengan sistem member kecantikan Anda...</p>
        </div>
      </div>
    );
  }

  // ========================================================
  // LOGIN SCREEN (IF NO USER LOGGED IN) - DARK LUXURY THEME
  // ========================================================
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center relative px-4 py-8 overflow-hidden font-sans">
        
        {/* Luxury Background Ambient Lights */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-gold-600/5 blur-3xl pointer-events-none" />
        
        {/* Ambient background picture opacity */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=900')] bg-cover bg-center opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/92 to-[#050507]" />

        <div className="relative z-10 max-w-md w-full space-y-7 animate-fade-in-up">
          
          {/* Brand Logo & Presentation */}
          <div className="space-y-3 text-center">
            <div className="w-28 h-28 mx-auto relative group">
              <img 
                src={logo.png} 
                alt="Alisya Beauty Logo" 
                className="w-full h-full object-contain rounded-full shadow-2xl border border-[#d4af37]/40 p-1 bg-black/40 hover:border-[#d4af37] transition-all duration-500 transform hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-3.5xl font-serif font-black tracking-widest text-white leading-tight">
                Alisya Beauty
              </h1>
              <p className="text-[10px] text-[#d4af37] bg-gold-550/10 inline-block px-4 py-1.5 rounded-full uppercase tracking-widest font-black border border-[#d4af37]/20">
                Luxury Muslimah Salon & Spa
              </p>
            </div>
          </div>

          {/* Interactive Login Card - Glassmorphism, Gold glow border, smooth layout */}
          <div className="glass rounded-3xl p-6.5 border border-[#d4af37]/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(212,175,55,0.05)] text-left space-y-5 animate-fade-in-up relative">
            <div className="space-y-1 text-center border-b border-white/5 pb-3.5">
              <h2 className="font-serif font-bold text-white text-base tracking-wide flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-400 shrink-0" /> Keanggotaan Shaliha
              </h2>
              <p className="text-[10.5px] text-stone-400 font-light">
                Masuk untuk reservasi privat & kumpulkan poin kebaikan Anda
              </p>
            </div>

            {/* Email-Password Login Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@shaliha.com"
                  className="w-full bg-[#08080a] border border-[#d4af37]/15 focus:border-[#d4af37] text-white rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-600 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase block">
                    Password
                  </label>
                  <span className="text-[9px] text-stone-500 hover:text-gold-200 cursor-pointer">Lupa?</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#08080a] border border-[#d4af37]/15 focus:border-[#d4af37] text-white rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-606 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                />
              </div>

              {/* Submit Main Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-450 text-[#050507] font-extrabold py-3 rounded-xl shadow-lg shadow-gold-500/10 text-xs uppercase tracking-widest cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-2"
              >
                Masuk Keanggotaan
              </button>
            </form>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-4.5">
              <div className="border-t border-white/5 w-full" />
              <span className="absolute bg-[#0b0b0e] px-3.5 text-[9px] uppercase tracking-widest font-bold text-stone-500 font-mono">
                Atau
              </span>
            </div>

            {/* Google official button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white/5 hover:bg-white/10 text-stone-200 font-bold py-3 px-4 border border-white/10 hover:border-[#d4af37]/45 rounded-xl flex items-center justify-center gap-2.5 active:scale-98 transition-all uppercase tracking-wider text-[10.5px] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.92 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.7 3.4-4.46 6.64-4.46z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.8-.07-1.56-.2-2.3H12v4.4h6.44c-.28 1.44-1.1 2.66-2.33 3.47l3.6 2.8c2.1-1.94 3.3-4.8 3.3-8.37z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.36 14.5c-.24-.7-.36-1.46-.36-2.25s.12-1.55.36-2.25L1.5 7.01C.54 8.93 0 11.07 0 13.33s.54 4.4 1.5 6.32l3.86-3.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.6-2.8c-1.1.74-2.5 1.18-4.36 1.18-3.24 0-5.74-1.76-6.64-4.46L1.5 17c1.9 3.85 5.85 6.5 10.5 6.5z"
                />
              </svg>
              <span>Google Authentication</span>
            </button>

          </div>

        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER MAIN APPLICATION ROUTER IN SHELL
  // ========================================================
  return (
    <Layout 
      activeTab={activeTab} 
      onNavigate={setActiveTab} 
      userProfile={userProfile}
      onLogout={handleLogout}
      whatsappNum={whatsappNum}
    >
      {/* Dynamic screen routing */}
      {activeTab === 'home' && (
        <HomePage 
          userProfile={userProfile} 
          onNavigate={setActiveTab} 
          onNavigateToBooking={handleNavigateToBooking}
        />
      )}
      
      {activeTab === 'booking' && (
        <BookingPage 
          userProfile={userProfile} 
          preselectedTreatment={preselectedTreatment}
          clearPreselectedTreatment={() => setPreselectedTreatment("")}
          onShowToast={showToast}
        />
      )}
      
      {activeTab === 'shop' && (
        <ShopPage 
          onShowToast={showToast} 
        />
      )}
      
      {activeTab === 'gallery' && (
        <GalleryPage />
      )}
      
      {activeTab === 'profile' && (
        <ProfilePage 
          userProfile={userProfile}
          onLogout={handleLogout}
          onNavigateToAdmin={() => setActiveTab('admin')}
          onShowToast={showToast}
          onUpdatewhatsapp={setWhatsappNum}
        />
      )}

      {activeTab === 'admin' && (
        <AdminPage 
          onShowToast={showToast} 
        />
      )}

      {/* Render Single Micro Toast Dialog */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </Layout>
  );
}
