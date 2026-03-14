import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="min-h-[90vh] bg-hero-gradient flex flex-col items-center justify-start pt-[140px] px-6 text-center relative">
      <h1 className="font-serif text-[4.5rem] md:text-[7.2rem] leading-[1] tracking-[-0.04em] text-black max-w-[1000px] animate-fade-up">
        Authenticity insights,<br />
        <strong className="block font-bold mt-2">built for trust</strong>
      </h1>
      
      <p className="text-lg md:text-[1.25rem] text-gray-500 max-w-[650px] leading-[1.6] mt-8 animate-fade-up font-medium" style={{ animationDelay: '150ms' }}>
        Evaluate authenticity signals, provenance strength, and manipulation risk across the entire media lifecycle.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <Link to="/dashboard" className="btn-primary px-8 py-4">Go to Dashboard</Link>
        <a href="#features" className="btn-secondary px-8 py-4">Explore the platform</a>
      </div>
      
      <div className="mt-[52px] w-[min(1140px,96vw)] animate-fade-up relative -mb-[340px] z-10" style={{ animationDelay: '700ms' }}>
        <div className="bg-white rounded-[32px] border border-black/10 pt-12 px-10 pb-20 shadow-[0_48px_80px_-16px_rgba(0,0,0,0.14)] overflow-hidden text-left">
          <div className="mb-10">
            <h3 className="font-sans text-[1.2rem] font-semibold text-black">Analysis complete: interview_raw.mp4</h3>
            <p className="text-[0.95rem] text-gray-500 mt-[4px]">Your media trust metrics are ready to review. All forensic nodes reported stable data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Metric 1: Trust Score */}
            <div className="border border-gray-100 rounded-[14px] p-[24px_28px] relative bg-gray-50/30">
              <div className="text-[0.8rem] text-gray-400 font-bold uppercase tracking-widest mb-4">Trust Score</div>
              <div className="flex items-end gap-3">
                <div className="font-serif text-[3.2rem] font-normal leading-none text-black">
                  56<sup className="text-[1.2rem] font-medium ml-1">%</sup>
                </div>
                <div className="w-[64px] h-[64px] bg-[#e8f000] rounded-[6px] shrink-0 ml-auto" />
              </div>
            </div>

            {/* Metric 2: Risk Level */}
            <div className="border border-gray-100 rounded-[14px] p-[24px_28px] relative bg-gray-50/30">
              <div className="text-[0.8rem] text-gray-400 font-bold uppercase tracking-widest mb-4">Manipulation Risk</div>
              <div className="flex items-end gap-3" style={{ alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 shrink-0">
                  <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <div className="font-serif text-[2.6rem] font-normal leading-none text-black ml-3">Medium</div>
              </div>
              <div className="text-[0.85rem] text-[#f59e0b] font-bold mt-3">Anomaly detected</div>
            </div>

            {/* Metric 3: Provenance */}
            <div className="border border-gray-100 rounded-[14px] p-[24px_28px] relative bg-gray-50/30">
              <div className="flex gap-4 items-start">
                <div className="w-[64px] h-[64px] rounded-[8px] shrink-0 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4a7c59, #2d5a3d)' }}>
                  <div className="absolute inset-0" style={{ background: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 52 52%22><path d=%22M0 40 Q13 20 26 30 T52 25 L52 52 L0 52Z%22 fill=%22%234a7c59%22/><path d=%22M0 52 Q10 35 22 40 T52 32 L52 52Z%22 fill=%22%232d5a3d%22/></svg>') no-repeat center/cover" }} />
                  <span className="absolute top-[6px] right-[6px] bg-[#e8f000] text-[0.6rem] font-bold tracking-[0.05em] uppercase px-[6px] py-[3px] rounded-[4px] text-black shadow-sm">Traced</span>
                </div>
                <div className="text-[0.9rem] leading-[1.5] text-black font-medium pt-[4px]">
                  Compression history shows 2 re-encodings across platforms
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="border-t border-gray-100 pt-8 mt-4">
            <div className="text-[0.8rem] font-bold uppercase tracking-widest text-gray-400 mb-6">Signal variance across timeline</div>
            <div className="flex items-end h-[120px] relative border-l border-gray-100 pl-10">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[0.7rem] font-bold text-gray-300">
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className="flex gap-1.5 items-end h-full flex-1">
                {[28, 35, 42, 38, 50, 55, 60, 68, 72, 80, 75, 65, 58, 52, 40, 33, 25, 30, 22, 18].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-[3px] transition-all min-w-[10px] hover:opacity-70 ${h === 80 ? 'bg-black relative' : h < 50 ? 'bg-gray-100' : 'bg-black/80'}`}
                    style={{ height: `${h}%` }}
                  >
                    {h === 80 && (
                      <div className="absolute -top-[24px] left-1/2 -translate-x-1/2 bg-[#e8f000] text-[0.7rem] font-black px-[8px] py-[4px] rounded-[4px] whitespace-nowrap shadow-sm">
                        0:14
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
