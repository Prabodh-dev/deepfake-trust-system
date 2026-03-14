import cv2
import numpy as np
from PIL import Image
from transformers import pipeline as hf_pipeline, AutoImageProcessor, AutoModelForImageClassification
import torch
import base64

FAKE_THRESHOLD = 0.98

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
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Could not open video", "no_face": True, "heatmap_b64": None}

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "Empty video", "no_face": True, "heatmap_b64": None}

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    start = int(total_frames * 0.20)
    end = int(total_frames * 0.80)
    indices = np.linspace(start, end, 30, dtype=int)
    scores = []
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

            # Track most suspicious frame for heatmap
            if fake_score > max_fake_score:
                max_fake_score = fake_score
                most_suspicious_frame = frame.copy()

        except Exception:
            faces_not_detected += 1
            continue

    cap.release()

    no_face = faces_not_detected / max(len(indices), 1) > 0.8

    if len(scores) == 0:
        return {"score": 0.5, "frames_analyzed": 0, "inconsistency_regions": False, "label": "No face detected", "no_face": True, "heatmap_b64": None}

    avg_fake_prob = float(np.mean(scores))
    score_variance = float(np.var(scores))
    inconsistency_regions = score_variance > 0.01 or sum(1 for s in scores if s > FAKE_THRESHOLD) / len(scores) > 0.4

    if avg_fake_prob >= FAKE_THRESHOLD:
        calibrated = round(avg_fake_prob, 4)
    else:
        calibrated = round((avg_fake_prob / FAKE_THRESHOLD) * 0.30, 4)

    # Generate heatmap on most suspicious frame
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
        "heatmap_b64": heatmap_b64
    }
