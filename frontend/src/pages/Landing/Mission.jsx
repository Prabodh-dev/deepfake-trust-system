import { motion } from 'framer-motion';

export default function Mission() {
  const cards = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20M2 12h20" />
        </svg>
      ),
      title: "Clarity drives action",
      desc: "We believe better decisions start with better data—measured, visible, and trusted forensic evidence."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      ),
      title: "Detection as a system",
      desc: "We build tools that help teams connect the dots between signal manipulation and operational accountability."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16l4-4-4-4M8 12h8" />
        </svg>
      ),
      title: "Evidence over speculation",
      desc: "We support real-world momentum—helping organizations move from doubt to measurable verification at scale."
    }
  ];

  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden bg-[#f2efe8]">
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="max-w-[1240px] mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-[2.8rem] md:text-[4.5rem] leading-[1] text-[#1a1a1a] mb-2"
          >
            Built for clarity
          </motion.h2>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[2.8rem] md:text-[4.5rem] leading-[1] font-bold text-[#1a1a1a] tracking-tight"
          >
            Designed for action
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-white rounded-[1.25rem] p-10 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white/50 flex flex-col h-full"
            >
              <div className="text-[#1a1a1a] mb-12">
                {card.icon}
              </div>
              <h3 className="text-[1.35rem] font-bold text-[#1a1a1a] mb-4 leading-tight">
                {card.title}
              </h3>
              <p className="text-[0.95rem] text-gray-700 leading-relaxed font-medium opacity-80">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
