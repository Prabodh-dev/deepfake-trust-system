import { motion } from 'framer-motion'
import { Film, Music, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const SIGNAL_META = {
  video: {
    label: 'Video Signal',
    icon: Film,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.35)',
    description: 'Facial geometry, blink patterns, boundary artifacts',
  },
  audio: {
    label: 'Audio Signal',
    icon: Music,
    color: '#00f5ff',
    glow: 'rgba(0,245,255,0.35)',
    description: 'Frequency spectrum, vocal fingerprint, background noise',
  },
  metadata: {
    label: 'Metadata Integrity',
    icon: FileText,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    description: 'EXIF chain, codec fingerprint, timestamp analysis',
  },
}

function SignalBar({ score, color, delay = 0 }) {
  const getScoreColor = (s) => {
    if (s >= 70) return '#22c55e'
    if (s >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const barColor = getScoreColor(score)

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: barColor, boxShadow: `0 0 8px ${barColor}` }}
          initial={{ width: '0%' }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
      <span className="text-xs font-mono w-9 text-right" style={{ color: barColor }}>
        {score}
      </span>
    </div>
  )
}

function SignalCard({ signalKey, data }) {
  const [expanded, setExpanded] = useState(false)
  const meta = SIGNAL_META[signalKey]
  if (!meta || !data) return null
  const Icon = meta.icon

  const hasAnomalies = data.anomalies?.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border overflow-hidden"
      style={{
        background: `${meta.color}08`,
        borderColor: `${meta.color}25`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}18`, boxShadow: `0 0 12px ${meta.glow}` }}
        >
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">{meta.label}</p>
            {hasAnomalies && (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1 text-xs text-accent-red"
              >
                <AlertCircle className="w-3 h-3" />
                {data.anomalies.length} anomal{data.anomalies.length > 1 ? 'ies' : 'y'}
              </motion.span>
            )}
          </div>
          <p className="text-xs text-white/35 mt-0.5">{meta.description}</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="px-4 pb-3">
        <SignalBar score={data.score ?? 0} color={meta.color} delay={0.2} />
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-2 flex items-center justify-between text-xs text-white/40 hover:text-white/70 transition-colors border-t"
        style={{ borderColor: `${meta.color}15` }}
      >
        <span>View indicators</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expanded details */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-4 py-3 space-y-3">
          {/* Indicators */}
          {data.indicators?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Checked</p>
              <ul className="space-y-1">
                {data.indicators.map((ind, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Anomalies */}
          {hasAnomalies && (
            <div>
              <p className="text-xs font-medium text-accent-red/70 mb-2 uppercase tracking-wider">Anomalies</p>
              <ul className="space-y-1">
                {data.anomalies.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-accent-red/80">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SignalBreakdown({ signals }) {
  if (!signals) return null

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider px-0.5">
        Signal Breakdown
      </p>
      {Object.entries(signals).map(([key, data], i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SignalCard signalKey={key} data={data} />
        </motion.div>
      ))}
    </div>
  )
}
