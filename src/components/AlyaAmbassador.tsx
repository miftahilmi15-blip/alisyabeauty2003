import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Volume2, VolumeX, Eye, HelpCircle, ArrowRight, X, 
  ShoppingBag, CalendarCheck2, Star, CheckCircle, Gift, Heart, MessageCircle,
  Users, Send, Award, Trash2, Plus, ShoppingCart, MessageSquare, Flame, Share2
} from 'lucide-react';
import { UserProfile, CartItem, Product } from '../types';

interface AlyaAmbassadorProps {
  activeTab: string;
  userProfile: UserProfile | null;
  onNavigate: (tabId: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  isOpen?: boolean;
  onClose?: () => void;
  cartItems?: CartItem[];
  setCartItems?: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOpenCart?: () => void;
}

interface CustomPromo {
  title: string;
  subtitle: string;
  desc: string;
  benefit: string;
  actionTab: string;
  bgGradient: string;
}

// Custom curated high-end promotions per page/context
const CONTEXT_PROMOS: Record<string, CustomPromo> = {
  home: {
    title: "Double Glow Booster Treatment",
    subtitle: "Rekomendasi Utama Hari Ini",
    desc: "Kombinasi facial modern menggunakan oksigen murni dan serum botanical premium untuk memudarkan noda hitam secara instan dan aman untuk kulit sensitif.",
    benefit: "Diskon Khusus Member: Hemat 20%",
    actionTab: "booking",
    bgGradient: "from-amber-900/90 to-[#58411C]"
  },
  services: {
    title: "Facial Microbright Shaliha",
    subtitle: "Best-Seller Treatment",
    desc: "Eksfoliasi mikro berteknologi tinggi yang memadukan microdermabrasion dengan masker mawar asli yang mencerahkan kulit kusam seketika.",
    benefit: "Free Hair Spa Mawar untuk Kedatangan Pagi",
    actionTab: "booking",
    bgGradient: "from-rose-950/90 to-[#521C2B]"
  },
  booking: {
    title: "Voucher Perawatan Senilai Rp 50.000",
    subtitle: "Kejutan Spesial Booking",
    desc: "Dapatkan voucher langsung yang memotong biaya perawatan apa pun untuk kunjungan pertama di cabang baru Alisya Premium Solo.",
    benefit: "Berlaku otomatis saat checkout reservasi",
    actionTab: "booking",
    bgGradient: "from-stone-900/95 to-[#422F08]"
  },
  shop: {
    title: "Alisya Premium Silk Gamis",
    subtitle: "Luxury Boutique Release",
    desc: "Gamis elegan dari bahan sutra premium dengan serat halus, warna sage green mewah, adem dan jatuh sangat anggun untuk acara formal.",
    benefit: "Diskon 15% untuk Pembelian Pertama",
    actionTab: "shop",
    bgGradient: "from-[#352513] to-amber-950/90"
  },
  profile: {
    title: "Eksklusif Gold Membership Upgrade",
    subtitle: "Loyalty Premium Rewards",
    desc: "Tingkatkan tingkat keanggotaan Anda ke Gold dengan mengumpulkan poin loyalitas untuk mendapatkan gratis face massage di setiap kedatangan.",
    benefit: "Double Poin di Setiap Transaksi Hari Rabu",
    actionTab: "profile",
    bgGradient: "from-purple-950/95 to-stone-950"
  },
  gallery: {
    title: "Inspirasi Hasil Nyata Alisya",
    subtitle: "Portfolio Gallery",
    desc: "Lihat hasil nyata perawatan rambut, kuku, dan kecantikan wajah terbaik dari para pelanggan setia kami yang luar biasa.",
    benefit: "Saran Konsultasi Gratis untuk sista",
    actionTab: "gallery",
    bgGradient: "from-indigo-950/95 to-stone-950"
  }
};

// Conversational options/questions sista can ask Alya
const ASK_OPTIONS: Record<string, string[]> = {
  home: [
    "Ada promo live apa hari ini, Alya?",
    "Apa treatment yang paling populer di live?",
    "Bagaimana cara booking salon langsung?"
  ],
  services: [
    "Bahan facial-nya aman untuk bumil?",
    "Berapa lama durasi treatment rambut?",
    "Rekomendasi untuk kulit kusam dong!"
  ],
  booking: [
    "Ada promo diskon booking khusus live?",
    "Bisa pilih therapist favorit?",
    "Bagaimana jika ingin reschedule?"
  ],
  shop: [
    "Apakah gamis sutranya ready?",
    "Produk lip cream-nya halal?",
    "Ada jaminan retur barang?"
  ],
  profile: [
    "Gimana cara kumpulin poin loyalitas?",
    "Apa keuntungan level membership?",
    "Voucher saya bisa dipakai kapan?"
  ],
  gallery: [
    "Berapa lama pengerjaan hair care?",
    "Apakah hasil smoothing bertahan lama?",
    "Ingin konsultasi model rambut dong!"
  ]
};

// Simulated products for the "Shopee Live" Pinned Drawer & Yellow Pinned Item
const LIVE_PRODUCTS: Product[] = [
  {
    id: "live_gamis_silk",
    name: "Alisya Premium Silk Gamis (Live Promo)",
    description: "Sutra premium adem sage green mewah khusus penonton live.",
    price: 385000,
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "live_glow_booster",
    name: "Double Glow Booster Facial (Live Voucher)",
    description: "Facial modern serum oksigen murni mencerahkan kulit kusam.",
    price: 199000,
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "live_hair_serum",
    name: "Organik Rose Hair Spa Serum (Best Seller)",
    description: "Nutrisi akar rambut rontok dan wangi mawar mewah tahan 48 jam.",
    price: 85000,
    imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=200"
  }
];

// Simulated live chat templates to populate Shopee Live chat screen
const SIMULATED_CHAT_TEMPLATES = [
  { user: "Riana_Shaliha", text: "Masya Allah bajunya cantik bgt kak 😍", color: "text-rose-400" },
  { user: "Dinda_02", text: "Voucher Creambath dapet free face massage ga sista?", color: "text-amber-400" },
  { user: "Fatimah_Zahra", text: "Kak gamis sage green sutra ready ukuran L?", color: "text-emerald-400" },
  { user: "Siti_Aminah", text: "Beneran adem bgt lho kemarin aku baru facial di sana 👍", color: "text-cyan-400" },
  { user: "Zulfa_Nayla", text: "Nunggu diskon 50% treatment rambut rontok", color: "text-violet-400" },
  { user: "Hanum_Solo", text: "Terapisnya ramah dan salonnya privat bgt, nyaman!", color: "text-pink-400" },
  { user: "Indah_Sari", text: "Klaim voucher livenya dimana kak?", color: "text-yellow-400" },
  { user: "Nisa_Aurelia", text: "Glow Booster beneran bikin glowing instan ga kak?", color: "text-orange-400" }
];

interface FloatingHeart {
  id: number;
  x: number;
  color: string;
  scale: number;
}

interface SimulatedChatMessage {
  id: number;
  user: string;
  text: string;
  color: string;
}

export default function AlyaAmbassador({ 
  activeTab, 
  userProfile, 
  onNavigate, 
  onShowToast, 
  isOpen, 
  onClose,
  cartItems = [],
  setCartItems,
  onOpenCart
}: AlyaAmbassadorProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechText, setSpeechText] = useState('');
  
