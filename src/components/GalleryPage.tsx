import React, { useState } from 'react';
import { 
  Images, Heart, Sparkles, X, ChevronLeft, ChevronRight, Eye, Play, 
  MapPin, Clock, Star, ZoomIn
} from 'lucide-react';

interface GalleryItem {
  url: string;
  category: 'hair' | 'face' | 'spa' | 'interior';
  title: string;
  desc: string;
  likes: string;
  comments: string;
  duration?: string;
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hair' | 'face' | 'spa' | 'interior'>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'All Portfolio' },
    { id: 'hair', label: 'Hair Treatment' },
    { id: 'face', label: 'Face Treatment' },
    { id: 'spa', label: 'Spa Treatment' },
    { id: 'interior', label: 'Interior Salon' }
  ];

  const galleryItems: GalleryItem[] = [
    // Hair Treatment Portfolio
    {
      url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=650",
      category: 'hair',
      title: "Alisya Botanical Hair Spa Care",
      desc: "Menutrisi akar rambut, mengurangi rontok, dan mengembalikan kilau alami rambut tertutup hijab.",
      likes: "215",
      comments: "18",
      duration: "65 Menit"
    },
    {
      url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&q=80&w=650",
      category: 'hair',
      title: "Premium Hair Coloring & Silk Polish",
      desc: "Hasil akhir pewarnaan rambut botanical halus tanpa amonia, wangi, berkilau, dan kuat.",
      likes: "182",
      comments: "25",
      duration: "120 Menit"
    },
    {
      url: "https://images.unsplash.com/photo-1519735797351-40af61478612?auto=format&fit=crop&q=80&w=650",
      category: 'hair',
      title: "Creambath Ginseng & Aloe Serum",
      desc: "Langkah relaksasi totok kepala dipadu uap hangat dan serum akar untuk kerontokan parah.",
      likes: "124",
      comments: "9",
      duration: "45 Menit"
    },
    // Face Treatment Portfolio
    {
      url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=650",
      category: 'face',
      title: "Royal Facial Glow Kolagen",
      desc: "Peremajaan kulit intensif dimulai dengan pembersihan uap komedo dan masker kolagen active.",
      likes: "320",
      comments: "42",
      duration: "75 Menit"
    },
    {
      url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=650",
      category: 'face',
      title: "Aura Facemist & Pure Hydration",
      desc: "Kombinasi air distilasi Damask Rose murni dingin untuk menenangkan kulit wudhu-friendly.",
      likes: "205",
      comments: "14",
      duration: "30 Menit"
    },
    {
      url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=650",
      category: 'face',
      title: "Totok Aura Wajah Relaksasi",
      desc: "Pijat akupresur titik saraf meridian melancarkan sistem saraf dan mencerahkan kulit rona wajah alami.",
      likes: "298",
      comments: "37",
      duration: "40 Menit"
    },
    // Spa Treatment Portfolio
    {
      url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=650",
      category: 'spa',
      title: "Traditional Javanese Spa Mandi Rempah",
      desc: "Rendaman kaki aromatik herba hangat dilanjutkan massage lulur rempah cokelat kelapa manis.",
      likes: "196",
      comments: "22",
      duration: "90 Menit"
    },
    {
      url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=650",
      category: 'spa',
      title: "VIP Warm Stone Massage Setup",
      desc: "Suasana ruang pijat steril dilengkapi batu basalt pemanas untuk melepaskan stres punggung.",
      likes: "250",
      comments: "31",
      duration: "80 Menit"
    },
    {
      url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=650",
      category: 'spa',
      title: "Essential Aromatherapy Botanical Oils",
      desc: "Menggunakan 100% minyak murni atsiri melati dan lavender organik, aman untuk kulit sensitif.",
      likes: "167",
      comments: "12",
      duration: "Produk Premium"
    },
    // Interior Salon Portfolio
    {
      url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=650",
      category: 'interior',
      title: "Private styling & Hair Treatment Station",
      desc: "Ruangan pengerjaan steril, privat penuh, tertutup tirai sekat mewah sehingga aurat aman dari luar.",
      likes: "288",
      comments: "40",
      duration: "Zona Steril"
    },
    {
      url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=650",
      category: 'interior',
      title: "Aesthetic Waiting Lounge & Lounge VIP",
      desc: "Lobi santai dengan aromaterapi murni menenangkan sembari menunggu giliran reservasi Anda.",
      likes: "189",
      comments: "21",
      duration: "Akses Terbatas"
    },
    {
      url: "https://images.unsplash.com/photo-1519415510236-8a57900c266f?auto=format&fit=crop&q=80&w=650",
      category: 'interior',
      title: "Private Single Spa Treatment Room",
      desc: "Kamar sekat satu ranjang khusus spa & scrub yang tenang dengan pencahayaan tenang nan mewah.",
      likes: "204",
      comments: "19",
      duration: "Private Safe"
    }
  ];

  // Filter items matching category select
  const filteredItems = galleryItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  // Modal navigation click
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex === null) return;
    const nextIdx = activeIndex === 0 ? filteredItems.length - 1 : activeIndex - 1;
    setActiveIndex(nextIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex === null) return;
    const nextIdx = activeIndex === filteredItems.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIdx);
  };

  return (
    <div className="space-y-8 pb-24 text-stone-800 min-h-screen bg-white p-1 md:p-4 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden animate-fade-in-up">
      {/* Lights */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-gold-200/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-rose-200/10 blur-3xl pointer-events-none" />

      {/* Header and Brand Title */}
      <div className="text-center max-w-xl mx-auto space-y-2 pt-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-200/20 rounded-full border border-gold-550/15 text-gold-600 text-[10px] tracking-widest uppercase font-black">
          <Sparkles className="w-3.5 h-3.5 text-gold-550" /> Professional Portfolio
        </div>
        <h2 className="text-3.5xl font-serif font-bold tracking-wide text-stone-900">
          Our Beauty Gallery
        </h2>
        <p className="text-xs text-gold-600 tracking-wider font-extrabold uppercase text-center mt-0.5">
          Luxury Muslimah Beauty Experience
        </p>
        <p className="text-xs text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed font-light font-sans">
          Inspirasi nyata hasil perawatan kecantikan ramah syariat kami. Seluruh aurat model terjaga sempurna, berfokus murni pada estetika pengerjaan profesional dan kenyamanan ruang treatment.
        </p>
      </div>

      {/* FILTER BUTTON TABS */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto pt-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-4.5 py-2 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border cursor-pointer transition-all ${
              selectedCategory === cat.id
                ? 'bg-gold-500 text-[#050507] border-gold-500 font-black shadow-sm scale-95'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900 hover:bg-stone-100 hover:border-stone-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GALERI PHOTO GRID - 2 columns mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
        {filteredItems.map((item, index) => (
          <figure 
            key={index}
            onClick={() => setActiveIndex(index)}
            className="group relative bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:border-gold-300 transition-all duration-300 transform hover:-translate-y-1 cursor-zoom-in"
          >
            {/* Image viewport */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 relative">
              <img 
                src={item.url} 
                alt={item.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              
              {/* Subtle gradient border overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/10 to-transparent opacity-60 group-hover:opacity-95 transition-opacity duration-300" />
 
              {/* Top info mini-badge */}
              {item.duration && (
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md border border-stone-200 text-[8px] text-gold-650 font-mono tracking-wide">
                  {item.duration}
                </div>
              )}

              {/* Centered Zoom Indicator on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-stone-900/20 backdrop-blur-[1px]">
                <div className="p-2.5 rounded-full bg-gold-500/15 border border-gold-450/30 text-gold-600 transform scale-75 group-hover:scale-100 transition-all duration-300">
                  <ZoomIn className="w-5.5 h-5.5 text-white" />
                </div>
              </div>
            </div>

            {/* Title / details box */}
            <figcaption className="p-3.5 space-y-1 bg-stone-50/40">
              <h3 className="font-serif font-black text-xs text-stone-900 leading-tight flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-600 shrink-0" /> {item.title}
              </h3>
              <p className="text-[10px] text-stone-600 leading-normal line-clamp-2 font-sans font-light">
                {item.desc}
              </p>
              
              <div className="flex items-center justify-between text-[9px] font-mono text-stone-500 pt-1.5 border-t border-stone-100 mt-1">
                <span className="text-gold-600 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-current text-gold-550" /> {item.likes} menyukai
                </span>
                <span className="uppercase text-[8px] bg-stone-100/80 px-1.5 py-0.5 rounded border border-stone-200">
                  {item.category}
                </span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* FULLSCREEN IMAGE MODAL PREVIEW */}
      {activeIndex !== null && (
        <div 
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-50 bg-stone-950/98 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6 animate-fade-in-up"
        >
          {/* Top modal header area */}
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="text-left py-1">
              <span className="text-[10px] font-extrabold tracking-widest text-gold-400 font-sans block uppercase">
                Alisya Premium Portfolio ({activeIndex + 1}/{filteredItems.length})
              </span>
              <h4 className="font-serif font-bold text-white text-base">
                {filteredItems[activeIndex].title}
              </h4>
            </div>
            <button
              onClick={() => setActiveIndex(null)}
              className="p-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 rounded-full text-stone-300 hover:text-white cursor-pointer transition-all active:scale-95 shadow-md animate-pulse"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Image with arrows */}
          <div className="relative flex-1 flex items-center justify-center max-h-[70vh]">
            {/* Arrow Left */}
            <button
              onClick={handlePrev}
              className="absolute left-1/10 lg:left-4 z-20 p-3 bg-stone-900/80 border border-stone-850 hover:border-gold-500/40 text-stone-300 hover:text-white rounded-full transition-all cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Central Slide image viewport */}
            <div className="max-w-2xl max-h-[60vh] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl relative bg-zinc-950">
              <img 
                src={filteredItems[activeIndex].url} 
                alt={filteredItems[activeIndex].title}
                referrerPolicy="no-referrer"
                onClick={(e) => e.stopPropagation()}
                className="max-h-[60vh] object-contain mx-auto select-none"
              />
            </div>

            {/* Arrow Right */}
            <button
              onClick={handleNext}
              className="absolute right-1/10 lg:right-4 z-20 p-3 bg-stone-900/80 border border-stone-850 hover:border-gold-500/40 text-stone-300 hover:text-white rounded-full transition-all cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom metadata panel */}
          <div className="max-w-xl mx-auto w-full p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 relative z-10 text-left shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 bg-gold-500/10 text-gold-400 py-0.5 px-2 rounded font-sans font-bold text-[9px] uppercase tracking-wider">
                {filteredItems[activeIndex].category} Treatment
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {filteredItems[activeIndex].duration || "Prosedur Steril"}
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans font-light">
              {filteredItems[activeIndex].desc}
            </p>
            <div className="flex items-center gap-4 text-[10px] text-stone-450 pt-2 border-t border-stone-800 font-mono">
              <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-current text-gold-400" /> {filteredItems[activeIndex].likes} Menyukai</span>
              <span>·</span>
              <span>100% Sesuai Syariat - Bebas Aurat</span>
            </div>
          </div>
        </div>
      )}

      {/* Syariat Safe Badge stamp */}
      <footer className="text-center pt-8 pb-4 max-w-md mx-auto space-y-3 border-t border-stone-100 font-sans">
        <p className="text-[10px] text-stone-500 leading-normal">
          Kami mematuhi penuh fiqih kecantikan wanita muslimah. Semua pelayanan dikerjakan di ruangan terisolasi dari pandangan laki-laki non-mahram, menjamin kenyamanan hijabers VIP sepenuhnya.
        </p>
      </footer>
    </div>
  );
}
