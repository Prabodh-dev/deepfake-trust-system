import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react'

const RISK_CONFIG = {
  LOW: {
    label: 'Low Risk',
    description: 'Authenticity signals strong',
    icon: ShieldCheck,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.35)',
    glow: 'rgba(34,197,94,0.3)',
    pulse: '#22c55e',
  },
  MEDIUM: {
    label: 'Medium Risk',
    description: 'Some anomalies detected',
    icon: ShieldAlert,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.35)',
    glow: 'rgba(245,158,11,0.3)',
    pulse: '#f59e0b',
  },
  HIGH: {
    label: 'High Risk',
    description: 'Manipulation markers found',
    icon: ShieldX,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.35)',
    glow: 'rgba(239,68,68,0.35)',
    pulse: '#ef4444',
  },
}

export default function RiskBadge({ level = 'MEDIUM', size = 'lg' }) {
  const cfg = RISK_CONFIG[level] ?? RISK_CONFIG['MEDIUM']
  const Icon = cfg.icon

  const isLarge = size === 'lg'

  return (
    <motion.div
      key={level}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="relative inline-flex items-center gap-3 rounded-2xl"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 24px ${cfg.glow}`,
        padding: isLarge ? '14px 20px' : '8px 14px',
      }}
    >
      {/* Pulsing dot */}
      <span className="relative flex-shrink-0">
        <span
          className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping"
          style={{ background: cfg.pulse }}
        />
        <Icon
          className={isLarge ? 'w-6 h-6' : 'w-4 h-4'}
          style={{ color: cfg.color }}
        />
      </span>

      <div>
        <p
          className={`font-bold tracking-wide ${isLarge ? 'text-base' : 'text-sm'}`}
          style={{ color: cfg.color }}
        >
          {cfg.label}
        </p>
        {isLarge && (
          <p className="text-xs mt-0.5" style={{ color: `${cfg.color}80` }}>
            {cfg.description}
          </p>
        )}
      </div>

      {/* Corner flash for HIGH */}
      {level === 'HIGH' && (
        <motion.div
          className="absolute top-2 right-2"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <AlertTriangle className="w-3 h-3" style={{ color: cfg.color }} />
        </motion.div>
      )}
    </motion.div>
  )
}