  // Eye tracking & micro-animations
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [customQuestionResponse, setCustomQuestionResponse] = useState<string | null>(null);

  // Screen size tracking for dynamic dragging constraints
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Shopee Live simulation states
  const [viewerCount, setViewerCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  const formatLikes = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1).replace('.', ',') + "RB";
    return (count / 1000000).toFixed(1).replace('.', ',') + "JT";
  };
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [chatMessages, setChatMessages] = useState<SimulatedChatMessage[]>([]);
  const [pinnedProductIdx, setPinnedProductIdx] = useState(0);
  const [isProductsDrawerOpen, setIsProductsDrawerOpen] = useState(false);
  const [checkoutPopup, setCheckoutPopup] = useState<string | null>(null);
  const [mobileActiveSubTab, setMobileActiveSubTab] = useState<'stream' | 'chat'>('stream');

  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Sync isCollapsed with isOpen prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsCollapsed(!isOpen);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsCollapsed(true);
    window.speechSynthesis?.cancel();
    if (onClose) onClose();
  };

  // Monitor screen size
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Scroll live chat to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Sync isCollapsed and greetings
  useEffect(() => {
    const promo = CONTEXT_PROMOS[activeTab] || CONTEXT_PROMOS.home;
    const greeting = getPageGreeting(activeTab, promo);
    
    setSpeechText(greeting);
    setCustomQuestionResponse(null);

    if (!isCollapsed) {
      triggerAlyaSpeech(greeting);
    }

    return () => {
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [activeTab, isCollapsed]);

  // Live Stream Simulation: Fluctuating viewer count
  useEffect(() => {
    if (isCollapsed) return;

    // 1. Viewer counter fluctuations (grows naturally from 0, never negative)
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        if (prev === 0) {
          return Math.floor(Math.random() * 3) + 1; // start growing
        }
        const delta = (Math.random() > 0.4 ? 1 : -1) * Math.floor(Math.random() * 2 + 1);
        return Math.max(0, prev + delta);
      });
    }, 4500);

    return () => {
      clearInterval(viewerInterval);
    };
  }, [isCollapsed]);

  // Eye blinking simulation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Monitor mouse movement for eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x: x * 6, y: y * 6 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mouth talking animation lip sync
  useEffect(() => {
    if (isSpeaking) {
      speakingIntervalRef.current = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 130);
    } else {
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      setMouthOpen(false);
    }
    return () => {
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
    };
  }, [isSpeaking]);

  const getPageGreeting = (tab: string, promo: CustomPromo) => {
    const name = userProfile?.displayName ? `, sista ${userProfile.displayName}` : ' sista cantik';
    switch (tab) {
      case 'home':
        return `Assalamu'alaikum${name}! Selamat datang di Live Alisya! Tap-tap layar dan klaim voucher sista. Khusus hari ini ada promo *${promo.title}* hemat 20% lho! ✨`;
      case 'services':
        return `Masya Allah sista, treatment kami dirancang menggunakan bahan botanical halal murni. Favorit di live ini adalah *${promo.title}*, mumpung ada live promo sista! 🌸`;
      case 'booking':
        return `Reservasi gampang bgt sista shaliha! Pilih jadwal terbaik, dan ada voucher langsung Rp 50.000 khusus pengguna baru. Tanya Alya aja ya untuk panduannya! 📅`;
      case 'shop':
        return `Selamat berbelanja koleksi butik sista! Gamis sutra premium & skincare organik Alisya beneran istimewa dan adem. Ada diskon live 15% lho! 🛍️`;
      case 'profile':
        return `Halo sista shaliha! Ayo terus kumpulkan poin loyalitas sista di Alisya. Tingkatkan level membership untuk voucher diskon salon gratis! 💎`;
      case 'gallery':
        return `Masya Allah sista, lihat hasil portfolio perawatan rambut dan kuku terbaik Alisya! Dikerjakan terapis wanita profesional dalam ruang privat yang adem. 🖼️`;
      default:
        return `Assalamu'alaikum sista cantik! Alya siap bantu pilih treatment terbaik untuk memanjakan diri sista hari ini. Yuk nonton live streaming kami! 🌟`;
    }
  };

  const speakWithAlyaVoice = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#✨🌸🔴📅💎🛍️]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
      utterance.rate = 1.0; // Dynamic live host rate, enthusiastic yet elegant
      utterance.pitch = 1.05;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      setIsSpeaking(false);
    }
  };

  const triggerAlyaSpeech = (text: string) => {
    setIsSpeaking(false);
    setIsThinking(true);
    
    const thinkingDelay = Math.floor(Math.random() * 400) + 250;
    setTimeout(() => {
      setIsThinking(false);
      speakWithAlyaVoice(text);
    }, thinkingDelay);
  };

  const handleAskQuestion = async (question: string) => {
    setIsThinking(true);
    setCustomQuestionResponse(null);

    // Feed user's question directly to the live comments simulation list
    setChatMessages(prev => [
      ...prev, 
      { id: Date.now(), user: userProfile?.displayName || "Sista Cantik", text: question, color: "text-[#D3B674]" }
    ]);

    try {
      const recentHistory = [`Alya (Ambassador): ${speechText}`];
      const promo = CONTEXT_PROMOS[activeTab] || CONTEXT_PROMOS.home;

      const res = await fetch('/api/live/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: question,
          productContext: {
            currentPageTab: activeTab,
            recommendedPromo: promo,
            isAlyaAmbassadorMode: true
          },
          chatHistory: recentHistory
        })
      });

      const data = await res.json();
      const rawReply = data.reply || "Wah pilihan sista tepat sekali! Treatment itu sangat bagus untuk menjaga kesegaran kulit wajah dan bikin rileks.";
      
      let elegantReply = rawReply;
      if (elegantReply.length > 150) {
        elegantReply = elegantReply.slice(0, 145) + "... Silakan dicoba ya sista cantik!";
      }

      setCustomQuestionResponse(elegantReply);
      triggerAlyaSpeech(elegantReply);
    } catch (e) {
      console.error(e);
      const fallback = "Tentu saja sista shaliha! Bahan treatment salon kami 100% organik alami, aman untuk ibu hamil & menyusui, serta dijamin bersertifikasi halal MUI.";
      setCustomQuestionResponse(fallback);
      triggerAlyaSpeech(fallback);
    }
  };

  // Add floating heart animation
  const handleAddHeart = () => {
    setLikesCount(prev => prev + 1);
    const id = Date.now() + Math.random();
    const colors = ["#EF4444", "#EC4899", "#F43F5E", "#D946EF", "#F59E0B", "#10B981", "#3B82F6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomX = Math.floor(Math.random() * 100) - 50; // horizontal offset -50px to 50px
    const scale = Math.random() * 0.4 + 0.8; // scale multiplier

    setHearts(prev => [...prev, { id, x: randomX, color: randomColor, scale }]);
    
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  // Add items directly to standard boutique/cart system
  const handleAddToCartFromLive = (product: Product) => {
    if (!setCartItems) return;
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
    
    // Trigger burst of 5 floating hearts
    setLikesCount(prev => prev + 25);
    for (let i = 0; i < 5; i++) {
      setTimeout(handleAddHeart, i * 150);
    }

    onShowToast(`🛍️ "${product.name}" ditambahkan ke keranjang belanja!`, "success");
  };

  const handleClaimVoucherLive = () => {
    onShowToast("🎟️ Selamat! Sista berhasil mengklaim VOUCHER LIVE DISKON 15%!", "success");
    setLikesCount(prev => prev + 50);
    for (let i = 0; i < 8; i++) {
      setTimeout(handleAddHeart, i * 100);
    }
  };

  const currentPromo = CONTEXT_PROMOS[activeTab] || CONTEXT_PROMOS.home;
  const questions = ASK_OPTIONS[activeTab] || ASK_OPTIONS.home;
  const activePinnedProduct = LIVE_PRODUCTS[pinnedProductIdx];

  return (
    <>
      {/* ==========================================================
          1. COLLAPSED FLOATING AI BUBBLE (DRAGGABLE & TOUCH FRIENDLY)
          ========================================================== */}
      {isOpen === undefined && (
        <div className="fixed bottom-24 right-5 z-45 flex flex-col items-end pointer-events-none select-none font-sans">
          <AnimatePresence>
            {isCollapsed && (
              <motion.div
                drag
                dragConstraints={{
                  left: -windowSize.width + 100,
                  right: 15,
                  top: -windowSize.height + 140,
                  bottom: 60,
                }}
                dragElastic={0.12}
                dragMomentum={false}
                whileDrag={{ scale: 1.08 }}
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 15 }}
                className="flex flex-col items-end gap-2.5 pointer-events-auto cursor-pointer touch-none"
                onTap={() => {
                  setIsCollapsed(false);
                  onShowToast("🌸 Menemui Alya, Beauty Ambassador Premium Alisya", "info");
                }}
              >
                {/* Quick contextual floating mini message bubble */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-stone-900/90 text-white border border-[#A98436]/40 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg max-w-[200px] text-left text-[10px] leading-relaxed relative flex flex-col gap-0.5 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[7.5px] uppercase font-black text-[#D3B674] tracking-wider">Alya Ambassador</span>
                  </div>
                  <p className="line-clamp-2 text-stone-200 mt-0.5">
                    {speechText || "Halo sista! Ada rekomendasi treatment hari ini lho..."}
                  </p>
                  <div className="absolute right-4 -bottom-1 w-2.5 h-2.5 bg-stone-900 rotate-45 border-r border-b border-[#A98436]/40" />
                </motion.div>

                {/* Glowing Avatar Bubble with active pulsing ring */}
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#A98436] to-[#D3B674] rounded-full blur-xs opacity-65 group-hover:opacity-100 animate-pulse transition-opacity" />
                  
                  <div className="relative w-15 h-15 rounded-full bg-[#FAF8F5] border border-stone-950/20 overflow-hidden flex items-center justify-center shadow-lg bg-center">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" 
                      alt="Alya Ambassador"
                      className="w-full h-full object-cover rounded-full pointer-events-none select-none"
                    />
                    {blink && <div className="absolute inset-0 bg-stone-900/15 pointer-events-none" />}
                    {isSpeaking && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-[#A98436] px-1.5 py-0.5 rounded-full text-[7px] text-white font-extrabold flex gap-0.5 h-3.5 items-center justify-center shadow-xs">
                        <span className="w-0.5 h-2 bg-white rounded-full animate-bounce delay-75" />
                        <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce delay-150" />
                        <span className="w-0.5 h-1 bg-white rounded-full animate-bounce delay-300" />
                      </div>
                    )}
                  </div>

                  <span className="absolute -top-1 -left-1 bg-gradient-to-r from-[#A98436] to-[#D3B674] text-stone-950 text-[8px] font-black p-1 rounded-full border border-[#FAF8F5] shadow-sm flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                  </span>
                </div>
                <div className="text-[7.5px] bg-[#A98436]/95 text-white px-1.5 py-0.5 rounded-full font-bold select-none leading-none shadow-xs mt-1 border border-white/20 uppercase tracking-wider">
                  Geser AI ✥
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ==========================================================
          2. EXPANDED FULL-SCREEN INTERACTIVE LIVE LOUNGE (SHOPEE LIVE)
          ========================================================== */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-black/95 md:backdrop-blur-md flex items-center justify-center font-sans text-stone-200 overflow-hidden"
          >
            {/* Simulated vertical smartphone viewport (Aspect 9/15) */}
            <div 
              onClick={handleAddHeart}
              className="relative w-full h-full md:max-w-[430px] md:h-[92vh] md:max-h-[850px] md:rounded-[40px] bg-gradient-to-b from-stone-900 to-stone-950 overflow-hidden md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] md:border-8 md:border-stone-800 flex flex-col justify-between cursor-pointer select-none active:scale-[0.99] transition-all"
              title="Klik layar untuk kirim Love! ❤️"
            >
              {/* Subtle live streaming light grids */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(169,132,54,0.15)_0%,transparent_80%)] pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

              {/* Top overlay cards - Styled like real Shopee/TikTok Live stream */}
              <div className="absolute top-4 inset-x-4 flex justify-between items-start z-20 pointer-events-none">
                
                {/* Live indicator & Shop Identity */}
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full pr-2.5 border border-white/10 pointer-events-auto shadow-lg">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#F6C344] shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" 
                      alt="Alisya Brand Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left leading-none font-sans min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[9.5px] text-white font-extrabold truncate max-w-[80px]">Alisya Premium</span>
                      <span className="w-3 h-3 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center font-black text-[7px] shrink-0">✓</span>
                    </div>
                    <span className="text-[8px] text-[#F6C344] font-bold mt-0.5 block">
                      {viewerCount.toLocaleString('id-ID')} Penonton
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowToast("❤️ Terima kasih sudah mengikuti Alisya Premium!", "success");
                    }}
                    className="ml-2 px-2.5 py-1 bg-[#EE4D2D] hover:bg-[#d83f20] text-white font-black text-[9px] rounded-full border-0 cursor-pointer transition-all flex items-center justify-center gap-0.5"
                  >
                    <span>+ Ikuti</span>
                  </button>
                </div>

                {/* Right control panel with Likes, Sound and Close */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <div className="bg-[#EE4D2D]/90 text-white font-extrabold text-[8px] tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>MENGANGKUT</span>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextVal = !voiceEnabled;
                        setVoiceEnabled(nextVal);
                        if (nextVal) {
                          onShowToast("🔊 Suara Live Alya diaktifkan!", "success");
                          speakWithAlyaVoice(customQuestionResponse || speechText);
                        } else {
                          onShowToast("🔇 Suara Live Alya dimatikan.", "info");
                          window.speechSynthesis?.cancel();
                          setIsSpeaking(false);
                        }
                      }}
                      className="w-7 h-7 bg-black/45 backdrop-blur-md border border-white/10 hover:bg-stone-800 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md active:scale-95 transition-all"
                      title={voiceEnabled ? "Matikan Suara" : "Aktifkan Suara"}
                    >
                      {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#F6C344]" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                      }}
                      className="w-7 h-7 bg-black/45 backdrop-blur-md border border-white/10 hover:bg-stone-800 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md active:scale-95 transition-all"
                      title="Keluar Live"
                    >
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Left Side Sub-Header widgets (Floating tags) */}
              <div className="absolute top-16 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                <div className="bg-black/35 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1 text-[8px] font-black text-amber-200 uppercase tracking-wider w-fit pointer-events-auto">
                  <span className="text-amber-400">🔥</span> Leaderboard <span className="text-stone-400 font-normal">&gt;</span>
                </div>
              </div>

              {/* Right Side Sub-Header widgets (Check In & Diskon, identical to Shopee screenshot!) */}
              <div className="absolute top-16 right-4 z-20 flex flex-col gap-1.5 items-end pointer-events-auto">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-1 rounded-lg border border-amber-300/20 text-white flex flex-col items-center justify-center shadow-lg leading-tight w-24">
                  <span className="text-[7.5px] font-black uppercase tracking-widest leading-none">CHECK IN</span>
                  <span className="text-[8px] font-bold text-amber-100 flex items-center gap-0.5 mt-0.5">
                    🎁 s.d 50
                  </span>
                </div>
                <div className="bg-[#EE4D2D] text-white px-2 py-1 rounded-lg border border-red-300/20 text-center shadow-lg leading-tight w-24">
                  <span className="text-[7px] font-black uppercase tracking-wider block">EKSTRA DISKON</span>
                  <span className="text-[9px] font-black text-amber-200">30 RIBU</span>
                </div>
                <div className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full text-center shadow-md font-bold text-[7.5px] flex items-center gap-1">
                  <span>⏰ 2 Koin</span>
                </div>
              </div>

              {/* Floating Pinned Product Card (Middle Left) - Styled exactly like the phone preview! */}
              <div className="absolute left-4 top-[30%] z-20 pointer-events-auto w-[115px] bg-[#FAF8F5] rounded-2xl border border-stone-200 shadow-xl overflow-hidden text-stone-900 flex flex-col">
                <div className="relative">
                  {/* Numerical index rank */}
                  <span className="absolute top-1 left-1 bg-stone-950 text-white font-extrabold text-[8px] w-4 h-4 rounded-md flex items-center justify-center leading-none">
                    1
                  </span>
                  {/* Discount tag */}
                  <span className="absolute top-1 right-1 bg-red-600 text-white font-black text-[8px] px-1 rounded-md leading-tight">
                    -15%
                  </span>
                  
                  {/* Product thumbnail */}
                  <div className="w-full aspect-square bg-white flex items-center justify-center p-1">
                    <img 
                      src={activePinnedProduct.imageUrl} 
                      alt={activePinnedProduct.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Countdown timer / banner */}
                  <div className="bg-red-950/90 text-red-400 font-mono text-[8px] font-black py-0.5 text-center tracking-wide">
                    16:25:52
                  </div>
                </div>

                <div className="p-1.5 flex flex-col text-left">
                  <span className="text-[7px] text-[#A98436] font-extrabold uppercase leading-none">Best Seller</span>
                  <h6 className="font-extrabold text-[8.5px] text-stone-950 leading-tight mt-0.5 truncate">{activePinnedProduct.name}</h6>
                  
                  <span className="text-[10px] font-black font-mono text-red-600 mt-1 block">
                    Rp {activePinnedProduct.price.toLocaleString('id-ID')}
                  </span>

                  {/* Buy Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCartFromLive(activePinnedProduct);
                    }}
                    className="w-full mt-1.5 py-1.5 bg-[#EE4D2D] hover:bg-[#d83f20] text-white rounded-lg text-[9.5px] font-black uppercase flex items-center justify-center border-0 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    Beli
                  </button>
                </div>
              </div>

              {/* Interactive Checkout alert popup (Simulated buyers) */}
              <AnimatePresence>
                {checkoutPopup && (
                  <motion.div
                    initial={{ opacity: 0, x: -120, y: 120 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="absolute top-16 left-4 right-4 z-20 bg-gradient-to-r from-amber-600 to-amber-500 text-white p-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-amber-300/30 pointer-events-none"
                  >
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-[13px] leading-none shrink-0 animate-bounce">
                      🎁
                    </div>
                    <p className="text-[10px] sm:text-xs font-sans text-stone-950 font-black tracking-wide leading-tight text-left">
                      {checkoutPopup}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ================= ALYA AVATAR IN STUDIO PORTRAIT ================= */}
              <div className="flex-1 flex items-center justify-center relative mt-16 pb-20">
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                    rotate: [0, 0.5, -0.5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                  className="relative w-48 h-48 flex items-center justify-center"
                >
                  {/* Interactive golden studio backlights */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#A98436]/40 via-amber-400/10 to-[#D3B674]/30 rounded-full blur-xl animate-pulse" />
                  
                  {/* Avatar container */}
                  <div className="relative w-44 h-44 rounded-full p-[2.5px] bg-gradient-to-tr from-[#A98436] via-[#FAF8F5] to-amber-200 flex items-center justify-center shadow-2xl overflow-hidden border border-white/10">
                    <div className="w-full h-full bg-[#FAF8F5] rounded-full overflow-hidden relative flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350" 
                        alt="Alya Virtual portrait"
                        className="w-full h-full object-cover rounded-full pointer-events-none"
                      />

                      {/* Interactive Eye Tracking (Pupil overlays) */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                        <div className="w-28 h-8 relative flex justify-between px-5">
                          {/* Left eye */}
                          <div className="w-6.5 h-4.5 bg-white/30 rounded-full backdrop-blur-3xs flex items-center justify-center overflow-hidden relative">
                            <motion.div 
                              style={{ x: mousePos.x * 0.45, y: mousePos.y * 0.3 }}
                              className="w-3.5 h-3.5 bg-stone-950 rounded-full flex items-center justify-center"
                            >
                              <span className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
                            </motion.div>
                          </div>

                          {/* Right eye */}
                          <div className="w-6.5 h-4.5 bg-white/30 rounded-full backdrop-blur-3xs flex items-center justify-center overflow-hidden relative">
                            <motion.div 
                              style={{ x: mousePos.x * 0.45, y: mousePos.y * 0.3 }}
                              className="w-3.5 h-3.5 bg-stone-950 rounded-full flex items-center justify-center"
                            >
                              <span className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Eye Blinking simulator */}
                      <AnimatePresence>
                        {blink && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#E8DEC7] flex flex-col justify-center items-center z-15"
                          >
                            <div className="w-full h-1 bg-stone-600/30" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Dynamic Lip Synchronization lip movement */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none w-12 flex items-center justify-center h-4 z-10">
                        <motion.div 
                          animate={{ 
                            scaleY: mouthOpen ? [1.4, 2.0, 1.4] : 1,
                            borderRadius: mouthOpen ? "25% 25% 50% 50%" : "6px 6px 14px 14px"
                          }}
                          className={`bg-rose-500 transition-all ${mouthOpen ? 'w-5.5 h-3.5' : 'w-4 h-1'}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Speech waves visualizer hanging beneath the portrait */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 h-6 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
                  {isSpeaking ? (
                    [1, 2, 3, 4, 5, 4, 3, 2, 1].map((bar, idx) => (
                      <motion.span 
                        key={idx}
                        animate={{ height: [4, 18, 4] }}
                        transition={{ repeat: Infinity, duration: 0.3 + (idx * 0.05) }}
                        className="w-[2px] bg-gradient-to-t from-[#A98436] to-amber-300 rounded-full"
                      />
                    ))
                  ) : isThinking ? (
                    <span className="text-[10px] font-mono font-medium text-amber-300 animate-pulse flex items-center gap-1">
                      Alya sedang berpikir...
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#D3B674] font-black uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
                      SIAP MELAYANI SISTA
                    </span>
                  )}
                </div>
              </div>

              {/* ================= FLOATING HEART STREAMS (TAP TAP ANIMATION) ================= */}
              <AnimatePresence>
                {hearts.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 1, y: 150, x: h.x, scale: h.scale * 0.5 }}
                    animate={{ 
                      opacity: [1, 0.9, 0], 
                      y: -220, 
                      x: h.x + Math.sin(h.id) * 35, // wavy motion
                      scale: h.scale 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="absolute bottom-20 right-8 pointer-events-none z-30"
                    style={{ color: h.color }}
                  >
                    <Heart className="w-6 h-6 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Bottom Overlays */}
              <div className="absolute bottom-4 inset-x-4 flex flex-col gap-2.5 z-20">
                
                {/* Live comment/chat scroll box */}
                <div className="bg-black/45 backdrop-blur-md rounded-xl p-2 max-h-[100px] overflow-y-auto flex flex-col gap-1 text-left text-[10px] leading-relaxed select-none border border-white/5 pointer-events-auto">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                      <span className={`font-black ${msg.color} mr-1`}>{msg.user}:</span>
                      <span className="text-stone-100 font-bold">{msg.text}</span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Live join popups & greetings - Simulated exactly like Shopee Live */}
                <div className="flex flex-col gap-1 text-left select-none pointer-events-none">
                  
                  {/* Joined alert bubble */}
                  <div className="bg-[#EE4D2D]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-400/20 text-white text-[9px] font-bold w-fit animate-pulse flex items-center gap-1 shadow-md pointer-events-auto">
                    <span className="text-amber-300">👋</span>
                    <span>miftahilmi15 dan 57 penonton lainnya bergabung!</span>
                  </div>

                  {/* Welcome speech alert bubble */}
                  <div className="bg-amber-400 text-stone-950 font-black text-[9px] px-3 py-1.5 rounded-r-full rounded-tl-full border border-amber-300/30 w-fit shadow-md flex items-center gap-1.5 pointer-events-auto">
                    <span>📢</span>
                    <span>Selamat Datang di Alisya Live! Tanyakan seputar produk di sini.</span>
                  </div>

                </div>

                {/* Speech bubble pointing to the Live Bag */}
                <div className="relative w-fit pointer-events-auto">
                  <div className="bg-[#EE4D2D] text-white font-black text-[9px] px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 animate-bounce">
                    <span>🏷️</span>
                    <span>Nikmati harga spesial live sekarang!</span>
                  </div>
                  {/* Little triangle arrow pointing down to the shopping bag */}
                  <div className="absolute left-5 bottom-[-4px] w-2 h-2 bg-[#EE4D2D] rotate-45" />
                </div>

                {/* Integrated bottom controls bar styled exactly like Shopee Live */}
                <div className="flex items-center justify-between gap-2 pointer-events-auto">
                  
                  {/* Shopee-style Shopping Bag Icon with 200 badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProductsDrawerOpen(true);
                      onShowToast("🛍️ Membuka Produk Live Alisya", "info");
                    }}
                    className="w-11 h-11 bg-gradient-to-b from-orange-500 to-[#EE4D2D] hover:brightness-110 rounded-xl flex flex-col items-center justify-center cursor-pointer border-0 shadow-lg active:scale-90 transition-all shrink-0 relative"
                    title="Daftar Produk Live"
                  >
                    <ShoppingBag className="w-5 h-5 text-white stroke-[2.5] mt-1" />
                    <span className="text-[7.5px] font-black text-white mt-0.5">200</span>
                  </button>

                  {/* Comment Input capsule */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const input = form.elements.namedItem('liveComment') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        handleAskQuestion(input.value.trim());
                        input.value = '';
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex gap-1 items-center bg-black/45 backdrop-blur-md rounded-full border border-white/10 px-2 py-1"
                  >
                    <input 
                      name="liveComment"
                      type="text" 
                      placeholder="Beri Komentar..." 
                      className="flex-1 bg-transparent border-0 focus:outline-none px-2 py-1 text-[10px] text-white placeholder:text-stone-300 font-bold w-full"
                      disabled={isThinking}
                    />
                    <button
                      type="submit"
                      disabled={isThinking}
                      className="p-1.5 bg-[#EE4D2D] hover:bg-[#d83f20] disabled:bg-stone-800 text-white font-black rounded-full cursor-pointer border-0 transition-all flex items-center justify-center shrink-0"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>

                  {/* Options "..." Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowToast("⚙️ Menu lainnya segera hadir!", "info");
                    }}
                    className="w-9 h-9 bg-black/45 backdrop-blur-md border border-white/10 hover:bg-stone-800 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
                  >
                    <span className="text-white font-black text-xs leading-none">...</span>
                  </button>

                   {/* Share Arrow Button with dynamic count */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareCount(prev => prev + 1);
                      onShowToast("🔗 Link Live disalin ke clipboard!", "success");
                    }}
                    className="w-9 h-9 bg-black/45 backdrop-blur-md border border-white/10 hover:bg-stone-800 rounded-full flex flex-col items-center justify-center text-white cursor-pointer shadow-md active:scale-95 transition-all shrink-0 relative"
                  >
                    <span className="absolute -top-1 bg-stone-700 text-white text-[7px] font-black px-1 rounded-full border border-white/5 leading-tight">
                      {shareCount}
                    </span>
                    <Share2 className="w-3.5 h-3.5 text-stone-200 mt-0.5" />
                  </button>

                  {/* Heart Like Button with dynamic count */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddHeart();
                    }}
                    className="w-9 h-9 bg-black/45 backdrop-blur-md border border-white/10 hover:bg-stone-800 rounded-full flex flex-col items-center justify-center text-rose-500 cursor-pointer shadow-md active:scale-95 transition-all shrink-0 relative"
                  >
                    <span className="absolute -top-1 bg-red-600 text-white text-[7px] font-black px-1 rounded-full border border-white/5 leading-tight">
                      {formatLikes(likesCount)}
                    </span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mt-0.5" />
                  </button>

                </div>

              </div>

            </div>

            {/* Simulated Yellow Bag Products Drawer Slider */}
            <AnimatePresence>
              {isProductsDrawerOpen && (
                <div className="fixed inset-0 z-55 flex items-end justify-center font-sans">
                  {/* Backdrop */}
                  <div 
                    onClick={() => setIsProductsDrawerOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                  />
                  
                  {/* Slider bottom-sheet */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="relative w-full max-w-lg bg-stone-900 border-t border-stone-800 rounded-t-[32px] p-6 shadow-2xl z-60 text-stone-100 flex flex-col max-h-[85vh]"
                  >
                    {/* Handle */}
                    <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto mb-4" />

                    <div className="flex items-center justify-between border-b border-stone-800 pb-4 text-left">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-amber-400" />
                        <h4 className="font-serif font-black text-white text-base leading-none">Keranjang Kuning Alisya Live</h4>
                      </div>
                      <button
                        onClick={() => setIsProductsDrawerOpen(false)}
                        className="p-1.5 bg-stone-950 hover:bg-stone-800 border-0 rounded-full text-stone-400 cursor-pointer text-xs"
                      >
                        Tutup
                      </button>
                    </div>

                    {/* Scrollable Products List */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-3.5 text-left">
                      {LIVE_PRODUCTS.map((prod, idx) => (
                        <div 
                          key={prod.id} 
                          onClick={() => {
                            setPinnedProductIdx(idx);
                            onShowToast(`📌 Menyematkan produk: ${prod.name}`, "info");
                          }}
                          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                            pinnedProductIdx === idx 
                              ? 'bg-amber-950/20 border-[#F6C344]' 
                              : 'bg-stone-950/40 border-stone-800/80 hover:bg-stone-850'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono font-black text-[#F6C344] text-xs">#{idx + 1}</span>
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-800 bg-stone-900">
                              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 text-left">
                              <h5 className="font-extrabold text-xs text-white truncate">{prod.name}</h5>
                              <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{prod.description}</p>
                              <span className="text-xs font-black font-mono text-red-400 block mt-1">
                                Rp {prod.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {pinnedProductIdx === idx && (
                              <span className="bg-[#F6C344] text-stone-950 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm">
                                Tersemat
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCartFromLive(prod);
                                setIsProductsDrawerOpen(false);
                              }}
                              className="px-3 py-1.5 bg-[#F6C344] hover:bg-white hover:text-stone-950 text-stone-950 text-[10px] font-black uppercase rounded-lg border-0 cursor-pointer shadow-sm transition-all"
                            >
                              + Beli
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800 text-center text-[10px] text-stone-400">
                      Voucher diskon live otomatis diklaim saat checkout keranjang belanja sista! 💖
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
