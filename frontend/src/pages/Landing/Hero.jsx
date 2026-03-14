export default function Hero() {
  return (
    <section className="min-h-[100vh] bg-hero-gradient flex flex-col items-center justify-start pt-[140px] px-6 text-center overflow-hidden relative">
      <h1 className="font-serif text-[3rem] md:text-[5.5rem] leading-[1.08] tracking-[-0.03em] text-black max-w-[800px] animate-fade-up">
        Authenticity insights,<br />
        <strong className="block font-bold">built for trust</strong>
      </h1>
      
      <p className="text-base md:text-[1.1rem] text-gray-600 max-w-[500px] leading-[1.65] mt-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
        Evaluate authenticity signals, provenance strength, and manipulation risk across the entire media lifecycle.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-9 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <a href="#" className="btn-primary">Request a demo</a>
        <a href="#features" className="btn-secondary">Explore the platform</a>
      </div>
      
      {/* Restored Dashboard mockup — Deepfake variant */}
      <div className="mt-[52px] w-[min(820px,90vw)] animate-fade-up" style={{ animationDelay: '700ms' }}>
        <div className="bg-white rounded-t-[18px] border border-black/10 border-b-0 pt-7 px-7 shadow-[0_-4px_40px_rgba(0,0,0,0.08),0_4px_32px_rgba(0,0,0,0.04)] overflow-hidden text-left">
          <div className="mb-5">
            <h3 className="font-sans text-[0.95rem] font-semibold text-black">Analysis complete: interview_raw.mp4</h3>
            <p className="text-[0.8rem] text-gray-600 mt-[2px]">Your media trust metrics are ready to review.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Metric 1: Trust Score */}
            <div className="border border-gray-200 rounded-[10px] p-[14px_16px] relative">
              <div className="text-[0.7rem] text-gray-600 font-normal tracking-[0.01em] mb-2">Trust Score</div>
              <div className="flex items-end gap-3">
                <div className="font-serif text-[2rem] font-normal leading-none text-black">
                  56<sup className="text-[0.85rem] font-medium">%</sup>
                </div>
                <div className="w-[52px] h-[52px] bg-[#e8f000] rounded-[4px] shrink-0 ml-auto" />
              </div>
            </div>

            {/* Metric 2: Risk Level */}
            <div className="border border-gray-200 rounded-[10px] p-[14px_16px] relative">
              <div className="text-[0.7rem] text-gray-600 font-normal tracking-[0.01em] mb-2">Manipulation Risk</div>
              <div className="flex items-end gap-3" style={{ alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-gray-400 shrink-0">
                  <path d="M9 1v16M1 9h16M3.3 3.3l11.4 11.4M14.7 3.3L3.3 14.7" stroke="currentColor"/>
                </svg>
                <div className="font-serif text-[1.8rem] font-normal leading-none text-black ml-1.5">Medium</div>
              </div>
              <div className="text-[0.72rem] text-[#f59e0b] font-medium mt-1.5">Anomaly detected</div>
            </div>

            {/* Metric 3: Provenance */}
            <div className="border border-gray-200 rounded-[10px] p-[14px_16px] relative">
              <div className="flex gap-2.5 items-start">
                <div className="w-[52px] h-[52px] rounded-[6px] shrink-0 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4a7c59, #2d5a3d)' }}>
                  <div className="absolute inset-0" style={{ background: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 52 52%22><path d=%22M0 40 Q13 20 26 30 T52 25 L52 52 L0 52Z%22 fill=%22%234a7c59%22/><path d=%22M0 52 Q10 35 22 40 T52 32 L52 52Z%22 fill=%22%232d5a3d%22/></svg>') no-repeat center/cover" }} />
                  <span className="absolute top-[4px] right-[4px] bg-[#e8f000] text-[0.55rem] font-bold tracking-[0.05em] uppercase px-[5px] py-[2px] rounded-[3px] text-black">Traced</span>
                </div>
                <div className="text-[0.78rem] leading-[1.4] text-black font-normal pt-[2px]">
                  Compression history shows 2 re-encodings across platforms
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-[0.72rem] text-gray-600 mb-2.5">Signal variance across timeline</div>
            <div className="flex items-end h-[80px] relative border-l border-gray-200 pl-8">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[0.6rem] text-gray-400">
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className="flex gap-1 items-end h-full flex-1">
                {[28, 35, 42, 38, 50, 55, 60, 68, 72, 80, 75, 65, 58, 52, 40, 33, 25, 30, 22, 18].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-[2px] transition-opacity min-w-[8px] hover:opacity-70 ${h === 80 ? 'bg-black relative' : h < 50 ? 'bg-[#d0d0cc]' : 'bg-[#1a1a1a]'}`}
                    style={{ height: `${h}%` }}
                  >
                    {h === 80 && (
                      <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 bg-[#e8f000] text-[0.6rem] font-bold px-[5px] py-[1px] rounded-[3px] whitespace-nowrap">
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
