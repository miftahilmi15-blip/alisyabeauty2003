import React, { useState, useEffect } from 'react';
import { 
  Images, Heart, Sparkles, X, ChevronLeft, ChevronRight, Eye, Play, 
  MapPin, Clock, Star, ZoomIn, Info
} from 'lucide-react';
import { fetchGalleryItems } from '../services/dataService';
import { GalleryItem } from '../types';

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hair' | 'face' | 'spa' | 'body' | 'interior'>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'Semua Portfolio' },
    { id: 'hair', label: 'Hair Care' },
    { id: 'face', label: 'Face Beauty' },
    { id: 'body', label: 'Body Treatment' },
    { id: 'spa', label: 'Luxury Spa' },
    { id: 'interior', label: 'Interior' }
  ];

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true);
      try {
        const items = await fetchGalleryItems();
        setGalleryItems(items || []);
      } catch (err) {
        console.error("Gagal memuat galeri:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

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
    <div className="space-y-8 pb-24 text-stone-800 min-h-screen bg-white p-1 md:p-4 rounded-3xl relative overflow-hidden animate-fade-in-up">
      {/* Lights */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-gold-200/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-rose-200/10 blur-3xl pointer-events-none" />

      {/* FILTER BUTTON TABS - HORIZONTAL SCROLLING WITHOUT BORDERS/LINES */}
      <div className="w-full overflow-x-auto scrollbar-none py-2 px-4 -mx-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-2.5 pb-2 pt-1 min-w-max md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#A98436] to-[#D3B674] text-stone-950 shadow-md ring-2 ring-white'
                  : 'bg-stone-50 text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* GALERI PHOTO GRID - 2 columns mobile */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 font-sans">
          <div className="w-8 h-8 rounded-full border-2 border-[#A98436]/20 border-t-[#A98436] animate-spin" />
          <span className="text-xs text-stone-500 font-medium">Memuat galeri portfolio...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl font-sans">
          <Images className="w-8 h-8 text-[#A98436] mx-auto mb-2 opacity-60" />
          <p className="text-sm text-stone-600 font-semibold">Belum ada foto portfolio dalam kategori ini.</p>
          <p className="text-xs text-stone-400 mt-1">Silakan tambahkan foto melalui halaman Admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {filteredItems.map((item, index) => (
            <figure 
              key={index}
              onClick={() => setActiveIndex(index)}
              className="group relative bg-stone-50/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-zoom-in"
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
                  <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] text-gold-650 font-mono tracking-wide">
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
              <figcaption className="p-3.5 flex flex-col justify-between h-[110px] bg-stone-50/40 text-left">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-xs text-stone-900 leading-tight flex items-center gap-1.5 line-clamp-1" title={item.title}>
                    <Sparkles className="w-3 h-3 text-gold-600 shrink-0" /> {item.title}
                  </h3>
                  <p className="text-[10px] text-stone-600 leading-normal line-clamp-2 font-sans font-normal h-7 overflow-hidden">
                    {item.desc}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-[9px] font-mono text-stone-500 pt-1.5 mt-auto">
                  <span className="text-[#A98436] flex items-center gap-0.5 font-bold">
                    <Star className="w-3 h-3 fill-current text-gold-550" /> {item.likes} menyukai
                  </span>
                  <span className="uppercase text-[8px] font-bold text-stone-600 bg-stone-100/80 px-1.5 py-0.5 rounded">
                    {item.category === 'hair' ? 'Hair Care' : item.category === 'face' ? 'Face' : item.category === 'body' ? 'Body' : item.category === 'spa' ? 'Spa' : 'Interior'}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

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
            <div className="max-w-2xl max-h-[60vh] rounded-3xl overflow-hidden shadow-2xl relative bg-zinc-950 animate-fade-in-up">
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
          <div className="max-w-xl mx-auto w-full p-5 bg-stone-900 rounded-2xl space-y-2 relative z-10 text-left shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 bg-gold-500/10 text-[#A98436] py-0.5 px-2 rounded font-sans font-bold text-[9px] uppercase tracking-wider">
                {filteredItems[activeIndex].category === 'hair' ? 'Hair Care' : filteredItems[activeIndex].category === 'face' ? 'Face Beauty' : filteredItems[activeIndex].category === 'body' ? 'Body Treatment' : filteredItems[activeIndex].category === 'spa' ? 'Luxury Spa' : 'Interior'}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {filteredItems[activeIndex].duration || "Prosedur Steril"}
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans font-normal">
              {filteredItems[activeIndex].desc}
            </p>
            <div className="flex items-center gap-4 text-[10px] text-stone-450 pt-2 font-mono">
              <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-current text-gold-400" /> {filteredItems[activeIndex].likes} Menyukai</span>
              <span>·</span>
              <span>100% Sesuai Syariat - Bebas Aurat</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
