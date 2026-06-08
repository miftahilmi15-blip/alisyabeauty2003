import React, { useState, useEffect } from 'react';
import { Scissors, Heart, CalendarPlus, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import { fetchTreatments } from '../services/dataService';
import { Treatment } from '../types';

interface ServicesPageProps {
  onNavigateToBooking: (treatmentName: string) => void;
}

export default function ServicesPage({ onNavigateToBooking }: ServicesPageProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchTreatments();
        setTreatments(data);
      } catch (e) {
        console.error("Gagal memuat layanan:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 pb-20 text-stone-200 animate-fade-in-up text-left">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-4">
        <span className="text-[10px] text-gold-400 uppercase tracking-widest font-black block">Alisya Treat Menu</span>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white flex items-center gap-2 mt-0.5">
          <Sparkles className="w-5.5 h-5.5 text-gold-400" /> Layanan Perawatan Premium
        </h2>
        <p className="text-xs text-stone-400 mt-1.5 max-w-xl font-sans leading-relaxed font-light">
          Setiap ritual perawatan tubuh, rambut, kecantikan, dan spa didesain khusus agar sesuai syariat Muslimah, dikerjakan terapis ahli bersertifikat dalam ruangan eksklusif yang tenang dan privat.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-neutral-950/40 rounded-3xl border border-neutral-900">
          <div className="w-8 h-8 rounded-full border-2 border-gold-400/40 border-t-gold-500 animate-spin" />
          <span className="text-xs text-stone-500 font-medium">Memuat katalog kecantikan syari...</span>
        </div>
      ) : treatments.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-850 bg-neutral-950/50 rounded-2xl">
          <Heart className="w-8 h-8 text-stone-600 mx-auto mb-2" />
          <p className="text-sm text-stone-400 font-medium font-sans">Belum ada layanan tersedia saat ini.</p>
        </div>
      ) : (
        /* RESPONSIVE LAYOUT SYSTEM: 1-col on mobile, 2-col on table, 3-col on desktop, matching custom criteria */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {treatments.map((t) => {
            const isExpanded = expandedId === t.id;
            return (
              <article 
                key={t.id}
                className={`overflow-hidden rounded-2.5xl border transition-all duration-300 flex flex-col justify-between ${
                  isExpanded 
                    ? 'border-gold-500 bg-neutral-950 ring-1 ring-gold-500/20 shadow-2xl' 
                    : 'border-neutral-850 bg-gradient-to-b from-[#0a0a0c] to-[#070709] hover:border-gold-500/25 shadow-lg'
                }`}
              >
                {/* Upper block containing treatment details */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-extrabold text-[15px] text-white leading-tight">
                      {t.name}
                    </h3>
                    <span className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-400/25 flex items-center justify-center shrink-0">
                      <Scissors className="w-3.5 h-3.5 text-gold-400" />
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono">
                    <span className="text-[13px] font-black text-gold-400">
                      Rp {Number(t.price || 0).toLocaleString('id-ID')}
                    </span>
                    {t.duration && (
                      <span className="text-[9px] text-stone-300 bg-neutral-900 border border-neutral-850 rounded-md px-2 py-0.5 inline-flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-gold-400" /> {t.duration} Menit
                      </span>
                    )}
                  </div>

                  {/* Summary/Description */}
                  <p className="text-[11.5px] text-stone-400 leading-relaxed font-sans font-light">
                    {t.description || 'Ritual kecantikan premium dirancang khusus dengan penjagaan privasi terbaik bagi muslimah.'}
                  </p>
                </div>

                {/* Footer block CTA */}
                <div className="p-4 bg-neutral-950/80 border-t border-neutral-900 flex items-center justify-between">
                  <span className="text-[8.5px] uppercase text-stone-500 font-mono tracking-wide">
                    *Wudhu Friendly
                  </span>
                  <button
                    onClick={() => onNavigateToBooking(t.name)}
                    className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-bold text-[10.5px] py-2 px-3.5 rounded-xl shadow-lg hover:shadow-gold-500/10 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all uppercase tracking-wider shrink-0"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-neutral-950" /> Pesan
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
