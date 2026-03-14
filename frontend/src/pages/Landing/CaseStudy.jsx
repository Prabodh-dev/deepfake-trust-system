export default function CaseStudy() {
  return (
    <section className="bg-white border-t border-gray-200 px-6 md:px-12 py-16 md:py-24 flex flex-col lg:flex-row gap-20 items-center">
      <div className="flex-1 reveal w-full">
        <div className="text-[0.78rem] font-medium tracking-[0.08em] uppercase text-gray-400 mb-6">
          Customer story
        </div>
        <h2 className="font-serif text-[1.8rem] md:text-[2.5rem] leading-[1.2] tracking-[-0.02em] mb-5">
          Why Global Media Desk chose DeepShield
        </h2>
        <p className="text-[0.9rem] text-gray-600 leading-[1.75] mb-8 max-w-[480px]">
          With generative AI models flooding newsrooms, Global Media Desk turned to DeepShield to verify incoming footage. The result? Total confidence in sourcing, zero published fakes, and instant risk scoring.
        </p>
        
        <a href="#" className="btn-primary mb-10">Read case study</a>
        
        <div className="flex flex-wrap lg:flex-nowrap gap-12 mt-10">
          <div className="border-t-2 border-black pt-4 min-w-[120px]">
            <div className="font-serif text-[2.4rem] tracking-[-0.02em]">98%</div>
            <div className="text-[0.8rem] text-gray-600 mt-1">Detection Accuracy</div>
          </div>
          <div className="border-t-2 border-black pt-4 min-w-[120px]">
            <div className="font-serif text-[2.4rem] tracking-[-0.02em]">&lt;1s</div>
            <div className="text-[0.8rem] text-gray-600 mt-1">Processing Time</div>
          </div>
          <div className="border-t-2 border-black pt-4 min-w-[120px]">
            <div className="font-serif text-[2.4rem] tracking-[-0.02em]">0</div>
            <div className="text-[0.8rem] text-gray-600 mt-1">False Flags</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 reveal w-full flex justify-center">
        <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-[#1e1e24] via-[#2a2a35] to-[#1e1e24] relative overflow-hidden flex flex-col justify-end p-6 border border-gray-200">
          <div className="absolute inset-0 opacity-20" style={{
             backgroundImage: "url('data:image/svg+xml,<svg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"2\" cy=\"2\" r=\"1\" fill=\"white\"/></svg>')",
             backgroundSize: '20px 20px'
          }} />
          <div className="text-[0.78rem] tracking-[0.05em] uppercase text-white/70 relative z-10">
            Global Media Desk &middot; Verification Pipeline
          </div>
        </div>
      </div>
    </section>
  )
}
