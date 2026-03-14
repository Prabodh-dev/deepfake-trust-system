import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardNav from '../../components/DashboardNav';
import { fetchHistory, analyzeMedia } from '../../api/client';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchHistory(5);
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Backend unreachable, using mock history.');
        // Simulated history fallback
        setHistory([
          { id: '1', filename: 'sample_video.mp4', risk_level: 'LOW', trust_score: 92, analyzed_at: new Date().toISOString(), file_type: 'video/mp4' },
          { id: '2', filename: 'suspicious_audio.wav', risk_level: 'HIGH', trust_score: 14, analyzed_at: new Date().toISOString(), file_type: 'audio/wav' }
        ]);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  const onFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await analyzeMedia(file, (progress) => {
        setUploadProgress(progress);
      });
      // Ensure result has the filename even if backend doesn't return it
      const analysisResult = {
        ...result,
        filename: result.filename || result.file_name || file.name,
        analyzed_at: result.analyzed_at || new Date().toISOString()
      };
      const id = analysisResult.id || analysisResult._id || `analysis-${Date.now()}`;
      navigate(`/analysis?id=${id}`, { state: { initialResult: analysisResult } });
    } catch (err) {
      console.warn('Real analysis failed, using mock analysis:', err.message);
      // If real API fails, we could use mockAnalyze from client.js
      // For now, let's just navigate to analysis and let it show a mock state
      navigate(`/analysis?mock=true&filename=${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black font-sans text-black min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <DashboardNav />

          <main className="flex-1">
            {/* Hero Section with Landing Page Gradient */}
            <section className="bg-hero-gradient pt-24 pb-32 px-6 text-center border-b border-black/5">
              <div className="max-w-2xl mx-auto flex flex-col items-center">
                <h1 className="font-serif text-[3.5rem] leading-[1.1] tracking-[-0.03em] mb-4">Analysis Dashboard</h1>
                <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-[500px]">
                  Detect AI-generated media and deepfakes with enterprise-grade precision.
                </p>
                
                <div className="w-full max-w-[600px] bg-white/40 backdrop-blur-md p-2 rounded-xl border border-black/10 shadow-sm flex flex-col md:flex-row gap-2">
                  <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-3 shadow-inner">
                    <span className="material-symbols-outlined text-gray-400 mr-2 text-[20px]">link</span>
                    <input className="flex-1 border-none focus:ring-0 text-black placeholder:text-gray-400 bg-transparent outline-none p-0" placeholder="Paste media URL or search..." type="text" />
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={onFileSelect}
                      accept="video/*,audio/*,image/*"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-white border border-black/10 text-black px-5 py-3 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      {uploading ? `${uploadProgress}%` : 'Upload'}
                    </button>
                    <button className="bg-black text-white px-8 py-3 rounded-lg text-sm font-medium hover:opacity-85 transition-opacity shadow-lg">
                      Analyze
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-[0.7rem] uppercase tracking-wider mt-4 font-medium">Supported: MP4, MOV, WAV, JPG, PNG &middot; Max 500MB</p>
              </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col gap-16">
              {/* Quick Insights */}
              <section>
                <div className="text-[0.75rem] font-medium tracking-[0.1em] uppercase text-gray-400 mb-8 font-sans leading-none">
                  Quick Insights
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Media Scanned Today', val: '1,284', trend: '+5%', up: true, icon: 'visibility' },
                    { label: 'High Risk Detected', val: '12', trend: '-2%', up: true, icon: 'warning' },
                    { label: 'Avg Trust Score', val: '94%', trend: '+1%', up: true, icon: 'verified_user' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-4 rounded-xl p-8 bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-[0.85rem] font-medium">{stat.label}</span>
                        <span className="material-symbols-outlined text-gray-300 text-[20px]">{stat.icon}</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <p className="font-serif text-[2.4rem] leading-none mb-0">{stat.val}</p>
                        <span className={`text-[0.75rem] font-bold mb-1 ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Analysis - Clean Table */}
              <section className="flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[0.75rem] font-medium tracking-[0.1em] uppercase text-gray-400 font-sans leading-none">
                    Recent Analysis
                  </div>
                  <button className="text-xs font-bold text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity">View All</button>
                </div>
                
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">File Name</th>
                        <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Status</th>
                        <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Trust Score</th>
                        <th className="px-6 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Date</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingHistory ? (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">Finding records...</td></tr>
                      ) : history.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">No analysis results found yet.</td></tr>
                      ) : (
                        history.map((row, i) => (
                          <tr key={row.id || i} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/reports?id=${row.id}`)}>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">
                                  {row.file_type?.includes('video') ? 'movie' : row.file_type?.includes('audio') ? 'audio_file' : 'image'}
                                </span>
                                <span className="text-sm font-medium">{row.filename || 'Unnamed File'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider ${
                                row.risk_level === 'HIGH' ? 'bg-red-50 text-red-600' : 
                                row.risk_level === 'LOW' ? 'bg-green-50 text-green-600' : 
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {row.risk_level || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div className={`h-full ${
                                    row.trust_score > 70 ? 'bg-green-500' : row.trust_score > 30 ? 'bg-amber-500' : 'bg-red-500'
                                  }`} style={{ width: `${row.trust_score}%` }}></div>
                                </div>
                                <span className="text-xs font-bold font-serif">{row.trust_score}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-[0.8rem] text-gray-500 font-medium">
                              {row.analyzed_at ? new Date(row.analyzed_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-5 text-right w-12">
                              <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-gray-400 hover:text-black">more_vert</span>
                              </button>
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
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
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
            <div className="max-w-[1200px] mx-auto mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[0.75rem] text-gray-400">
              <span>&copy; {new Date().getFullYear()} DeepShield &middot; All rights reserved.</span>
              <a href="#" className="text-black font-medium border-b border-black pb-px hover:opacity-60 transition-opacity">Get started &rarr;</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
