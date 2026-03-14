import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Film, Music, ChevronRight, Trash2, History } from 'lucide-react'

function getRiskColor(level) {
  if (level === 'LOW')    return '#22c55e'
  if (level === 'MEDIUM') return '#f59e0b'
  return '#ef4444'
}

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1)  return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function HistoryItem({ result, index, isActive, onClick }) {
  const riskColor = getRiskColor(result.risk_level)
  const isVideo = result.file_type?.startsWith('video')

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      className={`w-full text-left rounded-xl p-3 transition-all duration-200 group relative overflow-hidden ${
        isActive
          ? 'bg-white/10 border border-white/15'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Active glow line */}
      {isActive && (
        <motion.div
          layoutId="active-bar"
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
          style={{ background: riskColor, boxShadow: `0 0 8px ${riskColor}` }}
        />
      )}

      <div className="flex items-start gap-3 pl-1">
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${riskColor}15`, border: `1px solid ${riskColor}30` }}
        >
          {isVideo
            ? <Film className="w-3.5 h-3.5" style={{ color: riskColor }} />
            : <Music className="w-3.5 h-3.5" style={{ color: riskColor }} />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 truncate leading-tight">
            {result.filename}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-bold font-mono"
              style={{ color: riskColor }}
            >
              {result.trust_score}
            </span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs font-medium" style={{ color: riskColor }}>
              {result.risk_level}
            </span>
          </div>
        </div>

        {/* Time + arrow */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-white/25 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatRelativeTime(result.analyzed_at)}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
        </div>
      </div>
    </motion.button>
  )
}

export default function HistorySidebar({ history, activeId, onSelect, onClear }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white/50 uppercase tracking-wider text-xs">
            Recent Analyses
          </span>
        </div>
        {history.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-white/25 hover:text-white/60 transition-colors p-1 rounded"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
                <History className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-xs text-white/25 leading-relaxed max-w-[140px]">
                Analyzed media will appear here
              </p>
            </motion.div>
          ) : (
            history.slice(0, 5).map((result, i) => (
              <HistoryItem
                key={result.id}
                result={result}
                index={i}
                isActive={result.id === activeId}
                onClick={() => onSelect(result)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
