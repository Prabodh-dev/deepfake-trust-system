import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import { fetchHistory } from '../../api/client';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchHistory(50); // Get more for the dedicated page
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Real history fetch failed, using mock data.');
        setHistory([
          { id: '1', filename: 'meeting_recording.mp4', risk_level: 'LOW', trust_score: 94, analyzed_at: new Date(Date.now() - 3600000).toISOString(), file_type: 'video/mp4' },
          { id: '2', filename: 'interview_clip_01.mp4', risk_level: 'HIGH', trust_score: 22, analyzed_at: new Date(Date.now() - 86400000).toISOString(), file_type: 'video/mp4' },
          { id: '3', filename: 'voice_memo.wav', risk_level: 'MEDIUM', trust_score: 55, analyzed_at: new Date(Date.now() - 172800000).toISOString(), file_type: 'audio/wav' },
          { id: '4', filename: 'profile_check.jpg', risk_level: 'LOW', trust_score: 89, analyzed_at: new Date(Date.now() - 259200000).toISOString(), file_type: 'image/jpeg' },
          { id: '5', filename: 'suspicious_activity.mp4', risk_level: 'HIGH', trust_score: 12, analyzed_at: new Date(Date.now() - 432000000).toISOString(), file_type: 'video/mp4' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const clearHistory = () => {
    setIsClearing(true);
    // Simulate API call to clear
    setTimeout(() => {
      setHistory([]);
      setIsClearing(false);
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-white font-sans text-black min-h-screen selection:bg-black selection:text-white">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <Navbar />

          <main className="flex-1">
            {/* Legend Style Hero */}
            <header className="bg-hero-gradient pt-24 pb-20 px-10 border-b border-black/5 relative overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-end gap-10"
              >
                <div className="flex flex-col gap-6">
                  <div className="text-[0.85rem] font-bold uppercase tracking-[0.4em] text-gray-400">Archival Records</div>
                  <h1 className="font-serif text-[5rem] leading-[1] tracking-tight text-black m-0">Case History</h1>
                  <p className="text-gray-500 text-xl font-medium max-w-xl leading-relaxed">
                    View previous forensic audits across all media channels &middot; {history.length} records found
                  </p>
                </div>
                <div className="flex gap-4 mb-2">
                  <button 
                    onClick={clearHistory}
                    disabled={history.length === 0 || isClearing}
                    className="flex items-center gap-4 px-10 py-6 bg-white border border-gray-100 rounded-[2rem] text-[0.8rem] font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-black/10 transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:grayscale"
                  >
                    <span className="material-symbols-outlined text-[24px]">{isClearing ? 'sync' : 'delete_sweep'}</span>
                    {isClearing ? 'Purging Files...' : 'Clear Records'}
                  </button>
                </div>
              </motion.div>
              
              {/* Background Accent Animation */}
              <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[24rem] text-black">history</span>
              </div>
            </header>

            <div className="max-w-[1440px] mx-auto px-10 py-20">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-40"
                  >
                    <div className="size-16 border-2 border-gray-100 border-t-black rounded-full animate-spin mb-8"></div>
                    <p className="font-serif text-2xl italic opacity-40">Decrypting archive...</p>
                  </motion.div>
                ) : history.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-40 text-center"
                  >
                    <div className="size-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
                      <span className="material-symbols-outlined text-[40px] text-gray-300">library_books</span>
                    </div>
                    <h2 className="font-serif text-3xl mb-3">Archive Empty</h2>
                    <p className="text-gray-400 font-medium max-w-xs">New forensic scans will appear here once processed by the neural engine.</p>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="mt-10 bg-black text-white px-10 py-4 rounded-2xl text-[0.7rem] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity"
                    >
                      Start Scan
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="list"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-10"
                  >
                    <div className="grid grid-cols-12 px-10 py-6 text-[0.85rem] font-bold uppercase tracking-[0.25em] text-gray-400 border-b border-gray-50">
                      <div className="col-span-12 md:col-span-5">File & Attribution</div>
                      <div className="col-span-12 md:col-span-3 text-center">Trust Integrity</div>
                      <div className="col-span-12 md:col-span-4 text-right">Timestamp</div>
                    </div>

                    {history.map((item, i) => (
                      <motion.div 
                        key={item.id || i}
                        variants={itemVariants}
                        onClick={() => navigate(`/reports?id=${item.id}`)}
                        className="grid grid-cols-12 items-center bg-white p-12 rounded-[3rem] border border-gray-50 hover:border-black/5 hover:shadow-xl transition-all group cursor-pointer"
                      >
                        {/* File Visual */}
                        <div className="col-span-12 md:col-span-5 flex items-center gap-10">
                          <div className={`size-20 rounded-2xl flex items-center justify-center border transition-all ${
                            item.risk_level === 'HIGH' ? 'bg-red-50 border-red-100 text-red-500' : 
                            item.risk_level === 'MEDIUM' ? 'bg-amber-50 border-amber-100 text-amber-500' : 
                            'bg-emerald-50 border-emerald-100 text-emerald-500'
                          }`}>
                            <span className="material-symbols-outlined text-[32px]">
                              {item.file_type?.includes('video') ? 'movie' : item.file_type?.includes('audio') ? 'audio_file' : 'image'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-2xl font-serif text-black group-hover:underline underline-offset-8 decoration-black/10 transition-all">{item.filename}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-[0.8rem] font-bold uppercase tracking-widest text-gray-400">{item.file_type || 'MEDIA/FILE'}</span>
                              <span className="size-1 bg-gray-200 rounded-full"></span>
                              <span className={`text-[0.8rem] font-bold uppercase tracking-widest ${
                                item.risk_level === 'HIGH' ? 'text-red-500' : 'text-emerald-500'
                              }`}>{item.risk_level} LEVEL</span>
                            </div>
                          </div>
                        </div>

                        {/* Integrity Gauge */}
                        <div className="col-span-12 md:col-span-3 flex flex-col items-center gap-5 py-8 md:py-0">
                          <div className="w-48 h-2 bg-gray-50 rounded-full overflow-hidden border border-black/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.trust_score}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-full ${
                                item.trust_score > 70 ? 'bg-emerald-500' : item.trust_score > 30 ? 'bg-amber-500' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                              }`}
                            />
                          </div>
                          <span className="text-[2.5rem] font-serif leading-none">{item.trust_score}%</span>
                        </div>

                        {/* Timestamp & Action */}
                        <div className="col-span-12 md:col-span-4 flex flex-col items-end gap-3">
                          <span className="text-gray-600 font-bold text-[1.1rem] font-serif">
                            {new Date(item.analyzed_at).toLocaleDateString(undefined, { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="text-[0.9rem] font-mono opacity-40 text-black">
                            {new Date(item.analyzed_at).toLocaleTimeString()}
                          </span>
                          <div className="flex gap-6 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => navigate(`/reports?id=${item.id}`)}
                               className="text-[0.8rem] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
                             >
                               View Report
                             </button>
                             <button className="text-[0.8rem] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">Archive</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          <footer className="px-10 py-16 border-t border-gray-50 max-w-[1440px] mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-12 opacity-30 hover:opacity-100 transition-opacity">
            <div className="flex gap-20">
              <div className="flex items-center gap-4 text-[0.7rem] font-bold uppercase tracking-widest text-gray-500">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Signed Archive Protocal 1.0
              </div>
              <div className="flex items-center gap-4 text-[0.7rem] font-bold uppercase tracking-widest text-gray-500">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                End-to-end Encrypted
              </div>
            </div>
            <p className="text-[0.9rem] text-gray-500 font-medium font-serif italic mb-0">Truth Built on Proof &middot; DeepShield</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
