# 🎯 Cyberthon '26 — P4 (Frontend + Presenter) Battle Plan
**PS2: Deepfake Trust & Attribution System**
**SRM Institute of Science & Technology, Chennai Ramapuram**
**13 March 10:00 AM → 14 March 10:00 AM (24 Hours)**

---

## 🧭 Your Role at a Glance

You are **P4 — Frontend Engineer + Lead Presenter**. You own two critical things:

1. **The Dashboard UI** — the only thing judges actually *see and interact with*. A great UI with a clear trust score visual can win the round even if the ML isn't perfect.
2. **Every presentation moment** — Critique Round, Jury Round 1, and Final Presentation. You are the face of the project.

> **P3 runs the backend. You call it from the frontend. You do not touch backend code.**

---

## 📦 Pre-Hackathon Checklist (Night of 12 March — Before Sleeping)

Do this before 10:00 PM tonight. Verify every step works.

```bash
# 1. Create Vite React project
npm create vite@latest frontend -- --template react
cd frontend

# 2. Install all dependencies
npm install axios chart.js react-chartjs-2 lucide-react

# 3. Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Test dev server loads
npm run dev
```

### Create API Client (do this tonight)
Create `frontend/src/api/client.js`:

**AI Prompt to use:**
> "Write an axios API client module. Create an axios instance with baseURL: http://localhost:5000. Export these functions: (1) analyzeFile(file) — POST /api/analyze with FormData containing the file, (2) getHistory() — GET /api/history, (3) getReport(id) — GET /api/report/:id. All functions return the response data directly. Add a 5-minute timeout for analyzeFile since analysis takes time."

### Pre-hack confirmation
- [ ] `npm run dev` loads without errors
- [ ] `client.js` created with axios instance
- [ ] Cloudflare WARP installed and active
- [ ] 3 demo files ready on your laptop:
  - `demo_real.mp4` → should score 75+ (Risk: Low)
  - `demo_fake.mp4` → should score 25 or below (Risk: High)
  - `demo_ambiguous.mp4` → should score 45–65 (Risk: Medium)

---

## ⏱️ Your Hour-by-Hour Schedule

### PHASE 1 — Core Upload UI (10:00 AM – 2:00 PM)

**Goal:** Build UploadZone + wire it to the API. Show raw JSON result.

#### Task 1 — UploadZone.jsx
File: `frontend/src/components/UploadZone.jsx`

**AI Prompt to use:**
> "Write a React component UploadZone that: (1) Shows a drag-and-drop area with dashed border, (2) Accepts .mp4, .mov, .avi, .mp3, .wav files only, (3) On file drop or click-to-browse, calls the prop function onFileSelected(file), (4) Shows the selected filename and file size once selected, (5) Has an Analyze button that calls the prop onAnalyze(), (6) Shows a spinner/loading state while isLoading prop is true, (7) Uses Tailwind CSS for styling with a dark background (#0f172a) and cyan accent color. Use lucide-react Upload icon."

#### Task 2 — Wire App.jsx
Connect `UploadZone` → POST `/api/analyze` → display raw JSON result on screen temporarily. This confirms backend integration before building pretty components.

```jsx
// App.jsx rough structure for Phase 1
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);

const handleAnalyze = async () => {
  setLoading(true);
  const data = await analyzeFile(selectedFile);
  setResult(data);
  setLoading(false);
};
```

**Phase 1 exit check (2:00 PM):** Upload a file → JSON result appears on screen. Push to `feat/frontend`. ✅

---

### CRITIQUE ROUND — You Lead This (4:00 PM – 5:00 PM)

**5 minutes max. Rest of team keeps coding (P1 especially).**

#### Script
| Time | What to say |
|------|-------------|
| 0:00–0:30 | **Problem:** "Deepfakes are spreading. Binary fake/real detection fails. We built a trust attribution system that gives a score, not just a label." |
| 0:30–1:30 | **Architecture:** Show the pipeline — Upload → Video Analysis → Audio Analysis → Metadata → Trust Score |
| 1:30–3:30 | **Live Demo:** Upload a real video (score ~80+). Upload a deepfake (score <30). Explain the difference briefly. |
| 3:30–4:00 | **What's next:** "By Jury Round we'll have a polished dashboard and batch analysis." |

**Write down every piece of mentor feedback. This feeds directly into Phase 2.**

---

### PHASE 2 — Dashboard UI (5:00 PM – 6:15 PM)

**Goal:** Full visual dashboard. Jury Round 1 must look polished.

#### Task 3 — TrustGauge.jsx
**AI Prompt to use:**
> "Write a React component TrustGauge({score}) using Chart.js doughnut chart that shows a half-arc gauge. Score 0–39 = red, 40–69 = amber, 70–100 = green. Animate on mount from 0 to score value. Show score number in centre. Use react-chartjs-2."

