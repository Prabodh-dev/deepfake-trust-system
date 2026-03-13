import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 md:px-12 py-9 flex flex-col md:flex-row items-center justify-between gap-6">
      <a href="#" className="font-serif text-base text-black tracking-tight">
        DeepShield
      </a>
      
      <ul className="flex flex-wrap items-center justify-center gap-7 list-none">
        <li><a href="#" className="text-[0.83rem] text-gray-600 hover:text-black transition-colors">Product</a></li>
        <li><a href="#" className="text-[0.83rem] text-gray-600 hover:text-black transition-colors">Forensics</a></li>
        <li><a href="#" className="text-[0.83rem] text-gray-600 hover:text-black transition-colors">About</a></li>
        <li><a href="#" className="text-[0.83rem] text-gray-600 hover:text-black transition-colors">API</a></li>
      </ul>
      
      <div className="flex items-center gap-6">
        <span className="text-[0.78rem] text-gray-400">
          &copy; {new Date().getFullYear()} &middot; All rights reserved
        </span>
        <Link to="/dashboard" className="btn-footer-cta font-medium">Dashboard</Link>
      </div>
    </footer>
  )
}
