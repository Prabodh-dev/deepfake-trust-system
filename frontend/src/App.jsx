import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './pages/Landing/Hero'
import Features from './pages/Landing/Features'
import Mission from './pages/Landing/Mission'
import Values from './pages/Landing/Values'
import CaseStudy from './pages/Landing/CaseStudy'
import Journal from './pages/Landing/Journal'
import Testimonial from './pages/Landing/Testimonial'
import Cta from './pages/Landing/Cta'
import Footer from './pages/Landing/Footer'

import Dashboard from './pages/Landing/Dashboard'
import Analysis from './pages/Landing/Analysis'
import Report from './pages/Landing/Report'
import History from './pages/Landing/History'

function Landing() {
  useEffect(() => {
    // Scroll reveal observer
    const revealEls = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    revealEls.forEach(el => observer.observe(el))
    
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Mission />
        <Values />
        <CaseStudy />
        <Journal />
        <Testimonial />
        <Cta />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  )
}
