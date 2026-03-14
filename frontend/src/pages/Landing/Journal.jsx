export default function Journal() {
  const articles = [
    {
      tag: 'Forensics · 4 min',
      title: 'How Forensic Traces Degrade Across Social Platforms',
      bgClass: 'bg-gradient-to-br from-[#1a3a4d] to-[#2a5a6d]'
    },
    {
      tag: 'Strategy · 7 min',
      title: 'Why Binary "Fake/Real" Bounding Boxes Aren\'t Enough',
      bgClass: 'bg-gradient-to-br from-[#2d4a2d] to-[#4a7a4a]'
    },
    {
      tag: 'Insights · 5 min',
      title: 'Inside DeepShield: How We Quantify Manipulation Risk',
      bgClass: 'bg-gradient-to-br from-[#3a2d1a] to-[#6a5a3a]'
    }
  ]

  return (
    <section id="journal" className="bg-white border-t border-gray-200 px-6 md:px-12 py-16 md:py-24">
      <div className="flex justify-between items-end mb-12 reveal">
        <h2 className="font-serif text-[2rem] md:text-[2.8rem] tracking-[-0.02em] text-black">
          From the journal
        </h2>
        <a href="#" className="btn-footer-cta pb-0 hidden md:inline-flex">View all forensics</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <div
            key={i}
            className="group border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] reveal"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className={`h-[180px] w-full relative overflow-hidden ${article.bgClass}`} />
            
            <div className="p-5 bg-white">
              <div className="text-[0.7rem] font-semibold tracking-[0.06em] uppercase text-gray-400">
                {article.tag}
              </div>
              <h3 className="font-serif text-[1.1rem] leading-[1.4] mt-2 text-black group-hover:text-gray-600 transition-colors">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
