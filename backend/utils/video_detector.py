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
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Could not open video", "no_face": True, "suspicious_timestamps": []}

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Empty video", "no_face": True, "suspicious_timestamps": []}

    fps = cap.get(cv2.CAP_PROP_FPS) or 25

    start = int(total_frames * 0.20)
    end = int(total_frames * 0.80)
    indices = np.linspace(start, end, 30, dtype=int)
    scores = []
    faces_not_detected = 0
    suspicious_timestamps = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue
        try:
            pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            result = deepfake_detector(pil_img)
            top = max(result, key=lambda x: x["score"])
            if top["label"] == "Fake":
                fake_score = top["score"]
            else:
                fake_score = 1.0 - top["score"]
            scores.append(fake_score)

            # Phase 3 — track suspicious timestamps
            if fake_score > FAKE_THRESHOLD:
                timestamp = float(round(idx / fps, 2))
                suspicious_timestamps.append(timestamp)

        except Exception:
            faces_not_detected += 1
            continue

    cap.release()

    # Dynamic no_face check
    no_face = faces_not_detected / max(len(indices), 1) > 0.8

    if len(scores) == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "No face detected", "no_face": True, "suspicious_timestamps": []}

    avg_fake_prob = float(np.mean(scores))

    # Temporal consistency check
    score_variance = float(np.var(scores))
    inconsistency_regions = score_variance > 0.01 or sum(1 for s in scores if s > FAKE_THRESHOLD) / len(scores) > 0.4

    if avg_fake_prob >= FAKE_THRESHOLD:
        calibrated = round(avg_fake_prob, 4)
    else:
        calibrated = round((avg_fake_prob / FAKE_THRESHOLD) * 0.30, 4)

    return {
        "score": calibrated,
        "frames_analyzed": len(scores),
        "inconsistency_regions": inconsistency_regions,
        "label": "Likely Deepfake" if avg_fake_prob >= FAKE_THRESHOLD else "Likely Real",
        "no_face": no_face,
        "suspicious_timestamps": suspicious_timestamps
    }
