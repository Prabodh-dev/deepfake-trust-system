import React from 'react';
import { motion } from 'framer-motion';

const SIGNAL_META = {
  video: {
    label: 'Video Matrix',
    icon: 'videocam',
    color: 'emerald',
    description: 'Facial geometry and temporal stability'
  },
  audio: {
    label: 'Acoustics',
    icon: 'mic',
    color: 'emerald',
    description: 'Spectral fingerprint and noise floor'
  },
  metadata: {
    label: 'Provenance',
    icon: 'database',
    color: 'emerald',
    description: 'EXIF chain and codec integrity'
  }
};

const SignalBar = ({ score, color, i }) => {
  const getScoreColor = (s) => {
    if (s >= 70) return '#10b981';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const finalColor = getScoreColor(score);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-[0.15em] leading-none">Integrity Match</span>
        <span className="text-[1.1rem] font-bold font-serif leading-none" style={{ color: finalColor }}>{score}%</span>
      </div>
      <div className="h-2 w-full bg-gray-50 border border-black/[0.03] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: i * 0.2 }}
          className="h-full rounded-full"
          style={{ background: finalColor }}
        />
      </div>
    </div>
  );
};

export default function SignalBreakdown({ signals }) {
  if (!signals) return null;

  return (
    <div className="space-y-8">
      {Object.entries(signals).map(([key, data], i) => {
        const meta = SIGNAL_META[key] || { label: key, icon: 'analytics', color: 'emerald', description: 'Signal analysis' };
        return (
          <motion.div 
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col gap-4 group p-6 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-sm hover:bg-white/60 transition-all"
          >
            <div className="flex items-start gap-6">
              <div className="size-14 rounded-2xl bg-gray-50 border border-black/5 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[28px]">{meta.icon}</span>
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-[1.1rem] font-bold text-black font-serif leading-none mb-2 tracking-tight">{meta.label}</h4>
                <p className="text-[0.8rem] text-gray-400 font-medium leading-relaxed">{meta.description}</p>
              </div>
            </div>
            <SignalBar score={data.score || 85} i={i} />
          </motion.div>
        );
      })}

      {/* P4: AI Specific Signals */}
      {(signals.video?.ai_generated_score !== undefined || signals.audio?.tts_score !== undefined) && (
        <div className="pt-6 border-t border-black/5 space-y-6">
          <h5 className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest pl-2">Neural Generation Markers</h5>
          
          {signals.video?.ai_generated_score !== undefined && (
            <div className="p-6 rounded-3xl bg-purple-50/30 border border-purple-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <h4 className="text-[0.9rem] font-bold text-purple-900 leading-none">AI Video Score</h4>
              </div>
              <SignalBar score={Math.round(signals.video.ai_generated_score * 100)} i={4} />
            </div>
          )}

          {signals.audio?.tts_score !== undefined && (
            <div className="p-6 rounded-3xl bg-purple-50/30 border border-purple-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                </div>
                <h4 className="text-[0.9rem] font-bold text-purple-900 leading-none">TTS Audio Score</h4>
              </div>
              <SignalBar score={Math.round(signals.audio.tts_score * 100)} i={5} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
