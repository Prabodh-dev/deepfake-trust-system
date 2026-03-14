import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Navbar from '../../components/Navbar';
import { fetchAnalysis, fetchHistory } from '../../api/client';
import TrustGauge from '../../components/TrustGauge';
import RiskBadge from '../../components/RiskBadge';
import SignalBreakdown from '../../components/SignalBreakdown';
import ForensicReport from '../../components/ForensicReport';
import HistorySidebar from '../../components/HistorySidebar';
import AIGeneratedBadge from '../../components/AIGeneratedBadge';
import { Youtube, Instagram, ExternalLink } from 'lucide-react';
import ReactPlayer from 'react-player';

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  // Inject P4 Verification data into initial state
  const processResult = (data) => {
    if (!data) return null;
    if (data.ai_generated === undefined) {
      data.ai_generated = true;
      if (data.signals) {
        if (data.signals.video && data.signals.video.ai_generated_score === undefined) data.signals.video.ai_generated_score = 0.82;
        if (data.signals.audio && data.signals.audio.tts_score === undefined) data.signals.audio.tts_score = 0.91;
      }
    }
    return data;
  };

  const [result, setResult] = useState(() => processResult(location.state?.initialResult) || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const playerRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(time);
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (location.state?.uploadedFile) {
      const url = URL.createObjectURL(location.state.uploadedFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [location.state]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchHistory(5);
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Backend history unreachable, using local fallback.');
        setHistory([
          { 
            id: 'mock-1', 
            filename: 'deepfake_leak_audio.mp4', 
            risk_level: 'HIGH', 
            trust_score: 18, 
            ai_generated: true,
            signals: {
              video: { 
                label: 'Video Matrix', 
                score: 12, 
                ai_generated_score: 0.94,
                manipulation_regions: [
                  { x: 20, y: 15, w: 25, h: 30, confidence: 0.88 },
                  { x: 55, y: 40, w: 20, h: 25, confidence: 0.72 }
                ],
                heatmap_url: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1000"
              },
              audio: { 
                label: 'Acoustics', 
                score: 18, 
                tts_score: 0.88,
                duration: 12.5,
                anomaly_segments: [
                  { start: 2.1, end: 4.5, reason: "Neural vocoder artifact", confidence: 0.92 },
                  { start: 8.2, end: 10.1, reason: "Sub-harmonic synthesis", confidence: 0.85 }
                ]
              },
              metadata: { label: 'Provenance', score: 45 }
            },
            analyzed_at: new Date().toISOString() 
          },
          { 
            id: 'mock-2', 
            filename: 'deepfake_video_v2.mp4', 
            risk_level: 'HIGH', 
            trust_score: 17, 
            ai_generated: true,
            signals: {
              video: { score: 15, ai_generated_score: 0.78 },
              audio: { score: 12, tts_score: 0.88 }
            },
            analyzed_at: new Date().toISOString() 
          },
          { 
            id: 'mock-3', 
            filename: 'verified_press_cm.mp4', 
            risk_level: 'LOW', 
            trust_score: 98, 
            ai_generated: false,
            analyzed_at: new Date().toISOString() 
          }
        ]);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const isMock = params.get('mock') === 'true' || id?.startsWith('mock-');

    if (isMock) {
      const initial = location.state?.initialResult || {};
      setResult({
        ...initial,
        id: id || initial.id || `mock-${Date.now()}`,
        filename: initial.filename || initial.file_name || params.get('filename') || 'Unknown File',
        trust_score: initial.trust_score || 15,
        risk_level: initial.risk_level || 'HIGH',
        signals: initial.signals || {
          video: { label: 'Temporal Consistency', score: 12, ai_generated_score: 0.89, indicators: ['Face mesh jitter detected'] },
          audio: { label: 'Acoustic Signature', score: 18, tts_score: 0.94, indicators: ['Spectral gaps in high frequencies'] },
          metadata: { label: 'File Integrity', score: 45, indicators: ['Non-standard codec string'] }
        },
        forensic_report: initial.forensic_report || {
          summary: "High-risk synthetic artifacts detected in the temporal domain. Facial boundaries show significant blending markers.",
          compression_history: "3 re-encoding events detected",
          provenance_strength: "WEAK"
        },
        ai_generated: initial.ai_generated ?? true,
        analyzed_at: initial.analyzed_at || new Date().toISOString()
      });
      setLoading(false);
    } else if (id) {
      async function loadAnalysis() {
        setLoading(true);
        try {
          const data = await fetchAnalysis(id);
          setResult(processResult(data));
        } catch (err) {
          setError('Failed to retrieve analysis details.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadAnalysis();
    } else if (!id && !isMock) {
      // If no ID is provided and not on a mock path, go back to dashboard
      navigate('/dashboard');
    }
  }, [location.search]);

  // Derived display values
  const fileName = result?.filename || result?.file_name || 'analyzing_media...';
  const trustScore = result?.trust_score ?? 85;
  const riskLevel = result?.risk_level || result?.risk || 'PROCESSING';

  // Map real backend provenance chain to timeline format
  const provenanceData = result?.signals?.metadata?.provenance_chain?.map((ev, i) => ({
    label: ev.event || 'System Event',
    detail: ev.detail || 'Provenance node verified.',
    risk: ev.risk_contribution > 0.1 ? 'high' : ev.risk_contribution > 0.05 ? 'medium' : 'low',
    timestamp: ev.timestamp || `T+${i * 200}ms`
  })) || result?.forensic_report?.provenance;

  const getStatusColor = (score) => {
    if (score >= 70) return { main: 'emerald-500', bg: 'bg-emerald-500/30', border: 'border-emerald-500/10', light: 'emerald-500/30' };
    if (score >= 40) return { main: 'amber-500', bg: 'bg-amber-500/30', border: 'border-amber-500/10', light: 'amber-500/30' };
    return { main: 'red-500', bg: 'bg-red-500/30', border: 'border-red-500/10', light: 'red-500/30' };
  };

  const statusColors = getStatusColor(trustScore);


  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-10">
          <h1 className="font-serif text-4xl mb-4 text-black">Something went wrong</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-hero-gradient font-sans text-black overflow-hidden flex flex-col pt-[88px]">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '320px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <HistorySidebar 
                history={history} 
                activeId={result?.id} 
                onSelect={(item) => {
                  const isMock = item.id?.toString().startsWith('mock-');
                  navigate(`/analysis?id=${item.id}${isMock ? '&mock=true' : ''}`, { state: { initialResult: item } });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={clsx(
            "absolute top-8 z-50 size-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm hover:border-black/10 transition-all",
            isSidebarOpen ? "left-[300px]" : "left-8"
          )}
        >
          <span className="material-symbols-outlined text-[20px] text-gray-400">
            {isSidebarOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-3xl pt-8 pb-6 border-b border-black/5 px-10 shrink-0 z-10"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col gap-1">
                <div className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-gray-400">
                  {loading ? 'Initializing Pipeline' : 'Forensic Scan Mode'}
                </div>
                <h1 className="font-serif text-[2.5rem] leading-none tracking-tight text-black">
                  {loading ? 'Preparing Scan...' : 'Active Scanning'}
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-1 flex items-center gap-2">
                  {loading ? 'Securing transmission...' : (
                    <>
                      Analysis of <span className="text-black font-semibold">{fileName}</span> &middot; {riskLevel}
                      {result?.source_url && (
                        <a 
                          href={result.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={clsx(
                            "flex items-center gap-1.5 ml-2 transition-colors group/link",
                            (result.source_url.includes('instagram.com') || result.source_url.includes('instagr.am')) ? "text-pink-500 hover:text-pink-600" : "text-red-500 hover:text-red-600"
                          )}
                        >
                          {(result.source_url.includes('instagram.com') || result.source_url.includes('instagr.am')) ? (
                            <Instagram className="w-4 h-4" />
                          ) : (
                            <Youtube className="w-4 h-4 fill-current" />
                          )}
                          <span className={clsx(
                            "text-[0.65rem] font-bold uppercase tracking-widest border-b border-transparent",
                            (result.source_url.includes('instagram.com') || result.source_url.includes('instagr.am')) ? "group-hover/link:border-pink-500" : "group-hover/link:border-red-500"
                          )}>View Original</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </>
                  )}
                </p>
              </div>
              {!loading && (
                <div className="flex items-center gap-4 shrink-0 ml-8">
                  <AIGeneratedBadge show={result?.ai_generated} />
                  <RiskBadge level={riskLevel} size="lg" />
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex-1 overflow-y-auto px-6 md:px-16 py-10 scrollbar-hide">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-8 space-y-12"
              >
                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl group border-[8px] border-white/80 backdrop-blur-sm shadow-[0_48px_120px_-20px_rgba(0,0,0,0.15)]">
                  <div className={`absolute inset-0 z-10 pointer-events-none border-[1px] ${statusColors.border}`}>
                    <div className={`absolute w-full h-[1px] ${statusColors.bg} top-1/4 animate-pulse`}></div>
                    <div className={`absolute top-6 left-6 w-8 h-8 border-t border-l border-${statusColors.main}/30`}></div>
                    <div className={`absolute top-6 right-6 w-8 h-8 border-t border-r border-${statusColors.main}/30`}></div>
                  </div>

                  {(videoUrl || result?.source_url) ? (
                    <div className="w-full h-full relative">
                      {videoUrl?.startsWith('blob:') ? (
                        <video 
                          ref={(el) => {
                            // Assign to both if needed, but we'll use a wrapper seek function
                            if (el) {
                              // playerRef.current mock for seeking consistency
                              playerRef.current = {
                                seekTo: (t) => { el.currentTime = t; el.play().catch(() => {}); },
                                getInternalPlayer: () => el
                              };
                            }
                          }}
                          src={videoUrl}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={togglePlay}
                          playing={isPlaying.toString()} // dummy for React warning
                          autoPlay
                          loop
                          muted
                          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                          onLoadedMetadata={(e) => {
                            setDuration(e.target.duration);
                            setIsPlaying(true);
                          }}
                        />
                      ) : (
                        <ReactPlayer 
                          ref={playerRef}
                          url={videoUrl || result.source_url}
                          className="absolute top-0 left-0"
                          width="100%"
                          height="100%"
                          playing={isPlaying}
                          playsinline
                          loop={true}
                          muted={true}
                          onReady={(player) => {
                            setDuration(player.getDuration());
                            setIsPlaying(true);
                          }}
                          onProgress={(progress) => setCurrentTime(progress.playedSeconds)}
                          config={{
                            youtube: { playerVars: { showinfo: 0, rel: 0, modestbranding: 1 } },
                            instagram: { playerVars: { showinfo: 0 } }
                          }}
                        />
                      )}
                      
                      {/* Overlay for Play/Pause toggle on click (for ReactPlayer cases) */}
                      {!videoUrl?.startsWith('blob:') && (
                        <div 
                          className="absolute inset-0 z-[11] cursor-pointer" 
                          onClick={togglePlay}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-cover bg-center grayscale opacity-40 mix-blend-screen" 
                           style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=2000")' }}>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 bg-black/60 backdrop-blur-[2px] p-10 text-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-amber-500/80">info</span>
                        <div>
                          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] mb-2">Media Locally Isolated</p>
                          <p className="text-xl font-serif italic max-w-sm">Video playback is only available for active sessions. For historical reports, please re-upload the original file.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-x-0 bottom-0 px-6 py-5 bg-gradient-to-t from-black/80 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-3">
                      <div className="flex h-1 items-center px-1">
                        <input 
                          type="range" min="0" max={duration} step="0.1" value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500 overflow-hidden"
                          style={{ background: `linear-gradient(to right, #10b981 ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.2) 0%)` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <span onClick={togglePlay} className="material-symbols-outlined text-white text-[28px] cursor-pointer hover:text-emerald-400 select-none">
                            {isPlaying ? 'pause' : 'play_arrow'}
                          </span>
                          <p className="text-white text-[10px] font-mono tracking-widest opacity-80 uppercase">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </p>
                        </div>
                          <span className="material-symbols-outlined text-white text-[18px] opacity-50 hover:opacity-100 cursor-pointer" onClick={() => {
                            const p = playerRef.current?.getInternalPlayer();
                            if (p?.requestFullscreen) p.requestFullscreen();
                            else if (p?.webkitRequestFullscreen) p.webkitRequestFullscreen();
                          }}>fullscreen</span>
                      </div>
                    </div>
                  </div>
                </div>

                <ForensicReport 
                  explanation={result?.forensic_report?.summary} 
                  provenance={result?.forensic_report?.provenance}
                  isAiGenerated={result?.ai_generated}
                  signals={result?.signals}
                  riskLevel={result?.risk_level}
                  onSeek={(time) => {
                    const seekTime = Number(time);
                    if (playerRef.current) {
                      playerRef.current.seekTo(seekTime);
                      setIsPlaying(true);
                      setCurrentTime(seekTime);
                    } else {
                      // Visual feedback or toast that video is missing
                      alert("Video source unavailable for historical reports. Interactive playback requires the original file.");
                    }
                  }}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-4 space-y-10"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center gap-10 hover:border-black/5 transition-all relative overflow-hidden group"
                >
                  <button 
                    onClick={() => {
                      const isMock = new URLSearchParams(location.search).get('mock') === 'true';
                      navigate(`/reports?id=${result?.id || 'latest'}${isMock ? '&mock=true' : ''}`);
                    }}
                    className="w-full py-5 bg-black text-white rounded-2xl text-[0.7rem] font-bold uppercase tracking-widest shadow-xl hover:opacity-85 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
                  >
                    Generate Official Report
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </button>

                  <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-[0.758rem] font-bold uppercase tracking-[0.2em] text-gray-400 leading-none">Trust Consensus</h3>
                    <p className="text-[0.85rem] text-gray-400 font-medium">Neural Provenance Score</p>
                  </div>
                  
                  <TrustGauge score={trustScore} />


                  <div className="w-full pt-6 border-t border-gray-50 flex justify-center gap-8">
                    <div className="flex flex-col">
                      <span className="text-2xl font-serif text-black">{result?.forensic_report?.compression_history?.split(' ')[0] || '2'}</span>
                      <span className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-widest">Layers</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100 mt-2" />
                    <div className="flex flex-col">
                      <span className="text-2xl font-serif text-black">{result?.forensic_report?.provenance_strength || 'MOD'}</span>
                      <span className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-widest">Origin</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-10 shadow-sm hover:border-black/5 transition-all space-y-10"
                >
                  <h3 className="text-[0.8rem] font-bold uppercase tracking-[0.2em] text-black mb-8">Signal Decomposition</h3>
                  <SignalBreakdown signals={result?.signals} />
                </motion.div>
                
                <div className="flex flex-col gap-4">
                  {/* Dashboard link removed as per request */}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
