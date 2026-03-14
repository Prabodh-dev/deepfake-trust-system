import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Chart, ArcElement, Tooltip, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, DoughnutController)

/**
 * TrustGauge — animated half-doughnut chart showing trust score 0-100.
 * Score >= 70 = green (trusted), 40-69 = amber (caution), < 40 = red (high risk)
 */
function getColor(score) {
  if (score >= 70) return { main: '#22c55e', glow: 'rgba(34,197,94,0.4)' }
  if (score >= 40) return { main: '#f59e0b', glow: 'rgba(245,158,11,0.4)' }
  return { main: '#ef4444', glow: 'rgba(239,68,68,0.4)' }
}

function getLabel(score) {
  if (score >= 70) return 'Trusted'
  if (score >= 40) return 'Caution'
  return 'High Risk'
}

export default function TrustGauge({ score = 0, animated = true }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const { main, glow } = getColor(score)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (chartRef.current) chartRef.current.destroy()

    // Start from 0 and animate to score
    let current = 0
    const target = score
    const step = target / 60 // 60 frames

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [0, 100, 100],
          backgroundColor: [main, 'rgba(255,255,255,0.06)', 'transparent'],
          borderWidth: 0,
          borderRadius: 4,
        }],
      },
      options: {
        circumference: 180,
        rotation: -90,
        cutout: '78%',
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        plugins: { tooltip: { enabled: false }, legend: { display: false } },
      },
    })

    if (!animated) {
      chartRef.current.data.datasets[0].data = [target, 100 - target, 100]
      chartRef.current.update('none')
      return
    }

    const interval = setInterval(() => {
      current = Math.min(current + step, target)
      chartRef.current.data.datasets[0].data = [current, 100 - current, 100]
      chartRef.current.data.datasets[0].backgroundColor[0] = getColor(current).main
      chartRef.current.update('none')
      if (current >= target) clearInterval(interval)
    }, 16)

    return () => {
      clearInterval(interval)
      chartRef.current?.destroy()
    }
  }, [score, animated, main])

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="relative w-52 h-28">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 40px ${glow}, 0 0 80px ${glow}30` }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <canvas ref={canvasRef} />

        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            className="font-mono font-bold text-4xl"
            style={{ color: main }}
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {score}
          </motion.span>
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
            Trust Score
          </span>
        </div>
      </div>

      {/* Gauge labels */}
      <div className="flex justify-between w-48 text-xs text-white/30 font-mono -mt-1">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>

      {/* Status pill */}
      <motion.div
        key={score}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        className="mt-1 px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide"
        style={{
          background: `${main}18`,
          color: main,
          border: `1px solid ${main}40`,
          boxShadow: `0 0 16px ${glow}`,
        }}
      >
        {getLabel(score)}
      </motion.div>
    </div>
  )
}
