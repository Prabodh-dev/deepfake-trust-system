import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Features() {
  const steps = [
    { num: '001', name: 'Analyze', desc: 'Examine signal-level artifacts in audio and video files.' },
    { num: '002', name: 'Trace', desc: 'Verify metadata integrity and track compression history.' },
    { num: '003', name: 'Score', desc: 'Generate a multidimensional trust score based on forensic evidence.' },
    { num: '004', name: 'Act', desc: 'Assign a risk level and surface clear explanations.' },
  ]

  return (
    <section id="features" className="bg-white px-6 md:px-12 py-24 md:py-32">
      {/* Centered Large Header */}
      <div className="max-w-[700px] mx-auto text-center mb-24 md:mb-32">
        <h2 className="font-serif text-[2.5rem] md:text-[3.8rem] leading-[1.05] tracking-[-0.04em] text-black">
          Everything you need to evaluate authenticity
        </h2>
      </div>

      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left Column: Screenshot-Matched Visual */}
        <div className="relative aspect-[1.1/1] w-full rounded-[2.5rem] overflow-hidden bg-[#f0f4f8] flex items-center justify-center p-12">
          {/* Soft background visual */}
          <div className="absolute inset-0">
            <img 
              src="/verification_visual.png" 
              className="w-full h-full object-cover scale-150 blur-2xl opacity-30 grayscale-[30%]"
              alt=""
            />
          </div>
          
          {/* The Floating Data Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[440px] aspect-[1.8/1] bg-white rounded-[1rem] shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-10 flex flex-col justify-between border border-white"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-[0.7rem] uppercase tracking-widest text-gray-400 font-bold">Signal Persistence</span>
              {/* Star-like icon from screenshot */}
              <div className="text-gray-900 opacity-80">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5 mt-auto">
              <div className="text-[3.5rem] md:text-[4.2rem] font-serif tracking-tighter text-black leading-none flex items-baseline">
                98.2<span className="text-[1.1rem] ml-1.5 font-sans font-medium text-gray-400 italic">MWh</span>
              </div>
              <div className="flex items-center gap-1 text-[0.75rem] font-bold text-blue-500 justify-end mt-[-10px]">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                <span>↓ 12.4%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Steps & CTA */}
        <div className="flex flex-col pr-4">
          <div className="border-t border-gray-100 mb-10">
            {steps.map((step) => (
              <div key={step.num} className="py-10 border-b border-gray-100 flex justify-between items-start group">
                <div className="max-w-[85%]">
                  <h3 className="font-serif text-[1.4rem] md:text-[1.5rem] font-medium text-black mb-3.5 group-hover:text-black/70 transition-colors">
                    {step.name}
                  </h3>
                  <p className="text-[0.92rem] text-gray-500 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
                <span className="font-mono text-[0.7rem] font-bold text-gray-300 mt-2 tracking-tighter">
                  {step.num}
                </span>
              </div>
            ))}
          </div>

          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-black text-white text-[0.72rem] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-gray-900 transition-all">
              <span className="size-1 bg-white rounded-full" />
              Explore features
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
