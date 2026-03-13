import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIGeneratedBadge({ show = false }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg shadow-sm shrink-0"
    >
      <Sparkles size={14} className="animate-pulse" />
      <span className="text-[0.65rem] font-bold uppercase tracking-wider">AI Generated</span>
    </motion.div>
  );
}
