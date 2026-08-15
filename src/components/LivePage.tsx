import React, { useState, useEffect, useRef } from "react";
import { 
  Tv, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Volume2, 
  VolumeX, 
  Users, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight, 
  Play, 
  Info,
  Gift,
  HelpCircle,
  AlertCircle,
  Clock,
  Mic,
  Smile,
  Zap
} from "lucide-react";

// Tipe data Produk untuk catalog live
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  sold: number;
  rating: number;
  description: string;
}

// Tipe data untuk pesan chat live
interface ChatMessage {
  id: string;
  user: string;
  message: string;
  isAi: boolean;
  avatarColor: string;
  timestamp: Date;
  badge?: "VIP" | "Loyal" | "New" | "Host";
  gift?: string;
}

interface LivePageProps {
  userProfile: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  cartItems: any[];
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
  onOpenCart: () => void;
}

export default function LivePage({ 
  userProfile, 
  onShowToast, 
  cartItems, 
  setCartItems, 
  onOpenCart 
}: LivePageProps) {
  // --- STATE UTAMA ---
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [viewerCount, setViewerCount] = useState<number>(342);
  const [heartCount, setHeartCount] = useState<number>(1420);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeProductIndex, setActiveProductIndex] = useState<number>(0);
  const [currentPromptState, setCurrentPromptState] = useState<{
    scene: string;
    emotion: string;
    liveMode: string;
  }>({
    scene: "Studio Alisya Beauty - Cozy Gold Ambient",
    emotion: "ceria & persuasif",
    liveMode: "promosi produk aktif & tanya jawab penonton"
  });

  // Floating Hearts Animation State
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const heartIdCounter = useRef<number>(0);

  // Input chat dari user asli
  const [userChatInput, setUserChatInput] = useState<string>("");

  // Riwayat Chat Room
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "Alisya",
      message: "Halo ka! Selamat datang di Live Alisya Beauty! Hari ini aku bakal bagi-bagi diskon treatment & produk premium up to 50%! Stay tune ya!",
      isAi: true,
      avatarColor: "from-amber-500 to-amber-700",
      timestamp: new Date(Date.now() - 30000),
      badge: "Host"
    },
    {
      id: "2",
      user: "Siti Rahma",
      message: "Kak, Paket Brightening Serumnya ready stock ga?",
      isAi: false,
      avatarColor: "from-rose-400 to-rose-600",
      timestamp: new Date(Date.now() - 25000),
      badge: "Loyal"
    },
    {
      id: "3",
      user: "Budi Santoso",
      message: "Wah harganya miring banget dibanding beli langsung di klinik!",
      isAi: false,
      avatarColor: "from-amber-400 to-amber-600",
      timestamp: new Date(Date.now() - 20000),
      badge: "VIP"
    },
    {
      id: "4",
      user: "Alisya",
      message: "Ready banget dong kak Siti! Stoknya sisa dikit nih, langsung amankan di keranjang kuning ya biar ga kehabisan!",
      isAi: true,
      avatarColor: "from-amber-500 to-amber-700",
      timestamp: new Date(Date.now() - 15000),
      badge: "Host"
    }
  ]);

  // --- DATA SOURCE OF TRUTH (Sesuai Aturan Sistem) ---
  const productsCatalog: Product[] = [
    {
      id: "p1",
      name: "Gold Essence Brightening Serum",
      price: 189000,
      originalPrice: 320000,
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=60",
      stock: 12,
      sold: 142,
      rating: 4.9,
      description: "Serum premium dengan kandungan emas murni 24k dan Niacinamide 10%. Mencerahkan wajah, memudarkan noda hitam, dan memberikan efek glowing instan sejak pemakaian pertama."
    },
    {
      id: "p2",
      name: "Collagen Youth Booster Cream",
      price: 245000,
      originalPrice: 380000,
      image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400&auto=format&fit=crop&q=60",
      stock: 8,
      sold: 98,
      rating: 4.8,
      description: "Cream anti-aging malam hari dengan hidrolisat kolagen laut mikro untuk mengencangkan kulit, menyamarkan garis halus, dan meremajakan sel kulit mati secara intensif."
    },
    {
      id: "p3",
      name: "Deep Hydration Sunscreen SPF 50+",
      price: 125000,
      originalPrice: 195000,
      image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=60",
      stock: 25,
      sold: 310,
      rating: 4.9,
      description: "Sunscreen bertekstur seringan air dengan perlindungan UVA/UVB super maksimal tanpa whitecast, sekaligus melembabkan kulit seharian penuh."
    }
  ];

  const activeProduct = productsCatalog[activeProductIndex];

  // Ref untuk scroll otomatis chat ke bawah
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Efek simulasi penonton bertambah/berkurang sedikit demi sedikit
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const diff = Math.floor(Math.random() * 7) - 3;
        return Math.max(310, prev + diff);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Text-To-Speech function
  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
      utterance.rate = 1.05; // Slightly faster for enthusiastic live stream feeling
      utterance.pitch = 1.1; // Friendly higher pitch
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  // Efek simulasi komentar masuk dari penonton random jika sedang menonton
  useEffect(() => {
    const names = ["Andi_99", "Dewi.Lestari", "Rian_Glow", "Mega_Putri", "Roni_Kurniawan", "Indah_Sari", "Genta_Pratama"];
    const messages = [
      "Beneran diskonnya sampe nanti malem aja kak?",
      "Serumnya bisa buat kulit sensitif ga kak Alisya?",
      "Aku udah checkout Collagen Cream ya kak, ditunggu kirimannya!",
      "Kirim ke Surabaya berapa hari ya kak?",
      "Ada promo treatment di klinik ga kak hari ini?",
      "Spill manfaat Sunscreen SPF 50 nya dong kak!",
      "Kandungan emasnya beneran asli kak?"
    ];

    const badges: ("VIP" | "Loyal" | "New")[] = ["VIP", "Loyal", "New"];
    const colors = [
      "from-teal-400 to-teal-600", 
      "from-indigo-400 to-indigo-600", 
      "from-rose-400 to-rose-600", 
      "from-amber-400 to-amber-600", 
      "from-purple-400 to-purple-600"
    ];

    const interval = setInterval(() => {
      if (!isPlaying) return;
      
      const randomIdx = Math.floor(Math.random() * messages.length);
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomMsg = messages[randomIdx];
      const randomBadge = badges[Math.floor(Math.random() * badges.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newMsg: ChatMessage = {
        id: Math.random().toString(),
        user: randomName,
        message: randomMsg,
        isAi: false,
        avatarColor: randomColor,
        timestamp: new Date(),
        badge: randomBadge
      };

      setChatMessages(prev => [...prev.slice(-30), newMsg]);

      // Kadang-kadang Alisya otomatis merespons chat penonton random ini
      if (Math.random() > 0.45) {
        triggerAiHostResponse(randomName, randomMsg);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isPlaying, activeProductIndex]);

  // --- TRIGGER RESPONS DARI HOST (ALISYA) ---
  const triggerAiHostResponse = (userSender: string, userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let replyMessage = "";
      const msgLower = userMessage.toLowerCase();

      // Aturan Pencarian & Formulasi Respons Berdasarkan Katalog Source of Truth
      if (msgLower.includes("serum") || msgLower.includes("brightening") || msgLower.includes("emas")) {
        const prod = productsCatalog[0];
        replyMessage = `Halo kak @${userSender}! Untuk ${prod.name} ini beneran best seller banget ka! Kandungannya emas murni 24K premium. Harganya diskon jadi cuma Rp ${prod.price.toLocaleString('id-ID')} aja! Stok sisa ${prod.stock} aja nih ka, yuk langsung amankan di keranjang kuning!`;
      } else if (msgLower.includes("cream") || msgLower.includes("collagen") || msgLower.includes("malam")) {
        const prod = productsCatalog[1];
        replyMessage = `Kak @${userSender}, Collagen Cream kita super recomended ka! Membantu mengencangkan kulit saat tidur dan meremajakan sel mati. Dari harga aslinya Rp ${prod.originalPrice?.toLocaleString('id-ID')}, sekarang diskon jadi Rp ${prod.price.toLocaleString('id-ID')} aja! Stok super menipis tinggal ${prod.stock} botol!`;
      } else if (msgLower.includes("sunscreen") || msgLower.includes("spf") || msgLower.includes("perlindungan")) {
        const prod = productsCatalog[2];
        replyMessage = `Buat kak @${userSender}, Sunscreen SPF 50+ kita teksturnya ringan kayak air ka, ga dempul dan bebas whitecast. Melindungi kulit seharian penuh dengan harga ramah banget Rp ${prod.price.toLocaleString('id-ID')}. Jangan sampai kehabisan ya ka!`;
      } else if (msgLower.includes("diskon") || msgLower.includes("promo") || msgLower.includes("harga")) {
        replyMessage = `Iya dong kak @${userSender}! Semua produk kita hari ini diskon gede-gedean up to 50%! Cek keranjang belanja sekarang juga ya ka sebelum promo live ini berakhir!`;
      } else if (msgLower.includes("checkout") || msgLower.includes("beli") || msgLower.includes("sudah")) {
        replyMessage = `Waaah terima kasih banyak kak @${userSender} sudah checkout! Semoga kulitnya makin glowing maksimal ya ka! Nanti langsung diproses pengirimannya hari ini juga!`;
      } else {
        // Fallback default jika tidak spesifik, mengarah ke produk aktif saat ini
        replyMessage = `Kak @${userSender}! Saat ini kita lagi spill ${activeProduct.name} ka. Bagus banget buat merawat kelembaban dan mencerahkan kulit. Mumpung promo live harganya cuma Rp ${activeProduct.price.toLocaleString('id-ID')}, langsung di-tap-tap keranjangnya ya ka!`;
      }

      const newAiMsg: ChatMessage = {
        id: Math.random().toString(),
        user: "Alisya",
        message: replyMessage,
        isAi: true,
        avatarColor: "from-amber-500 to-amber-700",
        timestamp: new Date(),
        badge: "Host"
      };

      setChatMessages(prev => [...prev.slice(-30), newAiMsg]);
      setIsTyping(false);
      speakText(replyMessage);
      
      // Tambah jumlah tap love kecil secara otomatis
      setHeartCount(prev => prev + Math.floor(Math.random() * 5) + 2);
    }, 2500);
  };

  // --- USER MENGIRIM PESAN CHAT ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const userMsgText = userChatInput;
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      user: userProfile?.displayName || "Sista",
      message: userMsgText,
      isAi: false,
      avatarColor: "from-amber-600 to-amber-800",
      timestamp: new Date(),
      badge: "VIP"
    };

    setChatMessages(prev => [...prev, newMsg]);
    setUserChatInput("");

    // AI Host merespons chat dari user
    triggerAiHostResponse(userProfile?.displayName || "Sista", userMsgText);
  };

  // --- ANIMASI TAP LOVE (FLOATING HEARTS) ---
  const handleLikeTap = () => {
    setHeartCount(prev => prev + 1);
    
    // Trigger floating heart
    const id = heartIdCounter.current++;
    const randomLeft = Math.floor(Math.random() * 80) + 10; // percent 10% - 90%
    setFloatingHearts(prev => [...prev, { id, left: randomLeft }]);

    // Hapus heart dari state setelah animasi selesai (1.5 detik)
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 1500);
  };

  const handleAddToCart = (product: Product) => {
    const alreadyInCart = cartItems.find(item => item.product.id === product.id);
    if (alreadyInCart) {
      onShowToast(`✨ "${product.name}" sudah ada di keranjang sista!`, "info");
      return;
    }

    setCartItems(prev => [
      ...prev,
      {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image
        },
        quantity: 1
      }
    ]);
    onShowToast(`🛒 Berhasil menambahkan "${product.name}" ke keranjang belanja!`, "success");
    handleLikeTap();
  };

  const [showStoreDrawer, setShowStoreDrawer] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto px-0 pt-0 pb-20 font-sans text-stone-800 animate-fade-in text-left">
      
      {/* HEADER UTAMA HALAMAN */}
      <div className="flex items-center justify-between px-4.5 pt-4 pb-2 bg-[#FFFDF9]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#A98436] border border-amber-100">
            <Tv className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-1.5 uppercase">
              Alisya Live <span className="text-[9px] px-1.5 py-0.5 bg-rose-500 text-white font-extrabold rounded-md animate-pulse">LIVE</span>
            </h1>
            <p className="text-[10px] text-stone-500 font-medium">Interaksi Real-Time AI Host</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Badge Penonton */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-full border border-stone-200/60 text-[10px] font-bold text-stone-600">
            <Users className="w-3 h-3 text-stone-500" />
            <span>{viewerCount}</span>
          </div>
        </div>
      </div>

      {/* VIEWPORT STREAMING / LIVE SCREEN (Shopee/TikTok Style) */}
      <div className="relative aspect-[3/4] bg-stone-950 overflow-hidden border border-stone-200/10 shadow-inner rounded-3xl mx-3.5">
        
        {/* VIDEO STREAM BACKGROUND (Simulated Static/Animated Aesthetic Canvas) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-stone-900 via-stone-950 to-[#2A2315] flex flex-col items-center justify-center text-center p-6">
          
          {/* Subtle gold circles & light beam effect */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#A98436]/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-rose-500/5 blur-[50px] pointer-events-none" />

          {/* AI Avatar Host Circle (Alisya Animated Avatar) */}
          <div className="relative mb-4">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-tr from-[#A98436] via-[#D3B674] to-[#FAF6F0] p-1 shadow-[0_0_30px_rgba(169,132,54,0.25)] transition-all duration-500 ${isPlaying && isTyping ? 'scale-105 animate-bounce' : 'scale-100'}`}>
              <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden relative flex items-center justify-center">
                {/* Simulated live visual of Alisya */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#A98436]/30 to-stone-950 opacity-40" />
                <span className="text-3xl">👩💼</span>
                
                {/* Lip Sync / Audio Waves Overlay */}
                {isPlaying && isTyping && (
                  <div className="absolute bottom-2 flex items-center gap-0.5 justify-center">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 h-6 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Glowing active state indicator */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[8px] uppercase tracking-wider rounded-full border border-amber-300 shadow-md">
              AI HOST
            </span>
          </div>

          <p className="text-stone-300 text-xs font-bold tracking-tight">Host Alisya sedang berbicara...</p>
          <p className="text-[10px] text-[#D3B674] font-medium tracking-wide italic mt-1 max-w-[240px]">
            "{isPlaying && isTyping ? 'Merespons pertanyaan penonton...' : 'Silakan tanya-tanya di kolom chat ya ka!'}"
          </p>

          {!isPlaying && (
            <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-6 z-20">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-3 animate-pulse">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-sm font-bold text-stone-200">Live Streaming Ditangguhkan</h3>
              <p className="text-xs text-stone-400 max-w-xs mt-1">Tap tombol putar di pojok kanan atas untuk mengaktifkan kembali host.</p>
              <button 
                onClick={() => setIsPlaying(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[#A98436] to-[#D3B674] text-stone-950 text-xs font-black uppercase tracking-wider rounded-xl border-0 active:scale-95 transition-all cursor-pointer"
              >
                Mulai Ulang Host
              </button>
            </div>
          )}
        </div>

        {/* TOP STATUS OVERLAYS (LIVE HUD) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10">
          
          {/* Live Badge & Duration */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-md">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </div>
            <span className="text-[9.5px] font-mono text-stone-300 pr-2">01:42:08</span>
          </div>

          {/* Interactive Controls (Clickable) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Play/Pause Stream Button */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-stone-800/80 active:scale-95 transition-all cursor-pointer shadow-md"
              title={isPlaying ? "Pause Host" : "Play Host"}
            >
              {isPlaying ? (
                <span className="w-2 h-2.5 flex gap-0.5">
                  <span className="w-0.75 h-full bg-white rounded-full" />
                  <span className="w-0.75 h-full bg-white rounded-full" />
                </span>
              ) : (
                <Play className="w-3.5 h-3.5 text-amber-400 fill-current ml-0.5" />
              )}
            </button>

            {/* Mute/Unmute Audio Button */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-stone-800/80 active:scale-95 transition-all cursor-pointer shadow-md"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4.5 h-4.5 text-rose-400" />
              ) : (
                <Volume2 className="w-4.5 h-4.5 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* MIDDLE WATERMARK OR ANNOUNCEMENTS */}
        <div className="absolute top-15 left-3 pointer-events-none z-10 flex flex-col gap-1">
          <div className="px-2 py-0.5 bg-black/40 backdrop-blur-xs rounded-md border border-white/5 text-[8.5px] font-bold text-[#D3B674] tracking-wide flex items-center gap-1 uppercase">
            <Sparkles className="w-2.5 h-2.5" />
            Vibe: {currentPromptState.emotion}
          </div>
        </div>

        {/* PERSISTENT FLOATING HEARTS CONTAINER */}
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
          {floatingHearts.map(heart => (
            <div 
              key={heart.id} 
              className="absolute bottom-24 text-rose-500 text-2xl animate-float-heart"
              style={{ left: `${heart.left}%` }}
            >
              ❤️
            </div>
          ))}
        </div>

        {/* PINNED PRODUCT CARD INSIDE LIVE SCREEN */}
        <div className="absolute bottom-20 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-lg border border-[#A98436]/20 z-10">
          <div className="absolute -top-2 left-3 bg-gradient-to-r from-[#A98436] to-[#D3B674] text-stone-950 font-black text-[7.5px] uppercase px-2 py-0.5 rounded-md tracking-wider leading-none shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            <span>SEDANG DIBAHAS</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-stone-100 flex items-center justify-center">
              <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-stone-900 text-[10.5px] font-black truncate leading-tight">{activeProduct.name}</h4>
              <p className="text-[#A98436] text-[10.5px] font-bold font-mono mt-0.5">
                Rp {activeProduct.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                triggerAiHostResponse("Kamu", `Spill detail dan harga untuk ${activeProduct.name} dong kak!`);
                handleLikeTap();
              }}
              disabled={isTyping}
              className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[9.5px] font-bold border-0 cursor-pointer active:scale-95 transition-all"
              title="Minta Spill"
            >
              Spill
            </button>

            <button
              onClick={() => handleAddToCart(activeProduct)}
              className="px-3 py-1.5 bg-[#A98436] hover:bg-[#93722E] text-white rounded-lg text-[9.5px] font-black flex items-center gap-1 border-0 cursor-pointer active:scale-95 transition-all shadow-sm uppercase tracking-wider"
            >
              <span>Beli</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION: OVERLAY REAL-TIME SCROLLING CHAT ROOM */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-2 px-3.5 z-10 flex flex-col justify-end">
          
          <div className="max-h-16 overflow-y-auto space-y-1.5 pr-1 scrollbar-none flex flex-col">
            {chatMessages.slice(-2).map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2 max-w-[85%] text-left p-1.5 rounded-xl ${msg.isAi ? 'bg-amber-500/15 border border-amber-500/10' : 'bg-black/35'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${msg.avatarColor} text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm border border-white/10`}>
                  {msg.user[0].toUpperCase()}
                </div>

                {/* Message Body */}
                <div className="text-[10px] leading-relaxed">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-black ${msg.isAi ? 'text-amber-400' : 'text-stone-300'}`}>
                      {msg.user}
                    </span>
                    {msg.badge && (
                      <span className={`text-[7px] px-1 py-0.25 font-extrabold uppercase rounded-xs tracking-wider ${
                        msg.badge === 'Host' ? 'bg-amber-400 text-stone-950' :
                        msg.badge === 'VIP' ? 'bg-rose-500 text-white' :
                        msg.badge === 'Loyal' ? 'bg-indigo-500 text-white' : 'bg-stone-600 text-stone-200'
                      }`}>
                        {msg.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-100 font-medium mt-0.5">{msg.message}</p>
                </div>
              </div>
            ))}

            {/* Simulated Typing Indicator for Alisya */}
            {isTyping && (
              <div className="flex items-center gap-2 max-w-[80%] bg-amber-500/15 border border-amber-500/10 p-1.5 rounded-xl text-left">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white flex items-center justify-center text-[9px] font-black shrink-0 animate-pulse">
                  A
                </div>
                <div className="flex items-center gap-1 py-1 px-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

      </div>

      {/* LOWER CONTROLS BAR */}
      <div className="flex items-center gap-2.5 mt-4 px-3.5">
        
        {/* Shopping Bag Catalog Trigger */}
        <button
          onClick={() => setShowStoreDrawer(true)}
          className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white relative transition-all cursor-pointer border-0 active:scale-90"
          title="Katalog Produk"
        >
          <ShoppingBag className="w-5 h-5 text-amber-300 stroke-[2]" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none border border-black shadow-sm">
            {productsCatalog.length}
          </span>
        </button>

        {/* Chat Input Box */}
        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
          <input
            type="text"
            value={userChatInput}
            onChange={(e) => setUserChatInput(e.target.value)}
            placeholder="Ketik pertanyaan atau minta spill..."
            disabled={isTyping}
            className="flex-1 h-10 bg-black/45 backdrop-blur-md border border-white/15 focus:border-[#A98436]/75 hover:border-white/25 rounded-full px-4 text-[10.5px] text-white placeholder:text-stone-400 outline-none transition-all font-medium"
          />
          
          <button
            type="submit"
            disabled={isTyping || !userChatInput.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A98436] to-[#D3B674] text-stone-950 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Tapping heart spawn button */}
        <button
          onClick={handleLikeTap}
          className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shrink-0 cursor-pointer border-0 active:scale-90 shadow-md transition-all animate-pulse"
          title="Kirim Cinta / Suka"
        >
          <Heart className="w-5 h-5 fill-current" />
        </button>

      </div>

      {/* SHOPPING BAG DRAWER MODAL OVERLAY */}
      {showStoreDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            onClick={() => setShowStoreDrawer(false)}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs cursor-pointer animate-fade-in"
          />

          {/* Drawer */}
          <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-[32px] p-5 shadow-2xl border-t border-[#ECE8E1] z-55 flex flex-col max-h-[70vh] text-stone-800 animate-slide-up">
            {/* Header line handle */}
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-black text-stone-950 text-base">Katalog Alisya Live</h3>
                <p className="text-[10px] text-stone-500">Pilih produk untuk dibahas langsung oleh AI</p>
              </div>
              <button 
                onClick={() => setShowStoreDrawer(false)}
                className="text-xs font-bold text-stone-400 hover:text-stone-700 bg-transparent border-0 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-6">
              {productsCatalog.map((prod, idx) => {
                const isSelected = activeProductIndex === idx;
                return (
                  <div 
                    key={prod.id}
                    onClick={() => {
                      setActiveProductIndex(idx);
                      setShowStoreDrawer(false);
                      onShowToast(`🎯 Mempromosikan: ${prod.name}`, "success");
                    }}
                    className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 relative ${
                      isSelected 
                        ? 'bg-[#A98436]/5 border-[#A98436]' 
                        : 'bg-white border-[#ECE8E1] hover:border-[#A98436]/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-200 flex items-center justify-center">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] uppercase font-bold text-[#A98436] tracking-wide bg-[#A98436]/10 px-1.5 py-0.5 rounded-md leading-none">
                          Butik
                        </span>
                        {isSelected && (
                          <span className="text-[8.5px] uppercase font-black text-rose-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>Dipromosikan</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-stone-950 truncate mt-1 leading-tight">{prod.name}</h4>
                      <p className="text-stone-500 text-[10px] mt-0.5 truncate leading-relaxed">{prod.description}</p>
                      <p className="text-[#A98436] font-mono font-bold text-xs mt-1">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
