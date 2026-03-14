import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export default function DashboardNav() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Reports', path: '/reports' },
    { name: 'History', path: '#' },
  ];

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-black/5 bg-white/80 backdrop-blur-md px-10 py-5 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 text-black">
          <div className="size-6 text-black">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-serif text-lg tracking-tight">DeepShield</h2>
        </Link>
        <nav className="hidden md:flex items-center gap-8 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              className={clsx(
                "text-sm font-medium transition-colors",
                location.pathname === link.path ? "border-b border-black pb-px text-black" : "text-gray-600 hover:text-black"
              )}
              to={link.path}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden sm:block">
          <label className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 focus-within:ring-1 ring-black/10 transition-all">
            <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-44 placeholder:text-gray-400 outline-none p-0 ml-2" placeholder="Search hash or ID..." type="text" />
          </label>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-85 transition-opacity">
          Upgrade
        </button>
        <div className="size-9 rounded-full bg-gray-200 border border-black/5 overflow-hidden">
          <img alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlMU5SBJKrtSN61UwsWtGJGK_BHXm4Wih19J4il9IqwX7IKvxQA2-f7RYPofBIShrbD7jruzRzYFjKiQ-kANaQ18PgdmPPf_8Wi9p5hz-GpzPtMLe9Fd_GyF5llYHUpjFZMqVPG2AoW3nZj1OBWKBBU5TH6XJ2-IcsbI6NZocGwDfLFDSOZGi0mrhG19_0m8bydlaGAU7Jnc4xtaht9bvMUt7hi4-PoaxbCnGMyR-kJSAtt2QtkHaKOmSQItbmWBv6NRS2Uzbosb0" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
