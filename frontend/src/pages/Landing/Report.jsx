import { Link } from 'react-router-dom';
import DashboardNav from '../../components/DashboardNav';

export default function Report() {
  return (
    <div className="font-sans bg-white text-black min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <DashboardNav />

          <main className="flex-1">
            {/* Minimal Header with Signature Gradient */}
            <div className="bg-hero-gradient pt-16 pb-12 border-b border-black/5 px-10">
              <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">
                    <span>Analysis ID: 8842-XJ9L</span>
                    <span className="size-1 bg-gray-300 rounded-full"></span>
                    <span>Processed: Oct 24, 2023</span>
                  </div>
                  <h1 className="font-serif text-[3.2rem] leading-none tracking-tight text-black mb-3">Trust &amp; Attribution Report</h1>
                  <p className="text-gray-600 text-lg font-medium">Asset: <span className="text-black font-serif underline decoration-black/10">investor_brief_v2.mp4</span></p>
                </div>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2.5 px-6 py-3 bg-white/40 backdrop-blur-md border border-black/10 rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-white/80 transition-all">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2.5 px-6 py-3 bg-black text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:opacity-85 transition-all shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">file_download</span>
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-10 py-16 grid grid-cols-12 gap-12">
              {/* Left Column: Core Metrics */}
              <div className="col-span-12 lg:col-span-4 space-y-10">
                {/* Trust Score Card */}
                <div className="bg-white p-12 rounded-3xl border border-gray-100 flex flex-col items-center text-center shadow-[0_24px_48px_-12px_rgba(0,0,0,0.03)]">
                  <h3 className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">Aggregate Trust Score</h3>
                  <div className="relative size-52 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-gray-50" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="5"></circle>
                      <circle className="text-black" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="282.7" strokeDashoffset="42.4" strokeLinecap="round" strokeWidth="5"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-serif text-[4.2rem] leading-none text-black">85</span>
                      <span className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest mt-2 opacity-60">of 100</span>
                    </div>
                  </div>
                  <div className="mt-12 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[0.7rem] font-bold tracking-widest flex items-center gap-2.5 border border-emerald-100/50">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    HIGH CONFIDENCE
                  </div>
                </div>

                {/* Risk Level Indicator */}
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.3em] mb-8">Risk Severity</h3>
                  <div className="flex items-center gap-2 h-2 mb-4">
                    <div className="flex-1 h-full rounded-full bg-emerald-500"></div>
                    <div className="flex-1 h-full rounded-full bg-gray-100"></div>
                    <div className="flex-1 h-full rounded-full bg-gray-100"></div>
                  </div>
                  <div className="flex justify-between text-[0.65rem] font-bold text-gray-300 tracking-[0.2em]">
                    <span>LOW</span>
                    <span>MEDIUM</span>
                    <span>HIGH</span>
                  </div>
                  <p className="mt-8 text-[0.9rem] text-gray-600 font-medium leading-relaxed font-serif italic opacity-80">
                    "Low risk detected. Minor metadata inconsistencies found but authenticity signals remain within stable historic thresholds."
                  </p>
                </div>
              </div>

              {/* Middle/Right Column: Analysis Details */}
              <div className="col-span-12 lg:col-span-8 space-y-12">
                {/* Provenance Map */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-[0.7rem] font-bold text-black uppercase tracking-[0.2em]">Asset Provenance History</h3>
                    <span className="text-[0.6rem] font-bold text-gray-400">4 ENTRIES FOUND</span>
                  </div>
                  <div className="p-12">
                    <div className="relative flex items-center justify-between gap-6 max-w-4xl mx-auto">
                      <div className="absolute top-[26px] left-0 w-full h-[1px] bg-gray-100 -z-0"></div>
                      {[
                        { label: 'Origin', detail: 'Sony Alpha 7IV', icon: 'camera_alt', color: 'black' },
                        { label: 'Platform', detail: 'AWS S3 Ingest', icon: 'cloud_upload', color: 'black' },
                        { label: 'Edited', detail: 'Adobe Premiere', icon: 'edit', color: 'gray' },
                        { label: 'Current', detail: 'Public CDN', icon: 'location_on', color: 'black', active: true }
                      ].map((node, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center">
                          <div className={`size-14 rounded-2xl flex items-center justify-center mb-5 border transition-all ${
                            node.active ? 'bg-black text-white border-black shadow-xl scale-110' : 'bg-white text-gray-400 border-gray-100 hover:border-black/10'
                          }`}>
                            <span className="material-symbols-outlined text-[20px]">{node.icon}</span>
                          </div>
                          <span className="text-[0.75rem] font-bold text-black uppercase tracking-[0.15em]">{node.label}</span>
                          <span className="text-[0.65rem] text-gray-400 font-medium mt-1.5">{node.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Detailed Signals */}
                  <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-[0.7rem] font-bold text-black uppercase tracking-[0.2em] mb-8">Authenticity Signals</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'C2PA Manifest', status: 'VALID', desc: 'Cryptographic link secure' },
                        { name: 'Source Verification', status: 'MATCHED', desc: 'Hardware ID verified' },
                        { name: 'Camera Signature', status: 'SECURE', desc: 'Sensor noise pattern match' }
                      ].map((sig, i) => (
                        <div key={i} className="group flex items-center justify-between p-5 bg-gray-50/50 border border-black/[0.03] rounded-2xl hover:border-black/5 transition-all">
                          <div className="flex flex-col">
                            <span className="text-[0.8rem] font-bold text-black tracking-tight">{sig.name}</span>
                            <span className="text-[0.65rem] text-gray-400 font-medium mt-0.5">{sig.desc}</span>
                          </div>
                          <span className="text-[0.65rem] font-bold text-emerald-500 tracking-[0.1em]">{sig.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Timeline */}
                  <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-[0.7rem] font-bold text-black uppercase tracking-[0.2em] mb-8">Process Timeline</h3>
                    <div className="space-y-8">
                      {[
                        { time: '14:32:01', task: 'Cryptographic result mapped' },
                        { time: '14:31:55', task: 'Manifest structure extraction' },
                        { time: '14:31:48', task: 'Neural packet inspection' }
                      ].map((step, i) => (
                        <div key={i} className="relative pl-8 border-l border-gray-100 last:border-transparent pb-2 transition-opacity hover:opacity-100 opacity-80">
                          <div className="absolute -left-[4.5px] top-0 size-2 rounded-full bg-black ring-4 ring-white"></div>
                          <p className="text-[0.6rem] font-bold text-gray-300 uppercase tracking-widest leading-none mb-2">{step.time}</p>
                          <p className="text-[0.85rem] font-medium text-gray-700 leading-tight">{step.task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="footer-standard px-10 py-12 border-t border-gray-50 max-w-[1440px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-gray-400">© 2024 DeepShield Ecosystem</span>
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-black/[0.03] rounded-xl">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-[0.2em]">Global Nodes Active</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