#### Task 4 — RiskBadge.jsx
Shows "Low" / "Medium" / "High" with matching color and lucide-react icon.

| Risk | Color | Icon |
|------|-------|------|
| Low | Green | `ShieldCheck` |
| Medium | Amber | `AlertTriangle` |
| High | Red | `ShieldX` |

#### Task 5 — SignalBreakdown.jsx
3 progress bars showing video / audio / metadata scores individually with labels.

**AI Prompt to use:**
> "Write a React component SignalBreakdown({signals}) that displays 3 horizontal progress bars for video_score, audio_score, and metadata_score (each 0–100). Color each bar: 0–39 red, 40–69 amber, 70–100 green. Show the signal label and label text (e.g. 'Likely Deepfake') next to each bar. Use Tailwind CSS."

#### Task 6 — Wire everything in App.jsx
`UploadZone` → POST `/api/analyze` → show `TrustGauge` + `RiskBadge` + `SignalBreakdown` on result.

#### Task 7 — Prepare 3 Slides for Jury Round 1
- Slide 1: Problem
- Slide 2: Architecture diagram (the pipeline)
- Slide 3: Screenshots of your dashboard

**Phase 2 exit check (6:00 PM):** Push to `feat/frontend`. Dashboard shows gauge + badge + signals. ✅

---

### JURY ROUND 1 — You Lead This (6:15 PM – 8:00 PM)

**10–15 minutes including Q&A. All 4 present.**

#### Presentation Flow
| Min | Slide | You do |
|-----|-------|--------|
| 0:00 | Hook | "In 2026, you cannot trust a video with your eyes. We built a forensic system that can." |
| 1:00 | Problem | Deepfake spread. Binary detection fails. Trust score is needed. |
| 2:30 | Architecture | Hand off to P3 |
| 4:00 | **LIVE DEMO** | You upload files on your laptop. P3 runs backend. Real = 82. Deepfake = 19. |
| 7:00 | Signals | Hand off to P2 (audio), P1 (ML) |
| 9:00 | Q&A | Direct questions to the right person. Own presentation flow questions yourself. |

#### Jury Q&A — Your Prepared Answers
| Question | Your Answer |
|----------|-------------|
| Why not binary fake/real? | Real content gets compressed, forwarded, re-uploaded. A binary label loses context. A trust score reflects the provenance chain and degradation, not just detection. |
| How is the score calculated? | Weighted average: 55% video model, 25% audio anomaly, 20% metadata risk. Weights are configurable in our config. |
| What if face isn't detected? | Falls back to audio + metadata forensics only, which still gives a meaningful trust signal. |
| What model? | (Defer to P1) |
| Audio details? | (Defer to P2) |

---

### PHASE 3 — Full Product (8:00 PM – 2:00 AM)

**Goal:** Features that make judges say "wow."

#### Task 8 — ForensicReport.jsx
**AI Prompt to use:**
> "Write a React component ForensicReport({explanation, provenance}) that shows: (1) An explanation text paragraph with key phrases highlighted in amber color, (2) A vertical timeline component showing each provenance event with its risk_contribution as a colored dot (green=low, amber=medium, red=high risk)."

#### Task 9 — HistorySidebar.jsx
Left panel showing last 5 analyses with mini trust score and filename. Calls `GET /api/history`.

**AI Prompt to use:**
> "Write a React component HistorySidebar that fetches GET /api/history on mount and displays the last 5 analyses as a list. Each item shows: filename (truncated to 20 chars), trust score as a colored number, and risk level badge. Clicking an item calls onSelectHistory(id) prop. Style with Tailwind dark theme."

#### Task 10 — Heatmap Display
If `heatmap_b64` is returned from the API, display the face heatmap image below the gauge.

```jsx
{result?.signals?.video?.heatmap_b64 && (
  <img
    src={`data:image/jpeg;base64,${result.signals.video.heatmap_b64}`}
    alt="Face manipulation heatmap"
    className="rounded-lg mt-4 max-w-sm"
  />
)}
```

#### Task 11 — Complete PPT (10 Slides)
Build this between 10 PM – 12 AM when the dashboard is mostly done.

| Slide | Title | Content |
|-------|-------|---------|
| 1 | Cover | Team name, PS2, Cyberthon '26 |
| 2 | The Problem | Deepfake spread stats. Binary detection failure. |
| 3 | Market Reality | Who needs this: journalism, law enforcement, platforms |
| 4 | Our Solution | Trust score concept. Not fake/real — trust + provenance. |
| 5 | Architecture | Pipeline diagram: Upload → Video → Audio → Metadata → Score |
| 6 | Demo Screenshots | Screenshots of your dashboard with real vs fake results |
| 7 | Signal Breakdown | What each of the 3 signals catches and why |
| 8 | Results | Accuracy numbers from P1. Score comparisons. |
| 9 | Innovation | What's different about our approach vs standard detection |
| 10 | Team | P1, P2, P3, P4 — name, role, one-liner each |

