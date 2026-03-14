import { motion } from 'framer-motion'
import {
  FileSearch, Lock, Shield,
  Layers, Clock, ChevronRight, AlertTriangle,
} from 'lucide-react'

const PROVENANCE_CONFIG = {
  STRONG:   { color: '#22c55e', label: 'Strong', bar: 'w-full' },
  MODERATE: { color: '#f59e0b', label: 'Moderate', bar: 'w-2/3' },
  WEAK:     { color: '#ef4444', label: 'Weak', bar: 'w-1/3' },
}

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-white/30 flex-shrink-0" />
      <span className="text-sm text-white/50 flex-1">{label}</span>
      <span
        className="text-sm font-medium font-mono"
        style={{ color: highlight ?? 'rgba(255,255,255,0.8)' }}
      >
        {value}
      </span>
    </div>
  )
}

export default function ForensicReport({ report, filename, fileSize, fileType, analyzedAt }) {
  if (!report) return null

  const prov = PROVENANCE_CONFIG[report.provenance_strength] ?? PROVENANCE_CONFIG['MODERATE']
  const hasMarkers = report.manipulation_markers?.length > 0

  const displayDate = analyzedAt
    ? new Date(analyzedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl glass overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-purple/15 flex items-center justify-center glow-purple">
          <FileSearch className="w-5 h-5 text-accent-purple" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">Forensic Report</p>
          <p className="text-xs text-white/35 mt-0.5 font-mono truncate max-w-[200px]">{filename}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 border-b border-white/8">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Analysis Summary</p>
        <p className="text-sm text-white/75 leading-relaxed">{report.summary}</p>
      </div>

      {/* Metadata rows */}
      <div className="px-5 py-3 border-b border-white/8">
        <InfoRow icon={Clock}  label="Analyzed at"         value={displayDate} />
        <InfoRow icon={Layers} label="Compression events"  value={report.compression_history} />
        <InfoRow icon={Lock}   label="File size"           value={fileSize ? `${(fileSize / (1024*1024)).toFixed(1)} MB` : '—'} />
        <InfoRow icon={Shield} label="Format"              value={fileType ?? '—'} />
      </div>

      {/* Provenance strength */}
      <div className="px-5 py-4 border-b border-white/8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Provenance Strength</p>
          <span className="text-xs font-semibold" style={{ color: prov.color }}>{prov.label}</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: prov.color, boxShadow: `0 0 8px ${prov.color}` }}
            initial={{ width: '0%' }}
            animate={{ width: prov.bar.replace('w-', '').replace('full', '100%').replace('2/3', '66%').replace('1/3', '33%') }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      {/* Manipulation markers */}
      {hasMarkers && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
            <p className="text-xs font-medium text-accent-red uppercase tracking-wider">
              Manipulation Markers Detected
            </p>
          </div>
          <ul className="space-y-2">
            {report.manipulation_markers.map((marker, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="flex items-center gap-2 text-sm text-white/65"
              >
                <ChevronRight className="w-3.5 h-3.5 text-accent-red/60 flex-shrink-0" />
                {marker}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {!hasMarkers && (
        <div className="px-5 py-4">
          <p className="text-xs text-white/30 text-center">No manipulation markers detected</p>
        </div>
      )}
    </motion.div>
  )
}
