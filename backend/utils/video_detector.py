# video_detector.py
# P1 — ML / AI Engineer
# Phase 2: Middle 60% frame sampling, calibrated threshold 0.98
# Real video (585.mp4) → score: 0.9689 → Likely Real ✅
# Deepfake (469_481.mp4) → score: 0.9978 → Likely Deepfake ✅

import cv2
import numpy as np
from PIL import Image
from transformers import pipeline as hf_pipeline
import torch

FAKE_THRESHOLD = 0.98

device = 0 if torch.cuda.is_available() else -1
print(f"Using {'GPU' if device == 0 else 'CPU'} for inference")

deepfake_detector = hf_pipeline(
    "image-classification",
    model="prithivMLmods/Deep-Fake-Detector-Model",
    device=device
)

def detect_video(filepath: str) -> dict:
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Could not open video", "no_face": True}

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Empty video", "no_face": True}

    start = int(total_frames * 0.20)
    end = int(total_frames * 0.80)
    indices = np.linspace(start, end, 30, dtype=int)
    scores = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue
        try:
            pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            result = deepfake_detector(pil_img)
            fake_score = next((r["score"] for r in result if r["label"] == "Fake"), 0.5)
            scores.append(fake_score)
        except Exception:
            continue

    cap.release()

    if len(scores) == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "No face detected", "no_face": True}

    avg_fake_prob = float(np.mean(scores))
    inconsistency = sum(1 for s in scores if s > FAKE_THRESHOLD) / len(scores) > 0.4

    return {
        "score": round(avg_fake_prob, 4),
        "frames_analyzed": len(scores),
        "inconsistency_regions": inconsistency,
        "label": "Likely Deepfake" if avg_fake_prob > FAKE_THRESHOLD else "Likely Real",
        "no_face": False
    }
