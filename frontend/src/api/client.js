import axios from 'axios'

// Axios instance pointing at backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 300000, // 5 min — large video uploads & URL processing
  headers: {
    'Accept': 'application/json',
  },
})

// ── Request interceptor: add auth token if present ─────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('df_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (err) => Promise.reject(err)
)

// ── Response interceptor: normalise errors & fallback ──────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'Unknown error'
    return Promise.reject(new Error(message))
  }
)

// ─────────────────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Upload a media file for deepfake analysis.
 * @param {File} file — video or audio file
 * @param {(progress: number) => void} onProgress — upload progress callback (0-100)
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeMedia(file, onProgress) {
  const form = new FormData()
  form.append('file', file)

  const { data } = await api.post('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    },
  })

  return data
}

/**
 * Analyze a YouTube URL for deepfakes.
 * @param {string} url
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeUrl(url) {
  const { data } = await api.post('/analyze/url', { url })
  return data
}

/**
 * Fetch analysis history (latest N results).
 * @param {number} limit — max results to fetch (default 5)
 * @returns {Promise<AnalysisResult[]>}
 */
export async function fetchHistory(limit = 5) {
  const { data } = await api.get('/history', { params: { limit } })
  return data
}

/**
 * Fetch a single analysis result by ID.
 * @param {string} id
 * @returns {Promise<AnalysisResult>}
 */
export async function fetchAnalysis(id) {
  const { data } = await api.get(`/report/${id}`)
  return data
}

/**
 * Fetch global forensic statistics.
 * @returns {Promise<{total_analyses: number, high_risk: number, low_risk: number, medium_risk: number, average_trust_score: number}>}
 */
export async function fetchStats() {
  const { data } = await api.get('/stats')
  return data
}


/**
 * Mock analysis result — used when backend is not available (dev mode).
 * Set VITE_MOCK_API=true in .env to enable.
 */
export function mockAnalyze(file) {
  return new Promise((resolve) => {
    const score = Math.floor(Math.random() * 100)
    const risk = score >= 70 ? 'LOW' : score >= 40 ? 'MEDIUM' : 'HIGH'
    setTimeout(() => {
      resolve({
        id: `mock-${Date.now()}`,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        trust_score: score,
        risk_level: risk,
        signals: {
          video: {
            label: 'Video Signal',
            score: Math.floor(Math.random() * 100),
            indicators: ['Face boundary artifacts', 'Blinking pattern analysis', 'Micro-expression consistency'],
            anomalies: score < 40 ? ['Eye region inconsistencies detected', 'Mouth sync mismatch'] : [],
          },
          audio: {
            label: 'Audio Signal',
            score: Math.floor(Math.random() * 100),
            indicators: ['Vocal frequency analysis', 'Background noise fingerprint', 'Breathing pattern'],
            anomalies: score < 40 ? ['Spectral gaps in 4-8kHz band'] : [],
          },
          metadata: {
            label: 'Metadata Integrity',
            score: Math.floor(Math.random() * 100),
            indicators: ['EXIF chain validation', 'Codec fingerprint', 'Creation timestamp'],
            anomalies: score < 50 ? ['Metadata timestamp inconsistency'] : [],
          },
        },
        forensic_report: {
          summary: score >= 70
            ? `This ${file.type.includes('video') ? 'video' : 'audio'} shows strong authenticity signals with minimal manipulation indicators. Metadata chain is intact and no significant artifacts were detected.`
            : score >= 40
            ? `This media exhibits moderate-risk signals. Several indicators suggest possible compression or re-encoding history. Metadata shows minor inconsistencies that may reflect platform processing rather than intentional manipulation.`
            : `High-risk manipulation signals detected. Multiple forensic tracers indicate this media has been synthesized or significantly altered. Facial boundary artifacts and audio-visual desynchronization are prominent.`,
          compression_history: `Detected ${Math.floor(Math.random() * 3) + 1} re-encoding event(s)`,
          provenance_strength: ['WEAK', 'MODERATE', 'STRONG'][Math.floor(Math.random() * 3)],
          manipulation_markers: score < 50
            ? ['GAN fingerprint patterns', 'DCT coefficient anomalies', 'Temporal inconsistencies']
            : [],
        },
        analyzed_at: new Date().toISOString(),
      })
    }, 2500 + Math.random() * 1000)
  })
}

/**
 * Mock URL analysis result.
 */
export function mockAnalyzeUrl(url) {
  const isInstagram = url.includes('instagram.com') || url.includes('instagr.am');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `mock-url-${Date.now()}`,
        filename: isInstagram ? "Instagram Reel Analysis" : "Dhurandhar The Revenge - AARI AARI | Ranveer Singh",
        source_url: url,
        trust_score: isInstagram ? 42 : 81,
        risk_level: isInstagram ? "Medium" : "Low",
        ai_generated: false,
        explanation: isInstagram 
          ? "Medium risk: Audio-visual desync detected in Instagram Reel. Possible shallowfake."
          : "Trust score 81/100. No major manipulation signals. Content appears authentic.",
        file_type: "video",
        signals: {
          video: {
            score: isInstagram ? 0.45 : 0.1788,
            ai_generated_score: 0.259,
            manipulation_regions: [
              {
                timestamp: 12.5,
                regions: [
                  { x: 30, y: 40, w: 20, h: 20, confidence: 0.88 }
                ]
              }
            ],
            heatmap_url: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1000"
          },
          audio: {
            score: isInstagram ? 0.55 : 0.2413,
            tts_score: 0.1919,
            duration: 30,
            anomaly_segments: isInstagram ? [
              { start: 5.0, end: 8.2, reason: "Acoustic mismatch", confidence: 0.72 }
            ] : []
          },
          metadata: { score: 0.15 }
        },
        forensic_report: {
            summary: isInstagram 
              ? "Reel content shows signs of localized facial manipulation."
              : "Content appears authentic with standard compression markers.",
            provenance: [
                { event: `Ingested from ${isInstagram ? 'Instagram' : 'YouTube'}`, detail: "Verified source.", risk: "low", timestamp: "T+0ms" }
            ]
        },
        analyzed_at: new Date().toISOString()
      })
    }, 3000)
  })
}

export default api
