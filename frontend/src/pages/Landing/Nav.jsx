import { useState, useEffect } from 'react'
import clsx from 'clsx'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-300',
        scrolled ? 'bg-white/85 backdrop-blur-md border-b border-black/5' : 'bg-transparent'
      )}
    >
      <a href="#" className="font-serif text-lg tracking-tight text-black">DeepShield</a>
      <ul className="hidden md:flex gap-8 items-center list-none">
        <li><a href="#features" className="text-sm text-black hover:opacity-55 transition-opacity">Product</a></li>
        <li><a href="#journal" className="text-sm text-black hover:opacity-55 transition-opacity">Forensics</a></li>
        <li><a href="#values" className="text-sm text-black hover:opacity-55 transition-opacity">About</a></li>
        <li><a href="#" className="text-sm text-black hover:opacity-55 transition-opacity">API</a></li>
      </ul>
      <a href="#" className="flex items-center gap-1 text-sm font-medium text-black after:content-['→']">
        Get started
      </a>
    </nav>
  )
}
