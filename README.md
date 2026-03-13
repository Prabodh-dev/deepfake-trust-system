# Deepfake Trust & Attribution System

**Cyberthon 26 — Problem Statement 2**
SRM Institute of Science & Technology, Chennai Ramapuram

## Team

- P1 — ML / AI Engineer
- P2 — Audio & Forensics
- P3 — Backend (Team Lead)
- P4 — Frontend & Presenter

## Tech Stack

- Backend: Python, Flask, SQLite
- ML: PyTorch, XceptionNet (FaceForensics++)
- Audio: librosa, FFmpeg, ExifTool
- Frontend: React, Vite, TailwindCSS

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
python backend/app.py
```

## API Endpoints

- GET /ping
- POST /api/analyze — multipart/form-data, field name: file
- GET /api/history
- GET /api/report/:id
- DELETE /api/history/clear
