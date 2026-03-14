export default function Testimonial() {
  return (
    <section className="bg-black text-center px-6 md:px-12 py-16 md:py-24">
      <p className="font-serif text-[1.6rem] md:text-[2.8rem] leading-[1.3] text-white max-w-[800px] mx-auto mb-9 tracking-[-0.02em] reveal before:content-['\201C'] before:block before:text-[3rem] before:leading-none before:text-white/30 before:mb-2 text-balance">
        We finally moved past chasing perfect detection algorithms. Now we have multidimensional trust scores that tell the whole provenance story.
      </p>
      
      <div className="text-[0.875rem] text-white/50 reveal">
        <strong className="block text-white/85 font-medium mb-0.5">Sarah Chen</strong>
        Head of Digital Forensics, Veracity News
      </div>
    </section>
  )
}