#### Task 12 — Rehearse Demo Script
Practice this until it's smooth:

1. **Real video upload** (30 sec) — drag in `demo_real.mp4`, click Analyze, watch score animate to 82, explain "Low Risk — clean metadata, consistent face"
2. **Deepfake upload** (30 sec) — drag in `demo_fake.mp4`, watch score drop to 17, explain "High Risk — facial inconsistency, audio anomalies, metadata mismatch"
3. **Explain signals** (1 min) — point to each progress bar, explain what triggered

**Phase 3 exit check (2:00 AM):** Full dashboard working. PPT complete. Demo rehearsed once. Push to `feat/frontend`. ✅

---

### PHASE 4 — Rest + Final Polish (2:00 AM – 7:00 AM)

| Time | Task |
|------|------|
| 2:00–3:00 AM | Integration testing with full team. Upload 10 different files. Fix UI bugs. |
| 3:00–5:00 AM | **SLEEP.** PPT must be done by 3:00 AM. P3 monitors backend. |
| 5:00–7:00 AM | Wake up. Full presentation rehearsal. Time it. |

---

### FINAL PRESENTATION (8:00 AM – 10:00 AM)

#### Your 10-Minute Script
| Min | Slide | What you say |
|-----|-------|-------------|
| 0:00 | Cover | "In 2026, a 90-second video destroyed a political career. It was fake. We can prove it." |
| 1:00 | Problem | "Current tools say fake or real. But content gets compressed, forwarded, screen-recorded. Traces degrade. Trust is what matters — not just a label." |
| 2:30 | Solution | Hand to P3 for architecture |
| 4:00 | **DEMO** | Upload real → 82, Low. Upload deepfake → 17, High. Show heatmap. "You can see exactly which frames failed and why." |
| 7:00 | Signals | Hand to P1 (heatmap/temporal), P2 (audio/provenance) |
| 9:00 | Impact | "Use cases: journalists verifying footage, law enforcement, content platforms. This is the forensic layer the internet is missing." |
| 10:00 | Q&A | Direct to right person. Own flow questions yourself. |

---

## 🖥️ Your Complete Component List

| Component | File | Phase | Priority |
|-----------|------|-------|----------|
| API Client | `src/api/client.js` | Pre-hack | 🔴 Critical |
| Upload Zone | `src/components/UploadZone.jsx` | Phase 1 | 🔴 Critical |
| Trust Gauge | `src/components/TrustGauge.jsx` | Phase 2 | 🔴 Critical |
| Risk Badge | `src/components/RiskBadge.jsx` | Phase 2 | 🔴 Critical |
| Signal Breakdown | `src/components/SignalBreakdown.jsx` | Phase 2 | 🔴 Critical |
| Forensic Report | `src/components/ForensicReport.jsx` | Phase 3 | 🟡 Important |
| History Sidebar | `src/components/HistorySidebar.jsx` | Phase 3 | 🟡 Important |
| Heatmap Display | inline in App.jsx | Phase 3 | 🟢 Bonus |

---

## 📡 API Endpoints You Call

| Endpoint | Method | When |
|----------|--------|------|
| `/ping` | GET | On app load (check backend is live) |
| `/api/analyze` | POST | When user clicks Analyze |
| `/api/history` | GET | On load + after each analysis |
| `/api/report/:id` | GET | When user clicks a history item |

**Never change endpoint paths.** P3 owns the backend contract.

---

## 🚨 Rules for You

- **Never commit to `main` or `dev`** — only push to `feat/frontend`
- **Never touch backend files** — coordinate with P3 if you need a response field added
- **Demo files stay on your laptop** — do not commit videos to the repo
- **PPT must be backed up** to Google Drive before 7:00 AM
- **Backend runs on P3's laptop** — your frontend calls `http://localhost:5000` (they share network)

---

## 🌐 Git Workflow

```bash
# Work on your branch only
git checkout feat/frontend

# Save progress regularly
git add .
git commit -m "feat: add TrustGauge component with animated arc"
git push origin feat/frontend

# DO NOT run: git merge, git push origin main
# P3 handles all merges
```

---

*Cyberthon '26 | PS2 — Deepfake Trust & Attribution System*
*P4 Role: Frontend + Lead Presenter*

---

---

# 🎨 WEBSITE DESIGN SYSTEM — DEEPTRUST

