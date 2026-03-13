import React from 'react';
import { motion } from 'framer-motion';

const RISK_CONFIG = {
  LOW: {
    label: 'Low Risk',
    description: 'Authenticity signals strong',
    icon: 'verified_user',
    color: 'emerald',
    hex: '#10b981'
  },
  MEDIUM: {
    label: 'Medium Risk',
    description: 'Minor anomalies detected',
    icon: 'info',
    color: 'amber',
    hex: '#f59e0b'
  },
  HIGH: {
    label: 'High Risk',
    description: 'Critical deepfake markers',
    icon: 'warning',
    color: 'red',
    hex: '#ef4444'
  }
};

export default function RiskBadge({ level = 'MEDIUM', size = 'md' }) {
  const normLevel = level.toUpperCase();
  const cfg = RISK_CONFIG[normLevel] || RISK_CONFIG.MEDIUM;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border ${
        cfg.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
        cfg.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
        'bg-red-50 text-red-600 border-red-100 shadow-[0_4px_20px_rgba(239,68,68,0.1)]'
      }`}
    >
      <div className="relative">
        <span className={`material-symbols-outlined ${size === 'lg' ? 'text-[24px]' : 'text-[20px]'}`}>
          {cfg.icon}
        </span>
        {normLevel === 'HIGH' && (
          <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full animate-ping" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`font-bold uppercase tracking-wider ${size === 'lg' ? 'text-[0.75rem]' : 'text-[0.65rem]'}`}>
          {cfg.label}
        </span>
        <span className={`font-medium opacity-60 leading-none ${size === 'lg' ? 'text-[0.7rem]' : 'text-[0.6rem]'}`}>
          {cfg.description}
        </span>
      </div>
    </motion.div>
  );
}
