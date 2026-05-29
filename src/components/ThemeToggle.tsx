import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative p-2.5 rounded-xl border flex items-center justify-center transition-all ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300 shadow-lg shadow-black/10' 
          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 shadow-sm shadow-slate-100'
      }`}
      title={isDark ? '라이트 모드로 변경' : '다크 모드로 변경'}
      id="theme-toggle-btn"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {isDark ? (
          <Sun className="w-5 h-5 flex-shrink-0" />
        ) : (
          <Moon className="w-5 h-5 flex-shrink-0" />
        )}
      </motion.div>
    </button>
  );
}
