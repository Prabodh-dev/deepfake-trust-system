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
          data: [0, 100],
          backgroundColor: [main, 'rgba(0,0,0,0.05)'],
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
        layout: { padding: 0 },
        plugins: { tooltip: { enabled: false }, legend: { display: false } },
      },
    })

    if (!animated) {
      chartRef.current.data.datasets[0].data = [target, 100 - target]
      chartRef.current.update('none')
      return
    }

    const interval = setInterval(() => {
      current = Math.min(current + step, target)
      chartRef.current.data.datasets[0].data = [current, 100 - current]
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
    <div className="flex flex-col items-center select-none w-full max-w-[280px]">
      <div className="relative w-full aspect-[2/1] flex items-center justify-center">
        {/* Outer glow ring - positioned to follow the arc's top shadow */}
        <motion.div
          className="absolute inset-x-0 top-0 bottom-0 rounded-full pointer-events-none"
          style={{ 
            boxShadow: `0 -20px 60px ${glow}50`,
            height: '100%'
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* The Gauge Canvas */}
        <div className="w-full h-full relative">
          <canvas ref={canvasRef} />
          
          {/* Precise Labels - Positioned absolutely relative to the arc range */}
          <div className="absolute left-0 right-0 bottom-[-4px] flex justify-between px-1 text-[0.7rem] text-gray-400 font-bold font-mono uppercase tracking-tighter">
            <span>0</span>
            <span className="absolute left-1/2 -translate-x-1/2">50</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Score number and label moved under the arc */}
      <div className="flex flex-col items-center justify-center mt-10">
        <motion.span
          className="font-mono font-bold text-6xl leading-none text-center"
          style={{ color: main }}
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {score}%
        </motion.span>
        <p className="text-gray-400 text-[0.7rem] font-bold tracking-[0.25em] uppercase mt-3">
          Neural Provenance Score
        </p>
      </div>

      {/* Status pill */}
      <motion.div
        key={score}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        className="mt-8 px-8 py-2.5 rounded-full text-[0.85rem] font-bold tracking-[0.15em] uppercase"
        style={{
          background: `${main}15`,
          color: main,
          border: `1px solid ${main}40`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {getLabel(score)}
      </motion.div>
    </div>
  )
}
