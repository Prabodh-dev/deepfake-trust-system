import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Navbar from '../../components/Navbar';
import UploadZone from '../../components/UploadZone';
import { fetchHistory, analyzeMedia, fetchStats, mockAnalyze, analyzeUrl } from '../../api/client';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // Load backend data
  useEffect(() => {
    async function loadData() {
      try {
        const [historyData, statsData] = await Promise.all([
          fetchHistory(5),
          fetchStats()
        ]);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setStats(statsData);
      } catch (err) {
        console.warn('Backend unreachable, using mock data.');
        setHistory([
          { id: 'mock-1', filename: 'deepfake_leak_audio.mp3', risk_level: 'HIGH', trust_score: 12, analyzed_at: new Date().toISOString(), file_type: 'audio/mpeg' },
          { id: 'mock-2', filename: 'verified_press_cm.mp4', risk_level: 'LOW', trust_score: 98, analyzed_at: new Date().toISOString(), file_type: 'video/mp4' }
        ]);
        setStats({
          total_analyses: 110,
          high_risk: 22,
          average_trust_score: 94.2
        });
      } finally {
        setLoadingHistory(false);
      }
    }
    loadData();
  }, []);

  const handleAnalysis = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await analyzeMedia(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      const analysisResult = {
        ...result,
        filename: result.filename || result.file_name || selectedFile.name,
        analyzed_at: result.analyzed_at || new Date().toISOString()
      };
      const id = analysisResult.id || analysisResult._id || `analysis-${Date.now()}`;
      navigate(`/analysis?id=${id}`, { state: { initialResult: analysisResult, uploadedFile: selectedFile } });
    } catch (err) {
      console.warn('Real analysis failed, using mock analysis:', err.message);
      const mockResult = await mockAnalyze(selectedFile);
      navigate(`/analysis?id=${mockResult.id}&mock=true`, { 
        state: { initialResult: mockResult, uploadedFile: selectedFile } 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAnalysis = async (url) => {
    setUploading(true);
    try {
      const result = await analyzeUrl(url);
      const id = result.id || `analysis-${Date.now()}`;
      navigate(`/analysis?id=${id}${result.mock ? '&mock=true' : ''}`, { 
        state: { initialResult: result } 
      });
    } catch (err) {
      console.error('URL analysis failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white font-sans text-black min-h-screen pt-[88px]">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <Navbar />

          <main className="flex-1">
            {/* Hero Section */}
            <section className="bg-hero-gradient pt-32 pb-32 px-10 border-b border-black/5 relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-[50%] h-[100%] bg-blue-50/20 blur-[120px] rounded-full -z-10" />
              
              <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center text-left">
                <div className="lg:col-span-7 flex flex-col items-start">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 bg-white border border-black/5 px-4 py-2 rounded-full mb-8 shadow-sm"
                  >
                    <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.2rem] text-gray-400">P3 Node Active: 172.16.10.190</span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-[4.8rem] leading-[0.95] tracking-[-0.04em] mb-8"
                  >
                    Neural Forensic <br />Dashboard
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 text-xl leading-relaxed mb-12 max-w-[600px] font-medium"
                  >
                    Detect AI-generated media with enterprise precision. Verified via cryptographically secure provenance and neural artifact localization.
                  </motion.p>
                </div>

                <div className="lg:col-span-5 w-full">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08)]"
                  >
                    <UploadZone 
                      onFileSelected={(file) => setSelectedFile(file)}
                      onUrlAnalyze={handleUrlAnalysis}
                      uploading={uploading}
                      uploadProgress={uploadProgress}
                    />
                    
                    {selectedFile && !uploading && (
                      <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleAnalysis}
                        className="w-full mt-6 bg-black text-white py-5 rounded-2xl text-[0.7rem] font-bold uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-black hover:bg-gray-900"
                      >
                        Begin Neural Analysis
                        <span className="material-symbols-outlined text-[20px]">bolt</span>
                      </motion.button>
                    )}

                    {!selectedFile && (
                      <div className="mt-8 flex items-center justify-center gap-6">
                        <p className="text-black/40 text-[0.6rem] uppercase tracking-[0.2em] font-bold">Encrypted P3 Tunnel</p>
                        <div className="h-4 w-px bg-gray-100" />
                        <p className="text-black/40 text-[0.6rem] uppercase tracking-[0.2em] font-bold">Secure Core v4.2</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </section>

            <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-24 flex flex-col gap-24">
              {/* Quick Insights Section */}
              <section>
                <div className="text-[0.85rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-10 leading-none flex items-center gap-3">
                  <div className="size-1.5 bg-gray-400 rounded-full" />
                  Global Forensic Registry
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Total Scans Logged', val: stats?.total_analyses.toLocaleString() || '---', icon: 'analytics', up: true, trend: '+12%' },
                    { label: 'High-Risk Neutralized', val: stats?.high_risk.toLocaleString() || '---', icon: 'psychology', up: true, trend: '+5%' },
                    { label: 'Avg Network Trust', val: `${stats?.average_trust_score.toFixed(1) || '---'}%`, icon: 'shield_lock', up: true, trend: '+0.5%' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-6 rounded-[2.5rem] p-10 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:border-gray-300 transition-all hover:shadow-xl group">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                          <span className="material-symbols-outlined text-gray-300 text-[20px] font-light group-hover:text-black transition-colors">{stat.icon}</span>
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-[3rem] font-serif text-black leading-none tracking-tighter">
                            {stat.val}
                          </span>
                          <div className={`text-[0.8rem] font-bold flex items-center gap-1.5 ${stat.up ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <span className="material-symbols-outlined text-[16px] font-bold">{stat.up ? 'trending_up' : 'trending_down'}</span>
                            {stat.trend}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Analysis Table */}
              <section className="flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[0.85rem] font-bold tracking-[0.2em] uppercase text-gray-400 font-sans leading-none">
                    Recent Analysis
                  </div>
                  <button 
                    onClick={() => navigate('/history')}
                    className="text-[0.8rem] font-bold text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity uppercase tracking-widest"
                  >
                    View All History
                  </button>
                </div>
                
                <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        <th className="px-10 py-6 text-[0.8rem] font-bold uppercase tracking-wider text-gray-400">File & Metadata</th>
                        <th className="px-10 py-6 text-[0.8rem] font-bold uppercase tracking-wider text-gray-400">Status</th>
                        <th className="px-10 py-6 text-[0.8rem] font-bold uppercase tracking-wider text-gray-400">Trust Integrity</th>
                        <th className="px-10 py-6 text-[0.8rem] font-bold uppercase tracking-wider text-gray-400 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingHistory ? (
                        <tr><td colSpan="4" className="px-10 py-16 text-center text-gray-400 italic text-lg hover:bg-transparent">Retrieving secure logs...</td></tr>
                      ) : history.length === 0 ? (
                        <tr><td colSpan="4" className="px-10 py-16 text-center text-gray-400 italic text-lg hover:bg-transparent">No forensic records found.</td></tr>
                      ) : (
                        history.map((row) => (
                          <tr 
                            key={row.id} 
                            className="hover:bg-gray-50/50 transition-colors group cursor-pointer" 
                            onClick={() => {
                              const isMock = row.id?.toString().startsWith('mock-');
                              navigate(`/analysis?id=${row.id}${isMock ? '&mock=true' : ''}`, { state: { initialResult: row } });
                            }}
                          >
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center border border-black/5 text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                                  <span className="material-symbols-outlined text-[20px]">
                                    {row.file_type?.includes('video') ? 'movie' : 'audio_file'}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-xl font-serif text-black transition-all">{row.filename || 'Unnamed File'}</span>
                                  <span className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest">{row.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[0.8rem] font-bold uppercase tracking-widest ${
                                row.risk_level === 'HIGH' ? 'bg-red-50 text-red-600' : 
                                row.risk_level === 'LOW' ? 'bg-emerald-50 text-emerald-600' : 
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {row.risk_level}
                              </span>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden border border-black/5">
                                  <div className={clsx(
                                    "h-full transition-all duration-500",
                                    row.trust_score >= 70 ? "bg-emerald-500" : row.trust_score >= 40 ? "bg-amber-500" : "bg-red-500"
                                  )} style={{ width: `${row.trust_score}%` }}></div>
                                </div>
                                <span className="text-[1.2rem] font-serif font-medium text-black">{row.trust_score}%</span>
                              </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[1rem] text-gray-600 font-serif font-medium">
                                  {new Date(row.analyzed_at).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </main>

          <footer className="bg-white border-t border-gray-200 px-10 py-16">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="flex flex-col gap-5 max-w-xs">
                <a href="#" className="font-serif text-lg tracking-tight text-black">DeepShield</a>
                <p className="text-gray-400 text-[0.85rem] leading-[1.6]">
                  Ensuring truth in a digital-first world through advanced forensic analysis and provenance evaluation.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                {[
                  { title: 'Product', links: ['Dashboard', 'Forensics', 'API', 'Pricing'] },
                  { title: 'Company', links: ['About', 'Journal', 'Careers', 'Contact'] },
                  { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] }
                ].map((col, i) => (
                  <div key={i} className="flex flex-col gap-5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-300">{col.title}</h4>
                    <ul className="flex flex-col gap-3 text-[0.85rem] text-gray-600 font-medium list-none p-0 m-0">
                      {col.links.map((link, j) => (
                        <li key={j}><a className="hover:text-black transition-colors" href="#">{link}</a></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[0.75rem] text-gray-400">
              <span>&copy; {new Date().getFullYear()} DeepShield &middot; All rights reserved.</span>
              <a href="#" className="text-black font-medium border-b border-black pb-px hover:opacity-60 transition-opacity">Get started &rarr;</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
