export default function Values() {
  const values = [
    {
      title: 'Binary labels fail',
      desc: 'A simple "fake / real" label is weak. We measure provenance and trust across the entire lifecycle.'
    },
    {
      title: 'Context matters',
      desc: 'Real content gets compressed, forwarded, and re-uploaded. We trace origin and alteration history.'
    },
    {
      title: 'Actionable forensics',
      desc: 'Modern generative models are highly realistic. We surface clear signs of manipulation and quantify the risk.'
    }
  ]

  return (
    <section id="values" className="bg-gray-100 border-t border-gray-200 px-6 md:px-12 py-16 md:py-24">
      <div className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-12">Our principles</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
        {values.map((v, i) => (
          <div key={i}>
            <h3 className="font-serif text-[1.5rem] tracking-[-0.01em] text-black mb-3">
              {v.title}
            </h3>
            <p className="text-[0.875rem] text-gray-600 leading-[1.7]">
              {v.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
