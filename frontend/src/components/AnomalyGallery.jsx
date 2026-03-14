import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnomalyGallery - Displays timestamped forensic detections
 * and allows users to jump to the corresponding moment in the video.
 */
export default function AnomalyGallery({ manipulationRegions = [], onSeek }) {
  if (!manipulationRegions.length) return null;

  // backend/routes/analyze.py might return a nested structure: 
  // [{ timestamp: 2.73, regions: [...] }]
  // or a flat list if P1/P2 push variations.
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        {manipulationRegions.map((item, idx) => {
          const timestamp = item.timestamp ?? idx;
          const avgConfidence = item.regions 
            ? (item.regions.reduce((acc, r) => acc + r.confidence, 0) / item.regions.length)
            : 0.95;
          
          const colorClass = avgConfidence >= 0.8 ? "bg-red-500" : avgConfidence >= 0.5 ? "bg-amber-500" : "bg-emerald-500";
          const bgColorClass = avgConfidence >= 0.8 ? "bg-red-50" : avgConfidence >= 0.5 ? "bg-amber-50" : "bg-emerald-50";
          const textColorClass = avgConfidence >= 0.8 ? "text-red-600" : avgConfidence >= 0.5 ? "text-amber-600" : "text-emerald-600";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSeek && onSeek(timestamp)}
              className="group cursor-pointer bg-white/50 backdrop-blur-sm hover:bg-black border border-slate-100 hover:border-black rounded-[2rem] p-6 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-xl ${bgColorClass} flex items-center justify-center ${textColorClass} group-hover:bg-white/20 group-hover:text-white transition-colors`}>
                    <span className="material-symbols-outlined text-[18px]">videocam</span>
                  </div>
                  <span className="text-[1rem] font-bold text-slate-900 group-hover:text-white transition-colors font-serif">
                    Frame T+{timestamp}s
                  </span>
                </div>
                <span className={`text-[0.65rem] font-mono font-bold uppercase tracking-widest ${textColorClass} group-hover:text-white/60`}>
                  {Math.round(avgConfidence * 100)}% Conf.
                </span>
              </div>

              <div className="h-1.5 w-full bg-slate-100 group-hover:bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${avgConfidence * 100}%` }}
                  className={`h-full ${colorClass} group-hover:bg-white transition-colors`}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] text-slate-400 group-hover:text-white/40 uppercase tracking-[0.2em] font-bold">
                  {item.regions?.length || 1} artifact(s)
                </span>
                <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-white translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all">
                  arrow_forward
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[0.7rem] text-slate-400 italic text-center py-4 border-t border-slate-50">
        * Select any detection frame to analyze the corresponding timeline segment.
      </p>
    </div>
  );
}
