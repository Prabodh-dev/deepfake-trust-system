import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Center Section Content
  const renderCenter = () => {
    if (isLanding) {
      return (
        <ul className="hidden md:flex gap-12 items-center list-none ml-10">
          <li><a href="#features" className="text-[1rem] font-medium text-black/60 hover:text-black transition-colors">Product</a></li>
          <li><a href="#journal" className="text-[1rem] font-medium text-black/60 hover:text-black transition-colors">Forensics</a></li>
          <li><a href="#values" className="text-[1rem] font-medium text-black/60 hover:text-black transition-colors">About</a></li>
          <li><a href="#" className="text-[1rem] font-medium text-black/60 hover:text-black transition-colors">API</a></li>
        </ul>
      )
    }

    const dashboardLinks = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Analysis', path: '/analysis' },
      { name: 'Reports', path: '/reports' },
      { name: 'History', path: '/history' },
    ]

    return (
      <ul className="hidden md:flex items-center gap-12 list-none m-0 p-0">
        {dashboardLinks.map((link) => (
          <li key={link.name}>
            <Link
              className={clsx(
                "text-[1rem] font-medium transition-colors",
                location.pathname === link.path ? "text-black" : "text-black/60 hover:text-black"
              )}
              to={link.path}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  // Right Section Content
  const renderRight = () => {
    if (isLanding) {
      return (
        <Link to="/dashboard" className="flex items-center gap-2 text-[1.05rem] font-bold text-black border-2 border-black px-6 py-2.5 rounded-full hover:bg-black hover:text-white transition-all">
          Dashboard
        </Link>
      )
    }

    return (
      <div className="flex items-center gap-8">
        <div className="hidden lg:block relative group">
          <div className="flex items-center bg-black/5 backdrop-blur-sm rounded-full px-5 py-2.5 border border-transparent focus-within:bg-white focus-within:border-black/5 transition-all">
            <span className="material-symbols-outlined text-black/40 text-[20px]">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-black/40 outline-none p-0 ml-3" 
              placeholder="Search forensic ID..." 
              type="text" 
            />
          </div>
        </div>
        <div className="size-11 rounded-full bg-gray-100 border border-black/5 overflow-hidden ring-2 ring-transparent hover:ring-black/10 transition-all cursor-pointer">
          <img alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlMU5SBJKrtSN61UwsWtGJGK_BHXm4Wih19J4il9IqwX7IKvxQA2-f7RYPofBIShrbD7jruzRzYFjKiQ-kANaQ18PgdmPPf_8Wi9p5hz-GpzPtMLe9Fd_GyF5llYHUpjFZMqVPG2AoW3nZj1OBWKBBU5TH6XJ2-IcsbI6NZocGwDfLFDSOZGi0mrhG19_0m8bydlaGAU7Jnc4xtaht9bvMUt7hi4-PoaxbCnGMyR-kJSAtt2QtkHaKOmSQItbmWBv6NRS2Uzbosb0" className="w-full h-full object-cover" />
        </div>
      </div>
    )
  }

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-7 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-black/5 py-5' : 'bg-transparent'
      )}
    >
      <Link to="/" className="font-serif text-[1.4rem] tracking-tight text-black font-semibold">
        DeepShield
      </Link>
      
      {renderCenter()}
      {renderRight()}
    </nav>
  )
}
