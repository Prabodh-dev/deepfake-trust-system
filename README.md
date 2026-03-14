# DeepShield — Deepfake Trust & Attribution System

> **AI-powered forensic deepfake detection system** that provides trust scores (0-100) instead of binary fake/real classification.

Built for **Cyberthon '26 (Problem Statement 2)** at SRM Institute of Science & Technology, Chennai.

---

## 🎯 What It Does

DeepShield analyzes videos and audio files to detect:
- **Face-swap deepfakes** (using XceptionNet trained on FaceForensics++)
- **AI-generated content** (Stable Diffusion, Midjourney, DALL-E)
- **GAN voice cloning** (spectral analysis + MFCC anomaly detection)
- **Metadata tampering** (re-encoding history, suspicious software signatures)

**Output**: Trust score (0-100), risk level (Low/Medium/High), visual heatmap, and detailed forensic report.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- FFmpeg, FFprobe, ExifTool installed globally

### Backend Setup

```bash
# Clone repository
git clone https://github.com/Prabodh-dev/deepfake-trust-system.git
cd deepfake-trust-system

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend server
python backend/app.py
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📡 API Usage

### Analyze File

```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "file=@video.mp4"
```

### Analyze YouTube/Instagram URL

```bash
curl -X POST http://localhost:5000/api/analyze/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=..."}'
```

### Get Analysis History

```bash
curl http://localhost:5000/api/history?limit=10
```

### Get Forensic Report

```bash
curl http://localhost:5000/api/report/<analysis_id>
```

### Get Global Statistics

```bash
curl http://localhost:5000/api/stats
```

---

## 📂 Project Structure

```
deepfake-trust-system/
├── backend/
│   ├── app.py                      # Flask application entry point
│   ├── config.py                   # Configuration (weights, thresholds)
│   ├── routes/
│   │   └── analyze.py              # API endpoints
│   ├── utils/
│   │   ├── video_detector.py       # Face-swap + AI-generated detection
│   │   ├── audio_detector.py       # GAN voice cloning detection
│   │   ├── metadata_extractor.py   # EXIF/provenance analysis
│   │   └── scoring.py              # Trust score calculation
│   ├── db/
│   │   └── database.py             # SQLite operations
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── UploadZone.jsx
│   │   │   ├── TrustGauge.jsx
│   │   │   ├── SignalBreakdown.jsx
│   │   │   ├── ForensicReport.jsx
│   │   │   └── ...
│   │   ├── pages/Landing/          # Landing page sections
│   │   ├── api/client.js           # Axios API client
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── tests/
    ├── sample_files/               # Test media files
    └── test_*.py                   # Unit tests
```

---

## 🔬 How It Works

### 1. **Video Analysis** (80% weight)
- Samples 30 frames from video (20%-80% duration)
- **Face-swap detection**: XceptionNet model (HuggingFace `prithivMLmods/Deep-Fake-Detector-Model`)
- **AI-generated detection**: 13-signal heuristic analysis + AI classifier
  - Checks: DCT frequencies, noise floor, edge uniformity, vignetting, chromatic aberration, etc.
- Generates **Grad-CAM heatmap** showing suspicious facial regions

### 2. **Audio Analysis** (15% weight)
- Extracts audio via FFmpeg
- **GAN voice cloning detection**:
  - Spectral rolloff variance (cloned voices are unnaturally flat)
  - MFCC variance (reused embeddings)
  - Spectral flatness (GAN vocoders > 0.4)
  - Zero-crossing rate (TTS lacks stop consonants)
- Compression chain analysis (re-encoding count)

### 3. **Metadata Forensics** (5% weight)
- EXIF/XMP extraction via ExifTool
- Detects: missing camera metadata, suspicious resolutions (512×512), date mismatches, deepfake encoder signatures
- Builds **provenance chain** with per-event risk contributions

### 4. **Trust Score Calculation**
```python
raw_fake = (0.80 × video) + (0.15 × audio) + (0.05 × metadata)

# AI-generated boost (if detected)
if ai_video > 0.26 and tts_audio > 0.55:
    ai_boost = (ai_video × 0.20) + (tts_audio × 0.10)

