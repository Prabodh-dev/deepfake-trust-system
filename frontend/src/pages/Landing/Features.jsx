export default function Features() {
  const steps = [
    { num: '001', name: 'Analyze', desc: 'Examine signal-level artifacts in audio and video files.' },
    { num: '002', name: 'Trace', desc: 'Verify metadata integrity and track compression history.' },
    { num: '003', name: 'Score', desc: 'Generate a multidimensional trust score based on forensic evidence.' },
    { num: '004', name: 'Act', desc: 'Assign a risk level and surface clear explanations of manipulation.' },
  ]

  return (
    <section id="features" className="bg-white border-t border-gray-200 px-6 md:px-12 py-16 md:py-24">
      <div className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-12 reveal">Platform</div>
      
      <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-10 reveal">
        <h2 className="font-serif text-[2rem] md:text-[3rem] leading-[1.15] tracking-[-0.02em] max-w-[600px]">
          Everything you need to evaluate audio and video authenticity
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-gray-200 reveal">
        {steps.map((step, i) => (
          <div
            key={step.num}
            className="p-8 border-b sm:border-r border-gray-200 last:border-0 hover:bg-gray-100 transition-colors relative lg:border-b-0"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <span className="block text-[0.7rem] text-gray-400 font-medium tracking-[0.05em] mb-4">
              {step.num}
            </span>
            <div className="font-serif text-[1.4rem] text-black mb-2.5">
              {step.name}
            </div>
            <div className="text-[0.83rem] text-gray-600 leading-[1.6]">
              {step.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 reveal">
        <a href="#" className="btn-primary">Explore platform capabilities</a>
      </div>
    </section>
  )
}