> **Aesthetic:** Dark forensic terminal meets high-end SaaS. Deep navy-black background (`#050a0e`), cyan (`#00ffc8`) as the primary accent, Space Grotesk for display headings, DM Sans for body. The feel is: cinematic, technical, trustworthy — like a forensic lab meets a startup product page.

---

## 📐 Full Website Structure (All Pages/Sections)

```
/                     → Landing Page (hero + how it works + components overview + jury Q&A)
/analyze              → Main Dashboard (upload → results)
/report/:id           → Full forensic report for a single analysis
/history              → All past analyses
```

For the hackathon, everything lives in a **single-page app** (SPA) with React Router or just conditional rendering in `App.jsx`.

---

## 🖼️ Section Map (Landing → Dashboard Flow)

```
[NAV]
  Logo + nav links + "SYSTEM ONLINE" status dot

[HERO]
  Left: Headline with glitch hover effect + subheadline + CTA buttons + stat counters
  Right: Floating demo card with spinning conic-gradient border + live gauge + signal bars

[HOW IT WORKS]
  Left: Auto-cycling 4-step pipeline (upload → video → audio → metadata)
  Right: Trust score formula in monospace code block

[DASHBOARD COMPONENTS]
  3-column grid: 6 component cards with phase tag, component name, description

[JURY Q&A]
  2-column grid: 4 Q&A cards

[FOOTER]

→ [DASHBOARD VIEW] (after file upload)
  Left sidebar: HistorySidebar
  Center: UploadZone (pre-analysis) OR results (post-analysis)
  Results: TrustGauge + RiskBadge + SignalBreakdown + ForensicReport + heatmap
```

---

## 💻 Complete React Code — Full Website

Install dependencies first:
```bash
npm install axios chart.js react-chartjs-2 lucide-react
npm install -D tailwindcss postcss autoprefixer
```

Add to `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

---

### `frontend/src/App.jsx` (root, full landing + dashboard toggle)

```jsx
// LandingPage.jsx — Deepfake Trust & Attribution System
// Full-page cinematic landing with canvas particle field, animated hero, and sections
// Stack: React 18 + Tailwind + framer-motion (or CSS-only fallback shown)

import { useState, useEffect, useRef } from "react";

