import cv2
import numpy as np
from PIL import Image
from transformers import pipeline as hf_pipeline, AutoImageProcessor, AutoModelForImageClassification
from scipy.fftpack import dct
import torch
import base64

FAKE_THRESHOLD = 0.98
AI_GEN_THRESHOLD = 0.65

device = 0 if torch.cuda.is_available() else -1
print(f"Using {'GPU' if device == 0 else 'CPU'} for inference")

deepfake_detector = hf_pipeline(
    "image-classification",
    model="prithivMLmods/Deep-Fake-Detector-Model",
    device=device
)

processor = AutoImageProcessor.from_pretrained("prithivMLmods/Deep-Fake-Detector-Model")
torch_model = AutoModelForImageClassification.from_pretrained(
    "prithivMLmods/Deep-Fake-Detector-Model",
    attn_implementation="eager"
)
torch_model.eval()

def detect_ai_generated_frame(frame_bgr):
    """
    DCT frequency analysis.
    Real camera frames have natural high-frequency sensor noise.
    AI-generated frames are suspiciously smooth.
    Returns: float 0-1, where 1 = likely AI-generated
    """
    try:
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
        gray = cv2.resize(gray, (256, 256))
        dct_coeff = dct(dct(gray.T, norm='ortho').T, norm='ortho')
        h, w = dct_coeff.shape
        hf_energy = np.sum(np.abs(dct_coeff[h//2:, w//2:]))
        lf_energy = np.sum(np.abs(dct_coeff[:h//2, :w//2])) + 1e-8
        hf_lf_ratio = hf_energy / lf_energy
        return float(1.0 - np.clip(hf_lf_ratio / 0.10, 0, 1))
    except Exception:
        return 0.5

def detect_temporal_flicker(video_path, num_frames=15):
    """
    Detect unnatural frame-to-frame pixel changes.
    Real cameras: high natural variance.
    AI videos: suspiciously smooth transitions = low flicker.
    Returns: float 0-1, where 1 = likely AI-generated
    """
    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    indices = np.linspace(int(total*0.2), int(total*0.8), num_frames, dtype=int)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).astype(np.float32))
    cap.release()
    if len(frames) < 2:
        return 0.5
    diffs = [np.std(np.abs(frames[i] - frames[i-1])) for i in range(1, len(frames))]
    return float(np.clip(np.std(diffs) / (np.mean(diffs) + 1e-8), 0, 1))

def compute_ai_generated_score(video_path, frame_dct_scores):
    """
    Combine DCT + temporal flicker scores.
    Weights: flicker 0.8, DCT 0.2 (flicker is stronger signal).
    Calibrated threshold: 0.65 (real ~0.54, AI ~0.75+)
    """
    flicker = detect_temporal_flicker(video_path)
    flicker_ai_score = 1.0 - flicker
    dct_ai_score = float(np.mean(frame_dct_scores)) if frame_dct_scores else 0.5
    return round((0.8 * flicker_ai_score) + (0.2 * dct_ai_score), 4)

def generate_heatmap(frame_bgr):
    pil_img = Image.fromarray(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))
    inputs = processor(images=pil_img, return_tensors="pt")
    with torch.no_grad():
        outputs = torch_model.vision_model(
            pixel_values=inputs['pixel_values'],
            return_dict=True
        )
    hidden = outputs.last_hidden_state.squeeze(0)
    token_scores = hidden.norm(dim=-1).numpy()
    patch_grid = token_scores.reshape(14, 14)
    patch_grid = (patch_grid - patch_grid.min()) / (patch_grid.max() - patch_grid.min() + 1e-8)
    h, w = frame_bgr.shape[:2]
    mask_resized = cv2.resize(patch_grid, (w, h))
    heatmap = cv2.applyColorMap(np.uint8(255 * mask_resized), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(frame_bgr, 0.6, heatmap, 0.4, 0)
    _, buffer = cv2.imencode('.jpg', overlay)
    return base64.b64encode(buffer).decode('utf-8')

def detect_video(filepath: str) -> dict:
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Could not open video", "no_face": True, "heatmap_b64": None, "ai_generated_score": 0.5}

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Empty video", "no_face": True, "heatmap_b64": None, "ai_generated_score": 0.5}

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    start = int(total_frames * 0.20)
    end = int(total_frames * 0.80)
    indices = np.linspace(start, end, 30, dtype=int)
    scores = []
    dct_scores = []
    faces_not_detected = 0
    most_suspicious_frame = None
    max_fake_score = 0

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
            if fake_score > max_fake_score:
                max_fake_score = fake_score
                most_suspicious_frame = frame.copy()
        except Exception:
            faces_not_detected += 1
            continue
        dct_scores.append(detect_ai_generated_frame(frame))

    cap.release()

    no_face = faces_not_detected / max(len(indices), 1) > 0.8
    avg_ai_gen_score = compute_ai_generated_score(filepath, dct_scores)

    if len(scores) == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "No face detected", "no_face": True, "heatmap_b64": None, "ai_generated_score": avg_ai_gen_score}

    avg_fake_prob = float(np.mean(scores))
    score_variance = float(np.var(scores))
    inconsistency_regions = score_variance > 0.01 or sum(1 for s in scores if s > FAKE_THRESHOLD) / len(scores) > 0.4

    if avg_fake_prob >= FAKE_THRESHOLD:
        calibrated = round(avg_fake_prob, 4)
    else:
        calibrated = round((avg_fake_prob / FAKE_THRESHOLD) * 0.30, 4)

    heatmap_b64 = None
    if most_suspicious_frame is not None:
        try:
            heatmap_b64 = generate_heatmap(most_suspicious_frame)
        except Exception:
            heatmap_b64 = None

    return {
        "score": calibrated,
        "frames_analyzed": len(scores),
        "inconsistency_regions": inconsistency_regions,
        "label": "Likely Deepfake" if avg_fake_prob >= FAKE_THRESHOLD else "Likely Real",
        "no_face": no_face,
        "heatmap_b64": heatmap_b64,
        "ai_generated_score": avg_ai_gen_score
    }
