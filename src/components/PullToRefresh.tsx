import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export default function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);
  const controls = useAnimation();

  const PULL_THRESHOLD = 55;
  const MAX_PULL = 90;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only trigger if we are at the very top of the window scroll
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && window.scrollY === 0) {
      // Apply a resistance logarithmic scale
      const damp = 0.45;
      const calculatedDistance = Math.min(MAX_PULL, diff * damp);
      setPullDistance(calculatedDistance);

      // Prevent window scroll/bounce on Safari/iOS if possible
      if (e.cancelable && diff > 10) {
        e.preventDefault();
      }
    } else {
      isPullingRef.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || disabled || isRefreshing) return;
    isPullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      // Subtle trigger haptic
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(15);
        } catch (_) {}
      }

      try {
        await onRefresh();
      } catch (err) {
        console.error("PullToRefresh callback error:", err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full"
    >
      {/* Pull Indicator Container */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute left-0 right-0 z-50 flex justify-center pointer-events-none"
          style={{
            top: `${Math.max(-25, pullDistance - 32)}px`,
            opacity: Math.min(1, pullDistance / PULL_THRESHOLD),
            transition: isPullingRef.current ? 'none' : 'top 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s'
          }}
        >
          <div className="w-9 h-9 rounded-full bg-white border border-[#EBE7DF]/80 shadow-[0_4px_16px_rgba(169,132,54,0.18)] flex items-center justify-center">
            <RefreshCw 
              className={`w-4.5 h-4.5 text-[#A98436] ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3.6}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.1s'
              }}
            />
          </div>
        </div>
      )}

      {/* Children content wrapper */}
      <motion.div
        animate={{
          y: isRefreshing ? PULL_THRESHOLD : pullDistance
        }}
        transition={
          isPullingRef.current 
            ? { type: 'just' } 
            : { type: 'spring', stiffness: 350, damping: 30 }
        }
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
