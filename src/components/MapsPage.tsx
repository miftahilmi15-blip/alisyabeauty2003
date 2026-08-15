import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Clock, Navigation, Copy, Star, Search, 
  Map as MapIcon, Sparkles, Shield, Compass, Heart, ExternalLink,
  Loader2
} from 'lucide-react';
import { SalonBranch } from '../types';
import { fetchBranches } from '../services/dataService';

interface MapsPageProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function MapsPage({ onShowToast }: MapsPageProps) {
  const [branches, setBranches] = useState<SalonBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('br-01');
  const [showingRoute, setShowingRoute] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await fetchBranches();
        setBranches(data);
        if (data.length > 0) {
          // Default to first branch
          setSelectedBranchId(data[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat cabang:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBranches();
  }, []);

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.codename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    onShowToast("Alamat berhasil disalin ke clipboard!", "success");
  };

  const triggerShowRouteAnimation = () => {
    if (!selectedBranch) return;
    setShowingRoute(true);
    onShowToast(`Menghitung rute tercepat ke ${selectedBranch.codename}...`, "info");
    setTimeout(() => {
      onShowToast(`Rute ke ${selectedBranch.codename} berhasil dimuat!`, "success");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-2 text-stone-700 font-sans">
        <Loader2 className="w-7 h-7 text-gold-600 animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-stone-400">Memuat data cabang...</span>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="py-24 text-center border-2 border-dashed border-stone-200 rounded-3xl p-8 bg-white max-w-md mx-auto">
        <MapIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <h3 className="font-serif font-bold text-stone-850">Belum ada Cabang Terdaftar</h3>
        <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">Owner belum meregistrasikan cabang Alisya Beauty pada database ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-stone-800 animate-fade-in-up font-sans select-none">
      
      {/* Brand & Introduction Header */}
      <section className="space-y-2 text-left">
        <span className="inline-flex items-center gap-1 bg-gold-200/20 text-gold-600 text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full border border-[#cd9a2d]/25">
          <MapIcon className="w-3.5 h-3.5 text-gold-550" /> Premium Locator
        </span>
        <h1 className="text-2xl md:text-3xl font-serif font-black text-stone-900 tracking-wide leading-tight">
          Lokasi & Rute <span className="text-gold-550">Alisya Arjawinangun</span>
        </h1>
        <p className="text-stone-500 text-xs font-light max-w-xl leading-relaxed">
          Kunjungi studio utama kami di Arjawinangun Cirebon. Nikmati ruangan privat bersih dengan jaminan keamanan syariah tanpa pandangan pria non-mahram.
        </p>
      </section>

      {/* Main Grid: Interactive Map + Left List Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Control & Information Deck (40%) */}
        <div className="lg:col-span-5 flex flex-col">
          
          {/* Dynamic Active Salon details deck card */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4 text-left flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              
              {/* Branch Cozy Thumbnail */}
              <div className="h-44 w-full rounded-xl overflow-hidden relative border border-stone-200 bg-stone-100">
                <img 
                  src={selectedBranch.branchImage} 
                  alt={selectedBranch.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-[#0a0a0c]/80 backdrop-blur-md text-[#A98436] text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border border-[#A98436]/35 flex items-center gap-1 shadow-sm font-sans">
                  <Shield className="w-3 h-3" /> 100% Muslimah Privat
                </div>
              </div>

              <div>
                <h2 className="text-sm font-black text-stone-900 leading-snug font-serif">
                  {selectedBranch.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10.5px] font-black text-[#8c6d2c] bg-gold-200/15 border border-gold-500/10 px-2 py-0.5 rounded">
                    {selectedBranch.codename}
                  </span>
                  <div className="flex items-center text-stone-500 gap-1 text-[10.5px]">
                    <span className="font-bold text-stone-800">{selectedBranch.rating}</span>
                    <span>({selectedBranch.reviewCount} ulasan google)</span>
                  </div>
                </div>
              </div>

              {/* Contacts and details */}
              <div className="space-y-2 border-t border-stone-200/60 pt-3 text-[11px] font-medium text-stone-600">
                
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span className="leading-snug text-stone-700 min-w-0 flex-1">
                    {selectedBranch.address}
                  </span>
                  <button 
                    onClick={() => handleCopyAddress(selectedBranch.address)}
                    className="p-1 text-stone-400 hover:text-gold-600 hover:bg-stone-150 rounded cursor-pointer transition-colors shrink-0"
                    title="Salin alamat instan"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="text-stone-700 font-bold">{selectedBranch.operatingHours}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <a href={`tel:${selectedBranch.phone}`} className="text-stone-700 hover:text-gold-600 hover:underline">
                    {selectedBranch.phone}
                  </a>
                </div>

              </div>

              {/* Tag features list */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedBranch.features.map((feature, i) => (
                  <span 
                    key={i} 
                    className="bg-stone-200/50 text-stone-600 text-[9px] font-bold px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>

            </div>

            {/* Actions Panel inside the card */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-stone-200/60">
              
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Alisya+Premium+Salon+%26+Spa+Arjawinangun+Cirebon+Grand+Lavanda"
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setShowingRoute(true);
                  onShowToast("Menghubungkan ke GPS handphone... Membuka aplikasi navigasi.", "success");
                }}
                className="bg-stone-900 text-white hover:bg-stone-850 px-3 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 text-center"
              >
                <Navigation className="w-3.5 h-3.5 text-gold-400" /> Lihat Rute (GPS)
              </a>

              <a
                href={selectedBranch.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-gold-500 text-stone-950 hover:bg-gold-600 px-3 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 border border-gold-600/10 text-center"
              >
                Petunjuk Maps <ExternalLink className="w-3 h-3" />
              </a>

            </div>

          </div>

        </div>

        {/* Right Map Canvas Panel (70%) */}
        <div className="lg:col-span-7 flex flex-col bg-[#faf9f6] border border-stone-100 rounded-3xl p-4.5 min-h-[440px] shadow-sm relative overflow-hidden">
          
          {/* Subtle Map Widgets Header */}
          <div className="absolute top-7 left-7 z-20 flex items-center gap-2 max-w-[calc(100%-50px)]">
            <div className="bg-[#0a0a0c]/90 text-white px-3.5 py-2.5 rounded-2xl border border-stone-700/30 flex items-center gap-2.5 text-xs shadow-xl backdrop-blur-md select-none font-bold">
              <Compass className="w-4 h-4 text-gold-500 animate-spin-slow animate-pulse" />
              <div className="text-left font-sans">
                <span className="block text-[10.5px] tracking-wide leading-tight">GPS Navigator Aktif</span>
                <span className="block text-[8px] text-stone-400 font-light mt-0.5">Membaca lokasi terdekat di sekitar Cirebon</span>
              </div>
            </div>
          </div>

          <div className="absolute top-7 right-7 z-20">
            <button 
              onClick={() => {
                setShowingRoute(false);
                onShowToast("Sudut peta disesuaikan kembali ke pusat.", "info");
              }}
              className="w-10 h-10 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer text-stone-700"
              title="Reset Zoom & Rute"
            >
              <Compass className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Core Interactive Vector/SVG Map simulation canvas container */}
          <div className="relative flex-1 rounded-2xl border border-stone-250 bg-[#ebe3d5] overflow-hidden min-h-[360px] flex items-center justify-center select-none shadow-inner">
            
            {/* Grid Pattern Background to make it feel like a real technical coordinate space */}
            <div className="absolute inset-0 bg-[#ebe3d5] opacity-25" style={{
              backgroundImage: 'radial-gradient(#8c6d2c 0.8px, #ebe3d5 0.8px)',
              backgroundSize: '16px 16px'
            }} />

            {/* Realistic Scenic Waterways & Rivers (styled using premium SVG vector shapes) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Giant river flowing across the region */}
              <path 
                d="M -50,150 Q 150,80 300,220 T 650,120 T 1100,280" 
                fill="none" 
                stroke="#c5dae8" 
                strokeWidth="28" 
                strokeLinecap="round" 
                className="opacity-70 transition-all"
              />
              <path 
                d="M -50,150 Q 150,80 300,220 T 650,120 T 1100,280" 
                fill="none" 
                stroke="#b2cbe0" 
                strokeWidth="10" 
                strokeLinecap="round" 
                className="opacity-60 transition-all"
              />

              {/* Smaller Estuary channels */}
              <path 
                d="M 300,220 Q 250,380 400,480" 
                fill="none" 
                stroke="#c5dae8" 
                strokeWidth="14" 
                strokeLinecap="round" 
                className="opacity-50"
              />

              {/* Forest & Parks Green Reserves Areas */}
              <rect x="5%" y="60%" width="120" height="70" rx="20" fill="#dfebd9" className="opacity-90 leading-none" />
              <rect x="75%" y="10%" width="180" height="100" rx="30" fill="#dfebd9" className="opacity-90 leading-none" />
              <rect x="15%" y="5%" width="90" height="70" rx="15" fill="#dfebd9" className="opacity-60 leading-none" />

              {/* Complex road meshes representing modern elegant streets */}
              <path d="M 0,100 L 1200,100" stroke="#fefbf7" strokeWidth="8" strokeLinecap="round" className="opacity-80" />
              <path d="M 0,280 Q 250,340 500,280 T 1100,320" stroke="#fefbf7" strokeWidth="6" strokeLinecap="round" className="opacity-85" />
              <path d="M 120,0 L 120,600" stroke="#fefbf7" strokeWidth="7" strokeLinecap="round" className="opacity-85" />
              <path d="M 380,-20 L 380,620" stroke="#fefbf7" strokeWidth="9" strokeLinecap="round" className="opacity-90" />
              <path d="M 720,0 L 720,600" stroke="#fefbf7" strokeWidth="7" strokeLinecap="round" className="opacity-80" />
              <path d="M 0,440 L 1200,440" stroke="#fefbf7" strokeWidth="6" strokeLinecap="round" className="opacity-80" />

              {/* Primary Toll/Highway Roads (highlighted golden color) */}
              <path d="M -20,200 L 1100,500" stroke="#dec9a2" strokeWidth="8" strokeLinecap="round" className="opacity-60" />
              
              {/* Dynamic simulated route tracing connection of the direction tool */}
              {showingRoute && (
                <path 
                  d="M 180,250 Q 240,240 330,195 T 380,180" 
                  fill="none" 
                  stroke="#cd9a2d" 
                  strokeWidth="6.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="animate-dash" 
                  style={{
                    strokeDasharray: '12, 12',
                    animation: 'dashAnimation 2s linear infinite'
                  }}
                />
              )}
            </svg>

            {/* Custom CSS Style block for drawing smooth animated dashes across vectors */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes dashAnimation {
                to {
                  stroke-dashoffset: -24;
                }
              }
              .animate-spin-slow {
                animation: spin 8s linear infinite;
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}} />

            {/* Label texts simulating styled Google map names */}
            <span className="absolute bottom-[35%] left-[6%] text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono opacity-50 select-none pointer-events-none">Alun-Alun Arjawinangun</span>
            <span className="absolute top-[12%] right-[10%] text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono opacity-50 select-none pointer-events-none">Perumahan Grand Lavanda</span>
            <span className="absolute top-[6%] left-[30%] text-[9px] text-stone-400 font-bold uppercase tracking-widest pointer-events-none">Kawasan Kec. Arjawinangun</span>

            {/* ============================================== */}
            {/* MAP STOPS & PINS */}
            {/* ============================================== */}

            {/* USER REPLICATED GPS PIN (Our Starting Point) */}
            <div 
              style={{ left: '180px', top: '250px' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center tracking-normal selection-none"
            >
              <div className="relative flex items-center justify-center">
                {/* Radar ring active waves */}
                <span className="absolute inline-flex h-9 w-9 rounded-full bg-blue-400 opacity-30 animate-ping" />
                <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-[9px]">
                  <span>H</span>
                </div>
              </div>
              <div className="bg-[#050507] text-white text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 shadow-md border border-stone-800 whitespace-nowrap">
                Lokasi Anda (Hotel Lobby)
              </div>
            </div>

            {/* INDIVIDUAL BRANCH DYNAMIC HOVER/CLICKABLE PINS */}
            {branches.map((br) => {
              const isSelected = br.id === selectedBranchId;
              
              // Calculate responsive coordinates on the map container
              const leftPercent = `${br.coordinateX}%`;
              const topPercent = `${br.coordinateY}%`;

              return (
                <button
                  key={br.id}
                  style={{ left: leftPercent, top: topPercent }}
                  onClick={() => {
                    setSelectedBranchId(br.id);
                    setShowingRoute(false);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none group cursor-pointer"
                >
                  {/* Dynamic interactive pin bubble */}
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${
                    isSelected ? 'scale-125 z-30' : 'scale-100 hover:scale-110 z-20'
                  }`}>
                    {/* Ring glow for active salon pins */}
                    {isSelected && (
                      <span className="absolute inline-flex h-14 w-14 rounded-full bg-gold-450/40 animate-ping" />
                    )}
                    <div className={`w-9 h-9 rounded-full shadow-2xl flex items-center justify-center text-white border-2 transition-all ${
                      isSelected 
                        ? 'bg-[#0a0a0c] border-[#A98436] text-gold-400' 
                        : 'bg-stone-800 border-white text-white hover:bg-stone-900'
                    }`}>
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#cd9a27]' : 'text-stone-300'}`} />
                    </div>

                    {/* Small flag rating marker inside */}
                    <div className="absolute -top-1.5 -right-1 bg-amber-500 text-stone-950 font-black text-[7.5px] rounded-full px-1 py-0.2 border border-white">
                      {br.rating}
                    </div>
                  </div>

                  {/* Bubble popup detail label directly on the map */}
                  <div className={`mt-2.5 px-3 py-1.5 rounded-xl text-left shadow-2xl backdrop-blur-md transition-all border shrink-0 ${
                    isSelected 
                      ? 'bg-[#0a0a0c] text-white border-gold-500/50' 
                      : 'bg-white text-stone-800 border-stone-200 opacity-80 group-hover:opacity-100'
                  }`}>
                    <span className="block text-[10px] font-black tracking-wide leading-none select-none">
                      {br.codename}
                    </span>
                    <span className={`block text-[8px] mt-0.5 select-none font-bold ${
                      isSelected ? 'text-gold-400' : 'text-stone-500'
                    }`}>
                      {br.distance} • {br.estTime}
                    </span>
                  </div>
                </button>
              );
            })}

          </div>

          {/* Map Footer status guides */}
          <div className="flex items-center justify-between mt-3 text-stone-500 text-[10px] font-semibold">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" /> Posisi Anda
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#cd9a2d] rounded-full inline-block" /> Rute Rencana
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-stone-800 rounded-full inline-block" /> Lokasi Alisya
              </span>
            </div>
            <div className="text-[10px] italic">
              Peta simulasi akurat kawasan Arjawinangun Cirebon
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
