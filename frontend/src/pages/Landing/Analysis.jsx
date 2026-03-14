import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardNav from '../../components/DashboardNav';
import { fetchAnalysis } from '../../api/client';

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.initialResult || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we don't have a result in state, try to fetch it via ID from URL
    if (!result) {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      const isMock = params.get('mock') === 'true';
      const filename = params.get('filename');

      if (isMock) {
        // Handle mock fallback state
        setResult({
          filename: filename || 'Unknown File',
          trust_score: 85,
          risk_level: 'PROCESSING',
          is_mock: true
        });
        setLoading(false);
      } else if (id) {
        async function loadAnalysis() {
          try {
            const data = await fetchAnalysis(id);
            setResult(data);
          } catch (err) {
            setError('Failed to retrieve analysis details.');
            console.error(err);
          } finally {
            setLoading(false);
          }
        }
        loadAnalysis();
      } else {
        setError('No analysis identifier provided.');
        setLoading(false);
      }
    }
  }, [result, location.search]);

  // Derived display values
  const fileName = result?.filename || result?.file_name || 'analyzing_media...';
  const trustScore = result?.trust_score ?? 85;
  const riskLevel = result?.risk_level || result?.risk || 'PROCESSING';
  const isHighRisk = riskLevel.toUpperCase() === 'HIGH';

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <DashboardNav />
        <div className="flex flex-col items-center justify-center pt-32 px-10">
          <h1 className="font-serif text-4xl mb-4">Something went wrong</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans text-black min-h-screen transition-opacity duration-700">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <DashboardNav />

          <main className="flex-1">
            {/* Dynamic Hero */}
            <div className="bg-hero-gradient pt-20 pb-16 border-b border-black/5 px-10">
              <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between items-end gap-10">
                <div className="flex flex-col gap-4">
                  <div className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-gray-500">
                    {loading ? 'Initializing Pipeline' : 'Forensic Scan Mode'}
                  </div>
                  <h1 className="font-serif text-5xl leading-[1.1] tracking-tight text-black">
                    {loading ? 'Preparing Scan...' : 'Active Scanning'}
                  </h1>
                  <p className="text-gray-600 text-lg font-medium max-w-lg">
                    {loading ? 'Securing transmission...' : (
                      <>Real-time analysis of <span className="text-black underline decoration-black/10">{fileName}</span> &middot; Status: {riskLevel}</>
                    )}
                  </p>
                </div>
                <div className="flex gap-4 items-center bg-white/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-black/5">
                  <span className={`text-[0.7rem] font-bold uppercase tracking-widest flex items-center gap-2.5 ${isHighRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                    <span className={`size-2 rounded-full animate-pulse ring-4 ${isHighRisk ? 'bg-red-500 ring-red-500/20' : 'bg-emerald-500 ring-emerald-500/20'}`} />
                    {isHighRisk ? 'Anomalies Detected' : 'Neural Link Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-10 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Scanning Viewport */}
              <div className="lg:col-span-2 flex flex-col gap-10">
                <div className="relative bg-black rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video group border-[8px] border-white shadow-[0_48px_80px_-20px_rgba(0,0,0,0.12)]">
                  {/* Technical Overlay Layer */}
                  <div className="absolute inset-0 z-10 pointer-events-none border-[1px] border-emerald-500/10">
                    <div className="absolute w-full h-[1px] bg-emerald-500/40 top-1/3 left-0 animate-pulse"></div>
                    <div className="absolute top-10 left-10 w-10 h-10 border-t-2 border-l-2 border-emerald-500/30"></div>
                    <div className="absolute top-10 right-10 w-10 h-10 border-t-2 border-r-2 border-emerald-500/30"></div>
                    
                    {/* Frame Data */}
                    <div className="absolute bottom-12 left-12 font-mono text-[11px] text-emerald-400 space-y-2 bg-black/60 p-4 backdrop-blur-xl rounded-2xl border border-white/10">
                      <div className="flex justify-between gap-6"><span className="opacity-40">FRAME</span> <span className="font-bold">1422</span></div>
                      <div className="flex justify-between gap-6"><span className="opacity-40">BITRATE</span> <span className="font-bold">8.4 Mbps</span></div>
                      <div className="flex justify-between gap-6"><span className="opacity-40">SYNC</span> <span className="text-emerald-300">STABLE</span></div>
                    </div>
                  </div>
                  <div className="w-full h-full bg-cover bg-center grayscale opacity-60 mix-blend-screen" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA5877Fw-yXqJ-AXMfoTvV7kztvoVFXoGAiRJAyF_YQHgAKOBgjgiE51z1T79cLl53kcITmt1hKS-7XtDaPKxR-XDN74SJVQ7l_DdC8ifbTwC9yuZOUrVQThQDT6DEljwRhpsrjNKLCDZx2aQz7HFcNN_gZ9LN5GJsAoWTLvmnkAm9X3YF8CqTozE8c9eVGYtugPMHJ7wH55fG9hC5rn-j0sNEINldzK9pYigTPAGu6sCryI9tYzYEXDse1qJF6nXQzJFtXEx-ytbk")' }}></div>
                  
                  {/* Playback Control Bar */}
                  <div className="absolute inset-x-0 bottom-0 px-10 py-8 bg-gradient-to-t from-black to-transparent z-20">
                    <div className="flex h-1.5 items-center justify-center mb-6">
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full shadow-[0_0_20px_rgba(16,185,129,1)] transition-all duration-700 ${isHighRisk ? 'bg-red-500 shadow-red-500' : 'bg-emerald-500'}`} style={{ width: `${trustScore}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <span className="material-symbols-outlined text-white text-[28px] cursor-pointer hover:text-emerald-400 transition-all hover:scale-110">pause</span>
                        <p className="text-white text-[12px] font-mono tracking-[0.2em] opacity-80 uppercase">PROCESSED {trustScore}%</p>
                      </div>
                      <div className="flex gap-6">
                        <span className="material-symbols-outlined text-white text-[20px] cursor-pointer hover:text-emerald-400 opacity-50 hover:opacity-100 transition-all">settings</span>
                        <span className="material-symbols-outlined text-white text-[20px] cursor-pointer hover:text-emerald-400 opacity-50 hover:opacity-100 transition-all">fullscreen</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[120px] text-black">security</span>
                  </div>
                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-black border border-black/5 shadow-sm">
                        <span className="material-symbols-outlined text-[28px]">analytics</span>
                      </div>
                      <div>
                        <p className="text-black text-2xl font-serif leading-none mb-1">Confidence Score</p>
                        <p className="text-gray-400 text-[0.8rem] uppercase tracking-widest font-bold">Comprehensive Forensic Evaluation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-serif text-[4rem] leading-none tracking-tight transition-colors ${isHighRisk ? 'text-red-500' : 'text-black'}`}>
                        {trustScore}<span className="text-xl text-gray-300 ml-1">%</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-50 border border-black/5 rounded-full h-3 mb-6 overflow-hidden relative z-10">
                    <div className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.15)] ${isHighRisk ? 'bg-red-500' : 'bg-black'}`} style={{ width: `${trustScore}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[0.85rem] font-medium text-gray-500 leading-relaxed px-1 relative z-10">
                    <span className="italic flex items-center gap-2">
                       <span className={`size-1.5 rounded-full animate-pulse ${isHighRisk ? 'bg-red-400' : 'bg-emerald-500'}`} />
                      {loading ? 'Crunching neural patterns...' : `Analysis complete for ${fileName}`}
                    </span>
                    <span className="font-bold text-black opacity-40 uppercase tracking-widest text-[0.7rem]">Ver 4.2.0</span>
                  </div>
                </div>
              </div>

              {/* Signal Extraction Feed */}
              <div className="flex flex-col gap-10">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col h-full hover:border-black/5 transition-all hover:shadow-lg">
                  <div className="px-10 py-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h2 className="text-[0.85rem] font-bold uppercase tracking-[0.3em] text-black flex items-center gap-4">
                      <span className="material-symbols-outlined text-[20px] text-emerald-500">fingerprint</span>
                      Signal Feed
                    </h2>
                    <span className="bg-black text-white text-[0.65rem] font-bold px-3 py-1.5 rounded-full tracking-tighter shadow-xl">LIVE</span>
                  </div>
                  <div className="p-10 flex flex-col gap-6">
                    {(result?.signals ? Object.entries(result.signals) : [
                      { title: 'C2PA Metadata', status: 'VERIFIED', detail: 'Signed by Hardware Key.', color: 'emerald' },
                      { title: 'Spectral Match', status: isHighRisk ? 'ANOMALY' : 'VERIFIED', detail: 'Frequency domain analysis.', color: isHighRisk ? 'red' : 'emerald' }
                    ]).map(([key, signal], idx) => (
                      <div key={idx} className={`flex flex-col gap-4 p-6 rounded-3xl border transition-all ${
                        (signal.color || (signal.score < 50 ? 'red' : 'emerald')) === 'emerald' ? 'bg-emerald-50/20 border-emerald-100/40' : 
                        'bg-red-50/20 border-red-100/40 ring-1 ring-red-500/5'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[0.95rem] font-bold text-black font-serif tracking-tight">{signal.label || signal.title || key}</span>
                          <span className={`text-[0.6rem] font-bold tracking-[0.2em] px-2 py-0.5 rounded ${(signal.color || (signal.score < 50 ? 'red' : 'emerald')) === 'emerald' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {signal.status || (signal.score < 50 ? 'RISK' : 'OK')}
                          </span>
                        </div>
                        <div className="text-[0.8rem] text-gray-500 font-medium leading-relaxed">{signal.detail || (signal.anomalies?.join(', ') || 'Optimized match.')}</div>
                      </div>
                    ))}
                    
                    <div className="mt-6 flex flex-col gap-2 bg-black rounded-3xl p-8 font-mono text-[11px] text-emerald-400/70 h-44 overflow-y-auto border border-white/5 shadow-2xl">
                      <p className="opacity-30 border-b border-white/5 pb-2 mb-2 uppercase text-[9px] tracking-widest text-white">Console Logs</p>
                      <p className="opacity-40">[14:22:01] Init neural spectral pass...</p>
                      <p>[14:22:03] Hash Match &middot; VALID</p>
                      <p className={isHighRisk ? 'text-red-400' : 'text-blue-400'}>[14:22:08] {isHighRisk ? 'Artifacts detected in L2' : 'Scanning quantization...'}</p>
                      <p className="text-amber-500/80">[14:22:12] Scan results finalized ({trustScore}%)</p>
                    </div>

                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="mt-6 w-full py-5 rounded-2xl border-2 border-dashed border-gray-100 text-[0.75rem] font-bold uppercase tracking-[0.3em] text-gray-300 hover:text-black hover:bg-gray-50 hover:border-gray-200 hover:border-solid transition-all"
                    >
                      {loading ? 'Cancel Scan' : 'Return to Dashboard'}
                    </button>
                    {!loading && (
                      <button 
                        onClick={() => navigate(`/reports?id=${result?.id || 'latest'}`)}
                        className="w-full py-5 bg-black text-white rounded-2xl text-[0.75rem] font-bold uppercase tracking-[0.3em] shadow-xl hover:opacity-85 transition-opacity"
                      >
                        Generate Full Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <footer className="px-10 py-12 border-t border-gray-50 max-w-[1440px] mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex gap-16">
              <div className="flex flex-col gap-2">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gray-400 leading-none">Compute Node</span>
                <span className="text-[0.85rem] font-medium text-gray-800">Cluster 129.A</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gray-400 leading-none">Security</span>
                <span className="text-[0.85rem] font-medium text-gray-800">Verified Protocol</span>
              </div>
            </div>
            <p className="text-[0.9rem] text-gray-500 font-medium font-serif italic mb-0">DeepShield &middot; Truth Built on Proof</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
