import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    // Native Android-like haptic tick on mount
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (type === 'error') {
          navigator.vibrate([15, 60, 15]); // Double tick for warning/error
        } else {
          navigator.vibrate(12); // Single soft tick for success
        }
      } catch (_) {}
    }
  }, [type]);

  const bgClass = 
    type === 'success' 
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800' 
      : type === 'error' 
      ? 'border-rose-200 bg-rose-50 text-rose-800' 
      : 'border-gold-200 bg-gold-50 text-gold-800';

  const icon = 
    type === 'success' 
      ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> 
      : type === 'error' 
      ? <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" /> 
      : <CheckCircle className="w-5 h-5 text-gold-600 shrink-0" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl ${bgClass} max-w-sm w-[90%]`}
    >
      {icon}
      <span className="text-sm font-medium mr-auto">{message}</span>
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X className="w-4 h-4 opacity-60" />
      </button>
    </motion.div>
  );
}
