import React, { useState, useEffect } from 'react';
import { 
  Star, ChevronLeft, Award, Sparkles, MessageSquare, 
  Heart, ThumbsUp, Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { Review, UserProfile } from '../types';
import { fetchReviews } from '../services/dataService';

interface ReviewsPageProps {
  userProfile: UserProfile | null;
  onNavigate: (tabId: string) => void;
}

export default function ReviewsPage({ userProfile, onNavigate }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Statistics
  const [avgRating, setAvgRating] = useState(5.0);
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => {
    async function getReviewData() {
      try {
        const data = await fetchReviews();
        // Sort newest first
        const sorted = [...data].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setReviews(sorted);
        setFilteredReviews(sorted);

        // Calculate statistics
        if (sorted.length > 0) {
          const totalScore = sorted.reduce((sum, r) => sum + r.rating, 0);
          const avg = Number((totalScore / sorted.length).toFixed(1));
          setAvgRating(avg);

          const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          sorted.forEach(r => {
            const rt = Math.round(r.rating);
            if (rt >= 1 && rt <= 5) {
              counts[rt as 1|2|3|4|5]++;
            }
          });
          setRatingCounts(counts);
        }
      } catch (e) {
        console.error("Gagal load reviews:", e);
      } finally {
        setLoading(false);
      }
    }
    getReviewData();
  }, []);

  // Filter logic
  useEffect(() => {
    if (selectedRating === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => Math.round(r.rating) === selectedRating));
    }
  }, [selectedRating, reviews]);

  const totalReviewsCount = reviews.length;

  return (
    <div className="space-y-6 pb-24 text-stone-800 animate-fade-in-up text-left max-w-4xl mx-auto px-1 font-sans">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 select-none">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 bg-white rounded-xl border border-stone-200 hover:border-[#A98436]/50 active:scale-95 transition-all text-stone-605 cursor-pointer shrink-0"
            title="Kembali ke Beranda"
          >
            <ChevronLeft className="w-4 h-4 text-stone-700" />
          </button>
          <div className="text-left leading-none">
            <span className="text-[10px] text-[#A98436] uppercase tracking-[0.08em] font-bold block">Ulasan Syari Alisya Beauty</span>
            <h2 className="text-xl font-serif font-black text-stone-900 mt-1 flex items-center gap-2">
              Ulasan & Testimonial Pelanggan
            </h2>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('booking')}
          className="text-[11px] font-black text-[#A98436] hover:underline flex items-center gap-1 cursor-pointer"
        >
          Tulis Ulasan <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-[24px] border border-stone-150-80 shadow-sm select-none">
          <div className="w-8 h-8 rounded-full border-2 border-[#A98436]/20 border-t-[#A98436] animate-spin" />
          <span className="text-xs text-stone-500 font-medium font-sans">Memuat seluruh ulasan pelanggan huffazh...</span>
        </div>
      ) : (
        <>
          {/* RATING HIGHLIGHT BANNER & BAR CHARTS (Crafted layout) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gradient-to-br from-[#FDFBF7] via-[#FAF6EE] to-[#F5EFE4] border border-[#A98436]/25 rounded-[32px] p-5 md:p-6 shadow-sm relative overflow-hidden select-none">
            
            {/* Decors */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#A98436]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white rounded-full blur-xl pointer-events-none" />

            {/* Left Col: Overall Stats */}
            <div className="flex flex-col items-center justify-center text-center p-3 md:border-r border-stone-100 space-y-2.5 relative z-10">
              <h3 className="text-5xl font-serif font-black text-stone-900 leading-none">
                {avgRating} <span className="text-stone-300 text-2xl font-sans font-normal">/ 5.0</span>
              </h3>
              
              {/* Stars display */}
              <div className="flex items-center gap-1 text-[#A98436]">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isFilled = i < Math.round(avgRating);
                  return (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${isFilled ? 'fill-[#A98436] text-[#A98436]' : 'text-stone-200'}`} 
                    />
                  );
                })}
              </div>

              <div className="space-y-0.5">
                <p className="text-[12px] font-bold text-stone-700">Skor Kepuasan Kumulatif</p>
                <p className="text-[10px] text-stone-400 font-medium">Berdasarkan {totalReviewsCount} penilaian terverifikasi</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-[#A98436]/20 text-[#8E6E2B] text-[9px] font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-[#A98436]" /> 100% Syariah & Higienis
              </div>
            </div>

            {/* Middle and Right: Interactive Star Breakdown Bars */}
            <div className="md:col-span-2 flex flex-col justify-center space-y-2 relative z-10">
              <h4 className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider text-left mb-1">
                Distribusi Ulasan Shaliha
              </h4>

              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star] || 0;
                  const ratio = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                  const isCurrentFilter = selectedRating === star;

                  return (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(isCurrentFilter ? 'all' : star)}
                      className={`w-full flex items-center gap-3 group text-left p-1 rounded-lg hover:bg-[#FCFAF7]/80 active:scale-99 transition-all cursor-pointer ${
                        isCurrentFilter ? 'bg-[#FCFAF7] ring-1 ring-[#A98436]/15' : ''
                      }`}
                      title={`Filter ${star} bintang`}
                    >
                      <span className="text-[11px] font-extrabold text-stone-700 font-mono w-14 flex items-center gap-1 shrink-0">
                        {star} Bintang <Star className="w-3 h-3 text-[#A98436] fill-[#A98436] shrink-0" />
                      </span>

                      {/* Bar Container */}
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#D3B674] to-[#A98436] rounded-full transition-all duration-500" 
                          style={{ width: `${ratio}%` }}
                        />
                      </div>

                      {/* Count percentage */}
                      <span className="text-[10.5px] font-bold text-stone-500 font-mono w-10 text-right shrink-0">
                        {count} ({Math.round(ratio)}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </section>

          {/* RATING TABS HORIZONTAL REGISTRY */}
          <div className="flex flex-wrap items-center gap-2 select-none overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedRating('all')}
              className={`px-4 py-2 rounded-xl text-[10.5px] uppercase font-bold tracking-wider cursor-pointer active:scale-95 transition-all text-stone-850 shrink-0 ${
                selectedRating === 'all'
                  ? 'bg-gradient-to-b from-stone-900 to-stone-950 text-white shadow-sm'
                  : 'bg-white text-stone-605 border border-stone-200 hover:border-stone-300'
              }`}
            >
              Semua ({totalReviewsCount})
            </button>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const isActive = selectedRating === star;
              return (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`px-3.5 py-2 rounded-xl text-[10.5px] uppercase font-bold tracking-wider cursor-pointer active:scale-95 transition-all flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#A98436] to-[#D3B674] text-stone-950 font-extrabold shadow-sm'
                      : 'bg-white text-stone-605 border border-stone-200 hover:border-[#A98436]/40'
                  }`}
                >
                  {star} <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-stone-950 text-stone-950' : 'text-[#A98436] fill-[#A98436]'}`} /> ({count})
                </button>
              );
            })}
          </div>

          {/* REVIEWS GRID STREAM */}
          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center bg-gradient-to-br from-[#FDFBF7] via-[#FAF6EE] to-[#F5EFE4] border border-[#A98436]/25 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 shadow-sm max-w-md mx-auto select-none mt-4">
              <Heart className="w-10 h-10 text-[#A98436]/40 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-xs text-stone-600 font-bold">Belum Ada Ulasan Bintang {selectedRating}</p>
                <p className="text-[10.5px] text-stone-400">Silakan pilih filter ulasan bintang lainnya atau tulis ulasan baru Anda.</p>
              </div>
              <button
                onClick={() => setSelectedRating('all')}
                className="mt-1 text-[11px] font-semibold text-[#A98436] hover:underline"
              >
                Reset Filter Ulasan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredReviews.map((rev) => (
                <div 
                  key={rev.id}
                  className="bg-gradient-to-br from-[#FDFBF7] via-[#FAF6EE] to-[#F5EFE4] border border-[#A98436]/25 p-5 md:p-5.5 rounded-[32px] space-y-4 shadow-sm hover:shadow-md hover:border-[#A98436]/45 transition-all text-left flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Stars and date */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1 text-[#A98436]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#A98436] text-[#A98436]' : 'text-stone-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[8.5px] text-stone-400 font-medium flex items-center gap-1 font-mono">
                        <Calendar className="w-2.5 h-2.5 text-stone-350" /> {rev.createdAt ? rev.createdAt.split('T')[0] : 'Baru'}
                      </span>
                    </div>

                    {/* Comment text */}
                    <p className="text-[11.5px] text-stone-600 italic leading-relaxed font-sans font-normal break-words">
                      &ldquo;{rev.comment || 'Ritual perawatan yang sangat tenang, rapi dan menenangkan hati.'}&rdquo;
                    </p>
                  </div>

                  {/* Profile & Service bottom row */}
                  <div className="pt-3.5 border-t border-stone-50 flex items-center justify-between gap-3 select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-7.5 h-7.5 rounded-full bg-amber-50 border border-[#A98436]/35 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                        <img 
                          src={rev.userPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.userName || 'shaliha'}`} 
                          alt={rev.userName} 
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="leading-none text-left min-w-0">
                        <h5 className="text-[11px] font-black text-stone-900 truncate max-w-[110px]">{rev.userName || 'Pelanggan Setia'}</h5>
                        <span className="text-[8.5px] text-[#A98436] font-bold font-sans uppercase tracking-[0.05em]">Verified Buyer</span>
                      </div>
                    </div>
                    {rev.service && (
                      <span className="text-[8.5px] font-mono font-black bg-[#A98436]/10 text-[#8E6E2B] border border-[#A98436]/20 px-2 py-0.5 rounded-md max-w-[125px] truncate shrink-0" title={rev.service}>
                        {rev.service}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Core Trust Seal */}
          <div className="text-center py-4 opacity-60">
            <p className="text-[9.5px] text-stone-400 font-sans font-medium flex items-center justify-center gap-1 select-none">
              <MessageSquare className="w-3 h-3 text-[#A98436]" /> Semua ulasan di atas diisi secara sukarela oleh Shaliha Member berasaskan ukhuwah & kejujuran.
            </p>
          </div>
        </>
      )}

    </div>
  );
}