// ─── GLITCH TEXT EFFECT ────────────────────────────────────────────────────────
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";
function useGlitch(original, active) {
  const [text, setText] = useState(original);
  const interval = useRef(null);
  useEffect(() => {
    if (!active) { setText(original); return; }
    let iter = 0;
    clearInterval(interval.current);
    interval.current = setInterval(() => {
      setText(
        original.split("").map((c, i) => {
          if (i < iter) return original[i];
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join("")
      );
      if (iter >= original.length) clearInterval(interval.current);
      iter += 1 / 2;
    }, 28);
    return () => clearInterval(interval.current);
  }, [active, original]);
  return text;
}

// ─── ANIMATED COUNTER (triggers on scroll into view) ──────────────────────────
function Counter({ value, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = value / (duration / 16);
      const t = setInterval(() => {
        start = Math.min(start + step, value);
        setCount(Math.floor(start));
        if (start >= value) clearInterval(t);
      }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── PARTICLE CANVAS (90 nodes, connected mesh, cyan) ─────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,200,${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,255,180,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6 }} />;
}

// ─── TRUST SCORE GAUGE (SVG arc, animates 0→score on mount) ───────────────────
function TrustGauge({ score = 72, size = 180 }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    let s = 0;
    const t = setInterval(() => {
      s = Math.min(s + 2, score);
      setAnimScore(s);
      if (s >= score) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [score]);
  const r = size * 0.38;
  const cx = size / 2, cy = size / 2;
  const circumference = Math.PI * r;
  const dash = (animScore / 100) * circumference;
  const color = animScore >= 70 ? "#00ffc8" : animScore >= 40 ? "#fbbf24" : "#f87171";
  const label = animScore >= 70 ? "Low Risk" : animScore >= 40 ? "Medium Risk" : "High Risk";
  return (
    <div style={{ position: "relative", width: size, height: size * 0.65 }}>
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={size * 0.055} strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth={size * 0.055} strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke 0.5s, stroke-dasharray 0.05s" }} />
        {/* Glow outer arc */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth={size * 0.09} strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`} opacity={0.15}
          style={{ transition: "stroke 0.5s" }} />
      </svg>
      <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 800, color, lineHeight: 1, fontFamily: "'Space Grotesk', monospace" }}>
          {animScore}
        </div>
        <div style={{ fontSize: size * 0.09, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── SIGNAL BAR (staggered entrance animation) ────────────────────────────────
function SignalBar({ label, score, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(score), delay + 200);
    return () => clearTimeout(t);
  }, [score, delay]);
  const color = score >= 70 ? "#00ffc8" : score >= 40 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
        <span style={{ textTransform: "uppercase" }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{score}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${w}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 2, transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: `0 0 8px ${color}66`
        }} />
      </div>
    </div>
  );
}

// ─── RISK BADGE ───────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const map = { Low: ["#00ffc8", "🛡"], Medium: ["#fbbf24", "⚠"], High: ["#f87171", "🚨"] };
  const [color, icon] = map[level] || map.Low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      background: `${color}14`, border: `1px solid ${color}40`,
      color, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    }}>{icon} {level} Risk</span>
  );
}

// ─── AUTO-CYCLING PIPELINE STEP ───────────────────────────────────────────────
function PipelineStep({ icon, title, desc, active }) {
  return (
    <div style={{
      display: "flex", gap: 16, padding: "20px 24px",
      background: active ? "rgba(0,255,200,0.06)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? "rgba(0,255,200,0.25)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 12, transition: "all 0.3s",
      transform: active ? "translateX(4px)" : "none",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        background: active ? "rgba(0,255,200,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(0,255,200,0.4)" : "rgba(255,255,255,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#00ffc8" : "rgba(255,255,255,0.8)", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scanLine, setScanLine] = useState(false);
  const heroText = useGlitch("CANNOT BE TRUSTED", glitchActive);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 4), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setScanLine(true);
      setTimeout(() => setScanLine(false), 120);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#050a0e", color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes floatCard { 0%, 100% { transform: translateY(0px) rotate(-1.5deg); } 50% { transform: translateY(-10px) rotate(-1.5deg); } }
        @keyframes borderSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-up   { animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .fade-up-2 { animation: fadeUp 0.8s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .fade-up-3 { animation: fadeUp 0.8s 0.3s  cubic-bezier(0.22, 1, 0.36, 1) both; }
        .fade-up-4 { animation: fadeUp 0.8s 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .float-card { animation: floatCard 5s ease-in-out infinite; }
        .glow-text  { text-shadow: 0 0 40px rgba(0,255,200,0.35), 0 0 80px rgba(0,255,200,0.15); }
        .card-hover { transition: transform 0.3s, border-color 0.3s; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(0,255,200,0.2) !important; }
        .btn-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #00ffc8, #00d4aa); color: #000;
          font-weight: 700; letter-spacing: 0.04em; border: none;
          padding: 14px 32px; border-radius: 8px; cursor: pointer;
          font-size: 14px; text-transform: uppercase;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 30px rgba(0,255,200,0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(0,255,200,0.5); }
        .btn-primary::after {
          content: ''; position: absolute; top: -50%; left: -60%;
          width: 60%; height: 200%; background: rgba(255,255,255,0.2);
          transform: skewX(-20deg); transition: left 0.4s;
        }
        .btn-primary:hover::after { left: 120%; }
        .btn-ghost {
          background: transparent; color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.15); padding: 14px 32px;
          border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: rgba(0,255,200,0.4); color: #00ffc8; }
        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #00ffc8; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::before { content: ''; display: block; width: 20px; height: 1px; background: #00ffc8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050a0e; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,200,0.3); border-radius: 2px; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 40px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)", background: "rgba(5,10,14,0.85)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #00ffc8, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔬</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15 }}>
            DEEP<span style={{ color: "#00ffc8" }}>TRUST</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {["Analyze", "How It Works", "Trust Score", "Team"].map(item => (
            <a key={item} href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#00ffc8"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>{item}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffc8", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, color: "#00ffc8", letterSpacing: "0.08em" }}>SYSTEM ONLINE</span>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 60, overflow: "hidden" }}>
        <ParticleField />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700,
          background: "radial-gradient(ellipse, rgba(0,255,200,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        {scanLine && <div style={{ position: "absolute", inset: 0, background: "rgba(0,255,200,0.02)", pointerEvents: "none", zIndex: 5 }} />}

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "0 40px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", width: "100%" }}>
          <div>
            <div className="section-label fade-up">Cyberthon '26 · PS2 · DFIR Track</div>
            <h1 className="fade-up-2" style={{ fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(42px, 5vw, 68px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 8, letterSpacing: "-0.02em" }}>
              EVERY VIDEO<br />
              <span style={{ color: "#f87171", cursor: "pointer" }} className="glow-text"
                onMouseEnter={() => setGlitchActive(true)} onMouseLeave={() => setGlitchActive(false)}>
                {heroText}
              </span>
            </h1>
            <h2 className="fade-up-3" style={{ fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 700, color: "#00ffc8", marginBottom: 20 }}>
              Until it's been forensically verified.
            </h2>
            <p className="fade-up-4" style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 480, marginBottom: 36 }}>
              Binary deepfake detection fails in the real world. Our system analyzes signal-level artifacts, metadata integrity, and compression history to deliver a provenance-backed trust score — not just a label.
            </p>
            <div className="fade-up-4" style={{ display: "flex", gap: 14 }}>
              <button className="btn-primary">Analyze a File</button>
              <button className="btn-ghost">View Architecture →</button>
            </div>
            <div className="fade-up-4" style={{ display: "flex", gap: 32, marginTop: 44, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { val: 99, suf: ".6%", label: "Model accuracy (XceptionNet)" },
                { val: 3, suf: " signals", label: "Forensic channels" },
                { val: 24, suf: "hr", label: "Built at Cyberthon '26" },
              ].map(({ val, suf, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: "#00ffc8" }}>
                    <Counter value={val} suffix={suf} />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card with spinning border */}
          <div className="float-card" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -2, borderRadius: 22,
              background: "conic-gradient(from 0deg, #00ffc8, #0070f3, #8b5cf6, #00ffc8)",
              animation: "borderSpin 4s linear infinite", opacity: 0.4, zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1,
              background: "linear-gradient(135deg, rgba(10,20,30,0.95), rgba(5,10,20,0.98))",
              borderRadius: 20, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Analysis Result</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>suspect_video_032.mp4</div>
                </div>
                <RiskBadge level="High" />
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <TrustGauge score={21} size={160} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <SignalBar label="Video — Face Inconsistency" score={18} delay={0} />
                <SignalBar label="Audio — Spectral Anomaly" score={32} delay={200} />
                <SignalBar label="Metadata — Compression Chain" score={44} delay={400} />
              </div>
              <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                <span style={{ color: "#f87171", fontWeight: 600 }}>⚡ Manipulation detected</span> — Facial inconsistency across 22/30 frames. MFCC variance below threshold. File re-encoded 3× with mismatched software headers.
              </div>
              <div style={{ marginTop: 14, fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.06em" }}>
                ANALYZED · 2026-03-13T14:32:11Z · UUID:a4c8-2f9e
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.3 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</div>
          <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, #00ffc8, transparent)" }} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "120px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-label" style={{ justifyContent: "center" }}>System Architecture</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Three Forensic Channels.<br />One Trust Score.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "📤", title: "File Upload", desc: "MP4 · MOV · AVI · MP3 · WAV — up to 200MB via multipart upload to Flask API" },
              { icon: "🎥", title: "Video Analysis — XceptionNet", desc: "30 frames sampled. Face crops via MTCNN. Fake probability averaged. Grad-CAM heatmap generated." },
              { icon: "🎙", title: "Audio Analysis — librosa", desc: "MFCC variance, spectral flatness, zero-crossing rate. GAN voice cloning leaves a flat spectral noise floor." },
              { icon: "🗂", title: "Metadata Forensics — ExifTool", desc: "Creation date, encoder software, compression re-encode count. Missing GPS/MakerNote fields raise risk score." },
            ].map((step, i) => (
              <PipelineStep key={i} {...step} active={activeStep === i} />
            ))}
          </div>
          {/* Score formula panel */}
          <div style={{ background: "rgba(0,255,200,0.03)", border: "1px solid rgba(0,255,200,0.1)", borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 11, color: "#00ffc8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Trust Score Formula</div>
            <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "rgba(255,255,255,0.65)", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <span style={{ color: "#8b9eff" }}>VIDEO_WEIGHT</span> = <span style={{ color: "#00ffc8" }}>0.55</span><br />
              <span style={{ color: "#8b9eff" }}>AUDIO_WEIGHT</span> = <span style={{ color: "#00ffc8" }}>0.25</span><br />
              <span style={{ color: "#8b9eff" }}>META_WEIGHT</span> &nbsp;= <span style={{ color: "#00ffc8" }}>0.20</span><br /><br />
              raw = V×video + A×audio + M×meta<br /><br />
              <span style={{ color: "#fbbf24" }}>trust_score</span> = round(<span style={{ color: "#00ffc8" }}>100</span> − raw×<span style={{ color: "#00ffc8" }}>100</span>)<br /><br />
              ≥ 70 → <span style={{ color: "#00ffc8" }}>Low</span> &nbsp;| ≥ 40 → <span style={{ color: "#fbbf24" }}>Medium</span> | &lt; 40 → <span style={{ color: "#f87171" }}>High</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
          DEEP<span style={{ color: "#00ffc8" }}>TRUST</span>
        </span>
        <span>Cyberthon '26 · SRM IST Chennai · PS2 · Built in 24 hours</span>
        <span>P1 · P2 · P3 · <span style={{ color: "#00ffc8" }}>P4 ★</span></span>
      </footer>
    </div>
  );
}
```

---

## 🔮 Detailed AI Prompts — Website Sections

These prompts are pre-written for copy-pasting into any AI tool (Claude, Copilot, etc.) during the hackathon.

---

### PROMPT 1 — Landing Hero Section

```
Build a React landing page hero section for a deepfake detection product called "DeepTrust".
Dark background: #050a0e. Accent color: #00ffc8 (cyan).

Requirements:
1. Fixed blur navbar with logo "DEEP" + cyan "TRUST", nav links (Analyze, How It Works, Trust Score, Team), and a pulsing "SYSTEM ONLINE" indicator dot on the right
2. Full-viewport hero with canvas particle field behind it (90 particles, cyan dots with mesh connections when within 100px)
3. Left column: small eyebrow label "Cyberthon '26 · PS2 · DFIR Track", large headline "EVERY VIDEO / CANNOT BE TRUSTED" where the second line glitches to random chars on hover, subheadline in cyan, body paragraph, two buttons (btn-primary green gradient with shimmer hover, btn-ghost transparent with cyan hover border), stat row with 3 animated counters that count up when scrolled into view
4. Right column: demo result card that floats (CSS keyframe 0px→-10px) and has a conic-gradient spinning border animation. Card shows: filename, RiskBadge (High Risk, red), animated half-arc SVG trust gauge counting from 0 to 21, 3 signal bars with staggered entrance animations, forensic explanation text, monospace timestamp
5. All entrance animations: staggered fadeUp with 0.15s delays on each element
6. Scroll cue at bottom center: text + gradient line
Use Space Grotesk for headings, DM Sans for body. Import both from Google Fonts.
```

---

### PROMPT 2 — UploadZone Component

```
Write a React component UploadZone.jsx for a deepfake analysis tool.

Style: dark (#0f172a bg), cyan (#00ffc8) accent, Space Grotesk font.

Features:
1. Drag-and-drop area with dashed cyan border (border-dashed, border-cyan-500/30). Shows upload icon (lucide-react Upload) and text "Drop your video or audio file here"
2. "or browse files" link that opens a hidden file input. Accepted: .mp4 .mov .avi .mp3 .wav only. Max 200MB — show error if exceeded.
3. On file selected: show filename, file size (formatted as MB), and a remove button (X)
4. "Analyze File" button: full-width, cyan bg, black text, disabled+spinner when isLoading prop is true
5. isLoading state: show a scanning animation — 3 lines of monospace text that appear sequentially: "Extracting frames...", "Running XceptionNet...", "Computing trust score..." with 800ms delays between each
6. File type icons: video files show 🎥, audio files show 🎙
7. Props: onFileSelected(file), onAnalyze(), isLoading (bool)
```

---

### PROMPT 3 — TrustGauge Component

```
Write a React component TrustGauge.jsx.

It renders a half-arc gauge (like a speedometer) using a raw SVG arc path — NOT Chart.js.

Specs:
- Props: score (0-100), size (default 220px)
- Background arc: full semicircle, rgba(255,255,255,0.08) stroke, rounded caps
- Score arc: same semicircle, but strokeDasharray clipped to (score/100 * arc_length). Color: #f87171 if score<40, #fbbf24 if 40-69, #00ffc8 if >=70. Rounded caps. Stroke width = size*0.055
- Glow arc: same path, thicker (size*0.09), same color, opacity 0.15
- Centered below arc: score number in Space Grotesk 800 weight, colored same as arc
- Below score: risk label "HIGH RISK" / "MEDIUM RISK" / "LOW RISK" in 11px uppercase tracking
- Animation: useEffect interval that increments animScore from 0 to score in steps of 2 every 16ms
- All via inline SVG, no external libs
```

---

### PROMPT 4 — SignalBreakdown Component

```
Write a React component SignalBreakdown.jsx.

Props: signals object from /api/analyze response with shape:
{
  video: { score: float, frames_analyzed: int, label: string },
  audio: { score: float, label: string },
  metadata: { score: float, missing_fields: string[], label: string }
}

Render 3 signal cards stacked vertically. Each card:
- Channel name in 10px uppercase cyan tracking
- Label text (e.g. "Likely Deepfake") in 13px white
- Score number right-aligned, colored by threshold: <40 = #f87171, 40-69 = #fbbf24, >=70 = #00ffc8
- Thin progress bar (height 3px) that animates width from 0 to score% on mount. Stagger: 0ms, 200ms, 400ms. Color matches score color. Has glow: boxShadow 0 0 8px colorWithAlpha
- Extra detail line below bar: for video show "frames_analyzed analyzed", for metadata show count of missing_fields if >0
- Each card has background rgba(255,255,255,0.02) and 1px border rgba(255,255,255,0.06), borderRadius 10px, padding 16px
```

---

### PROMPT 5 — ForensicReport Component

```
Write a React component ForensicReport.jsx.

Props: { explanation: string, provenance: [{ event: string, risk_contribution: float, detail: string }] }

Section 1 — Explanation panel:
- Dark background rgba(255,255,255,0.02), subtle border, borderRadius 10
- The explanation text rendered with key forensic phrases highlighted in amber (#fbbf24) background with 6px border-radius and 2px/4px padding. Highlighted phrases include any of: "facial inconsistency", "MFCC", "spectral", "re-encoded", "metadata mismatch", "GAN", "deepfake", "compression", "anomal"
- "FORENSIC EXPLANATION" label above in 10px uppercase cyan

Section 2 — Provenance Timeline:
- Vertical timeline with left border line (1px rgba(255,255,255,0.1))
- Each event: colored dot on the left line (green=#00ffc8 if risk_contribution<0.3, amber=#fbbf24 if <0.6, red=#f87171 if >=0.6), event title in 13px white, detail text in 12px rgba(255,255,255,0.4)
- "PROVENANCE CHAIN" label above
- Animate: each item fades in with 100ms stagger on mount
```

---

### PROMPT 6 — HistorySidebar Component

```
Write a React component HistorySidebar.jsx.

It fetches GET /api/history on mount using axios and displays the last 5 analyses.

Layout:
- Fixed left sidebar, width 260px, background rgba(0,0,0,0.4), backdrop-filter blur(20px)
- "RECENT ANALYSES" header in 10px uppercase cyan
- Each history item: bordered card (1px rgba(255,255,255,0.06)), hover border rgba(0,255,200,0.2), cursor pointer
  - Top row: filename truncated to 18 chars + "..." if longer, right side: mini trust score number colored by threshold
  - Bottom row: risk level badge (mini), timestamp relative (e.g. "2 min ago")
- Loading state: 3 skeleton pulses
- Empty state: "No analyses yet" in muted text
- Selected item highlighted with rgba(0,255,200,0.06) background

Props: onSelectHistory(id), selectedId
Auto-refresh every 30 seconds.
```

---

### PROMPT 7 — Full App.jsx (Dashboard view after analysis)

```
Write a React App.jsx that composes the full dashboard.

State:
- view: "landing" | "analyze"
- selectedFile: File | null
- isLoading: bool
- result: analysis object | null
- selectedHistoryId: string | null

Layout when view === "analyze":
- Left sidebar: HistorySidebar (width 260px, fixed)
- Center: flex column, if no result show UploadZone, if result show full results
- Results layout: header row (filename + RiskBadge), two-column: left=TrustGauge centered + score explanation, right=SignalBreakdown
- Below: ForensicReport (explanation + provenance)
- If result.signals.video.heatmap_b64 exists: show labeled image below gauge

Landing → Dashboard transition: "Analyze a File" button sets view to "analyze"

API calls use the axios client from src/api/client.js
Handle errors: show red error banner if API call fails
```

---

## 🎨 Color & Animation Quick Reference

| Token | Value | Used for |
|-------|-------|----------|
| `background` | `#050a0e` | Page base |
| `accent-cyan` | `#00ffc8` | Low risk, active states, accents |
| `accent-amber` | `#fbbf24` | Medium risk, highlights |
| `accent-red` | `#f87171` | High risk, danger |
| `accent-indigo` | `#8b9eff` | Code syntax, secondary accents |
| `text-primary` | `#ffffff` | Headings |
| `text-muted` | `rgba(255,255,255,0.45)` | Body copy |
| `text-faint` | `rgba(255,255,255,0.2)` | Timestamps, meta |
| `surface` | `rgba(255,255,255,0.02)` | Card backgrounds |
| `border` | `rgba(255,255,255,0.06)` | Card borders |

| Animation | Duration | Applied to |
|-----------|----------|------------|
| `fadeUp` | 0.8s staggered | Hero elements |
| `floatCard` | 5s infinite | Hero demo card |
| `borderSpin` | 4s linear infinite | Demo card conic border |
| `pulse` | 2s infinite | Status dot |
| Signal bar grow | 1.2s cubic-bezier | Progress bars |
| Counter count-up | 2s | Stat numbers |
| Gauge arc grow | ~1s interval | Trust score |
| Glitch text | 28ms interval | Hero headline on hover |
| Scan flash | 120ms burst / 4s | Full-screen overlay |

---

*Cyberthon '26 | PS2 — Deepfake Trust & Attribution System*
*P4 Role: Frontend + Lead Presenter*
*Website design section added 13 March 2026*