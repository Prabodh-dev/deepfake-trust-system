import React from 'react';
import { motion } from 'framer-motion';

/**
 * AudioTimeline - Temporal map showing anomaly segments (TTS/Synthesis) 
 * across the audio duration.
 */
export default function AudioTimeline({ segments = [], duration = 100 }) {
  const hasAnomalies = segments && segments.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-1">
        <h5 className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
          Audio Temporal Scan
        </h5>
        {!hasAnomalies && (
          <span className="text-[0.6rem] font-bold text-emerald-500 uppercase tracking-widest">
            Scan Complete: Nominal
          </span>
        )}
      </div>

      <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        {hasAnomalies ? (
          <>
            {segments.map((seg, i) => {
              const left = (seg.start / duration) * 100;
              const width = ((seg.end - seg.start) / duration) * 100;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute top-0 bottom-0 bg-red-500 group cursor-help origin-left"
                  style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                    <div className="bg-slate-900 text-white text-[0.6rem] px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/10">
                      <span className="font-bold text-red-400 mr-2">{seg.start}s - {seg.end}s:</span>
                      {seg.reason || 'Sponsorship anomaly'}
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b border-white/10" />
                  </div>
                </motion.div>
              );
            })}
          </>
        ) : (
          <div className="absolute inset-0 bg-emerald-500/20" />
        )}
      </div>

      <div className="flex justify-between text-[0.6rem] font-mono text-slate-400 font-bold uppercase">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-slate-300" />
          <span>0.00s</span>
        </div>
        {!hasAnomalies && (
          <span className="text-emerald-600 font-bold">No audio anomalies detected</span>
        )}
        <div className="flex items-center gap-1.5">
          <span>{duration.toFixed(2)}s</span>
          <span className="size-1.5 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
