import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function HistorySidebar({ history, onSelect, activeId }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-80 shrink-0 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-400">history</span>
          <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-black">Analysis History</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
        {history && history.length > 0 ? (
          history.slice(0, 5).map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect && onSelect(item)}
              className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer group ${
                activeId === item.id 
                  ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                  : 'bg-white text-black border-gray-100 hover:border-black/10 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[1rem] font-bold font-serif leading-tight truncate flex-1">
                    {item.filename || item.file_name || 'Unnamed Analysis'}
                  </span>
                  <div className={`size-2 rounded-full mt-1.5 shrink-0 ${
                    item.risk_level === 'HIGH' ? 'bg-red-500' : 
                    item.risk_level === 'LOW' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[0.8rem] font-bold font-mono ${
                      activeId === item.id ? 'text-white/60' : 'text-gray-400'
                    }`}>
                      {item.trust_score}%
                    </span>
                    <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${
                      activeId === item.id ? 'text-white/40' : 'text-gray-300'
                    }`}>
                      Trust
                    </span>
                  </div>
                  <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${
                    activeId === item.id ? 'text-white/40' : 'text-gray-300'
                  }`}>
                    {item.analyzed_at ? new Date(item.analyzed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-20">
            <span className="material-symbols-outlined text-5xl">inventory_2</span>
            <p className="text-sm font-bold uppercase tracking-widest">No history found</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-50 bg-gray-50/30">
        <button 
          onClick={() => navigate('/history')}
          className="w-full py-4 rounded-xl border border-gray-100 text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:bg-white transition-all active:scale-[0.98]"
        >
          View Archives
        </button>
      </div>
    </div>
  );
}
