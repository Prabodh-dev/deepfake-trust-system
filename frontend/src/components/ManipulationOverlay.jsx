import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

/**
 * ManipulationOverlay - Draws red bounding boxes on a heatmap image 
 * based on spatial manipulation regions.
 * 
 * @param {string} image - Heatmap image URL
 * @param {Array} regions - Array of { x, y, w, h, confidence }
 * @param {string} riskLevel - High or Medium
 */
export default function ManipulationOverlay({ image, regions = [], riskLevel = 'Low' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!image || !regions.length) return null;

  const isMedium = riskLevel.toLowerCase() === 'medium';

  return (
    <div className="space-y-4">
      {isMedium && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
          <Info className="w-4 h-4 text-amber-500" />
          <p className="text-[0.65rem] font-bold text-amber-700 uppercase tracking-widest">
            Possible manipulation detected — confidence is moderate
          </p>
        </div>
      )}

      <div className="relative rounded-[2rem] overflow-hidden border border-black/5 bg-gray-50 group">
        <img 
          src={image} 
          alt="Manipulation Heatmap" 
          className="w-full h-auto block"
        />

        {/* Bounding Boxes */}
        <div className="absolute inset-0 pointer-events-none">
          {regions.map((box, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="absolute border-2 border-red-500 pointer-events-auto cursor-help group/box"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                opacity: box.confidence,
                boxShadow: `0 0 15px rgba(239, 68, 68, ${box.confidence * 0.3})`,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
                  >
                    <div className="bg-black/90 backdrop-blur-md text-white text-[0.6rem] font-mono py-1.5 px-3 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap">
                      Suspicious Region — confidence: {Math.round(box.confidence * 100)}%
                    </div>
                    <div className="w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/10 mx-auto -mt-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Scan effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-1/4 w-full animate-scan pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