trust_score = 100 - (raw_fake × 100)
risk_level = "Low" if score ≥ 70 else "Medium" if score ≥ 40 else "High"
```

---

## 🛠️ Configuration

Edit `backend/config.py` to customize:

```python
MODEL_PATH          = 'backend/models/xception.pt'
UPLOAD_FOLDER       = 'backend/uploads'
MAX_FILE_SIZE       = 200 * 1024 * 1024  # 200 MB
VIDEO_WEIGHT        = 0.80   # 80% weight
AUDIO_WEIGHT        = 0.15   # 15% weight
METADATA_WEIGHT     = 0.05   # 5% weight
ALLOWED_EXTENSIONS  = {'mp4', 'mov', 'avi', 'mp3', 'wav'}
```

Frontend API URL in `.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Supported Formats

- **Video**: MP4, MOV, AVI
- **Audio**: MP3, WAV
- **URLs**: YouTube, Instagram (via yt-dlp)
- **Max file size**: 200 MB
- **Batch analysis**: Up to 5 files per request

---

## 🧪 Testing

```bash
# Run backend tests
pytest tests/

# Test specific module
pytest tests/test_p1.py -v
```

---

## 🎨 Frontend Features

- **Upload Zone**: Drag-and-drop file upload + URL input
- **Trust Gauge**: Animated 0-100 score with color-coded risk
- **Signal Breakdown**: Visual breakdown of video/audio/metadata scores
- **Heatmap Overlay**: Grad-CAM visualization on suspicious frames
- **Forensic Report**: Provenance chain with timeline events
- **History Dashboard**: Recent analyses with auto-refresh
- **Responsive Design**: TailwindCSS with cinematic dark theme

---

## 📦 Dependencies

### Backend
```
flask==3.0.0
flask-cors==4.0.0
torch, torchvision, transformers
opencv-python, Pillow
librosa, soundfile
yt-dlp
```

### Frontend
```
react, react-dom, react-router-dom
axios, chart.js, react-chartjs-2
framer-motion, lucide-react
tailwindcss, vite
```

**External Tools** (must be installed):
- FFmpeg, FFprobe
- ExifTool

---

## 🔐 Environment Variables

Create `.env` in `backend/` (optional):
```bash
FLASK_ENV=development
DATABASE_PATH=backend/db/history.db
```

Create `.env` in `frontend/`:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_MOCK_API=false
```

---

## 🚨 Known Limitations

- **Model accuracy**: ~85% on FaceForensics++ dataset (high-quality deepfakes may evade detection)
- **Audio-only analysis**: Limited to spectral heuristics (no deep learning voice cloning detector)
- **Large files**: >200MB files rejected (use compression or chunking)
- **Real-time processing**: Not optimized for live streaming (30s-2min analysis time)

---

## 📝 API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ping` | GET | Health check |
| `/api/analyze` | POST | Analyze uploaded file (multipart/form-data) |
| `/api/analyze/url` | POST | Analyze YouTube/Instagram URL |
| `/api/analyze/batch` | POST | Analyze up to 5 files |
| `/api/history` | GET | Fetch analysis history (`?limit=N`) |
| `/api/report/:id` | GET | Fetch full forensic report |
| `/api/heatmap/:id` | GET | Fetch heatmap image |
| `/api/stats` | GET | Global statistics (total, risk breakdown, avg score) |
| `/api/history/clear` | DELETE | Clear all history |

---

## 👥 Team

- **P1** — ML/AI Engineer (Video detection, model integration)
- **P2** — Audio & Forensics (Audio analysis, metadata extraction)
- **P3** — Backend Lead (Flask API, database, scoring logic)
- **P4** — Frontend & Presenter (React UI, presentation)

---

## 📄 License

This project was built for **Cyberthon '26** educational hackathon. Code is provided as-is for reference and learning purposes.

---

## 🙏 Acknowledgments

- **FaceForensics++** dataset for XceptionNet training
- **HuggingFace** for pre-trained models
- **yt-dlp** for URL video ingestion
- **ExifTool** by Phil Harvey for metadata extraction

---

## 📧 Contact

For questions or collaboration:
- GitHub: [@Prabodh-dev](https://github.com/Prabodh-dev)
- Repository: [deepfake-trust-system](https://github.com/Prabodh-dev/deepfake-trust-system)
