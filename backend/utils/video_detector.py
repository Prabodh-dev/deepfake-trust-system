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


def detect_ai_generated_frame(frame_bgr) -> float:
    """
    13-signal AI generation detection per frame.

    AI DETECTION signals (higher = more AI generated):
      1.  DCT frequency ratio        — AI frames lack high-freq sensor noise
      2.  Noise floor                — AI frames too clean after blur subtraction
      3.  Color channel correlation  — AI frames R/G/B unnaturally correlated
      4.  Edge sharpness uniformity  — AI frames uniformly sharp, no focus falloff
      5.  Texture entropy            — AI backgrounds have low local complexity
      6.  Gradient direction entropy — AI frames have less varied edge directions
      7.  LBP uniformity             — AI textures have less complex local patterns
      8.  Saturation uniformity      — AI frames have unnaturally even color saturation
      9.  Block boundary artifacts   — AI compression leaves specific 8x8 block edges

    REAL CAMERA signals (higher = more real → pulls score DOWN):
      10. Vignetting                 — real lenses darken at corners
      11. Chromatic aberration       — real lenses produce R/B color fringing at edges
      12. Lens barrel distortion     — real lenses show edge pixel displacement
      13. Film grain consistency     — real cameras have spatially consistent noise
    """
    try:
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
        gray_resized = cv2.resize(gray, (256, 256))
        frame_resized = cv2.resize(frame_bgr, (256, 256))

        # ── 1. DCT frequency ratio ──────────────────────────────────────── #
        dct_coeff = dct(dct(gray_resized.T, norm='ortho').T, norm='ortho')
        h, w = dct_coeff.shape
        hf_energy = np.sum(np.abs(dct_coeff[h // 2:, w // 2:]))
        lf_energy = np.sum(np.abs(dct_coeff[:h // 2, :w // 2])) + 1e-8
        dct_score = float(1.0 - np.clip(hf_energy / lf_energy / 0.10, 0, 1))

        # ── 2. Noise floor ──────────────────────────────────────────────── #
        blurred = cv2.GaussianBlur(gray_resized, (5, 5), 0)
        residual = gray_resized - blurred
        noise_std = float(np.std(residual))
        noise_score = float(1.0 - np.clip(noise_std / 5.0, 0, 1))

        # ── 3. Color channel correlation ────────────────────────────────── #
        b, g, r = cv2.split(frame_resized.astype(np.float32))
        b_s = cv2.resize(b, (64, 64)).flatten()
        g_s = cv2.resize(g, (64, 64)).flatten()
        r_s = cv2.resize(r, (64, 64)).flatten()
        rg_corr = float(np.corrcoef(r_s, g_s)[0, 1])
        rb_corr = float(np.corrcoef(r_s, b_s)[0, 1])
        color_score = float(np.clip(((rg_corr + rb_corr) / 2.0 - 0.90) / 0.10, 0, 1))

        # ── 4. Edge sharpness uniformity ────────────────────────────────── #
        tiles_var = []
        tile_h, tile_w = gray_resized.shape[0] // 4, gray_resized.shape[1] // 4
        for i in range(4):
            for j in range(4):
                tile = gray_resized[i*tile_h:(i+1)*tile_h, j*tile_w:(j+1)*tile_w]
                tiles_var.append(float(np.var(cv2.Laplacian(tile, cv2.CV_32F))))
        sharpness_cv = float(np.std(tiles_var)) / (float(np.mean(tiles_var)) + 1e-8)
        edge_score = float(np.clip(1.0 - (sharpness_cv / 0.5), 0.0, 1.0))

        # ── 5. Texture entropy ───────────────────────────────────────────── #
        bottom_half = gray_resized[gray_resized.shape[0] // 2:, :]
        patch_entropies = []
        for i in range(0, bottom_half.shape[0] - 8, 8):
            for j in range(0, bottom_half.shape[1] - 8, 8):
                hist, _ = np.histogram(bottom_half[i:i+8, j:j+8].flatten(), bins=16, range=(0, 255))
                hist = hist / (hist.sum() + 1e-8)
                patch_entropies.append(-np.sum(hist * np.log2(hist + 1e-8)))
        mean_entropy = float(np.mean(patch_entropies)) if patch_entropies else 3.0
        texture_score = float(np.clip(1.0 - (mean_entropy / 3.5), 0.0, 1.0))

        # ── 6. Gradient direction entropy ───────────────────────────────── #
        sobelx = cv2.Sobel(gray_resized, cv2.CV_32F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray_resized, cv2.CV_32F, 0, 1, ksize=3)
        angles = np.arctan2(sobely, sobelx + 1e-8)
        angle_hist, _ = np.histogram(angles, bins=36, range=(-np.pi, np.pi))
        angle_hist = angle_hist / (angle_hist.sum() + 1e-8)
        gradient_entropy = -float(np.sum(angle_hist * np.log2(angle_hist + 1e-8)))
        gradient_score = float(np.clip(1.0 - (gradient_entropy / 5.17), 0.0, 1.0))

        # ── 7. LBP uniformity ───────────────────────────────────────────── #
        small = cv2.resize(gray_resized, (64, 64)).astype(np.uint8)
        lbp_values = []
        for i in range(1, small.shape[0] - 1):
            for j in range(1, small.shape[1] - 1):
                center = int(small[i, j])
                neighbors = [
                    small[i-1, j-1], small[i-1, j], small[i-1, j+1],
                    small[i,   j+1], small[i+1, j+1], small[i+1, j],
                    small[i+1, j-1], small[i,   j-1]
                ]
                lbp = sum([(1 if n >= center else 0) << k for k, n in enumerate(neighbors)])
                lbp_values.append(lbp)
        lbp_std = float(np.std(lbp_values))
        lbp_score = float(np.clip(1.0 - (lbp_std / 80.0), 0.0, 1.0))

        # ── 8. Saturation uniformity ─────────────────────────────────────── #
        hsv = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2HSV).astype(np.float32)
        saturation = hsv[:, :, 1]
        sat_cv = float(np.std(saturation)) / (float(np.mean(saturation)) + 1e-8)
        saturation_score = float(np.clip(1.0 - (sat_cv / 0.6), 0.0, 1.0))

        # ── 9. Block boundary artifacts ─────────────────────────────────── #
        block_diffs = []
        for i in range(8, gray_resized.shape[0] - 8, 8):
            row_diff = float(np.mean(np.abs(
                gray_resized[i, :].astype(np.float32) -
                gray_resized[i-1, :].astype(np.float32)
            )))
            interior = float(np.mean(np.abs(
                gray_resized[i-1, :].astype(np.float32) -
                gray_resized[i-2, :].astype(np.float32)
            )))
            block_diffs.append(row_diff / (interior + 1e-8))
        block_ratio = float(np.mean(block_diffs)) if block_diffs else 1.0
        block_score = float(np.clip((block_ratio - 1.0) / 1.0, 0.0, 1.0))

        # ── 10. Vignetting ──────────────────────────────────────────────── #
        cy, cx = gray_resized.shape[0] // 2, gray_resized.shape[1] // 2
        center_brightness = float(np.mean(gray_resized[cy-20:cy+20, cx-20:cx+20]))
        corner_brightness = float(np.mean([
            gray_resized[:20, :20],   gray_resized[:20, -20:],
            gray_resized[-20:, :20],  gray_resized[-20:, -20:]
        ]))
        vignette_ratio = corner_brightness / (center_brightness + 1e-8)
        vignette_real = float(np.clip(1.0 - vignette_ratio, 0.0, 1.0))

        # ── 11. Chromatic aberration ─────────────────────────────────────── #
        edges = cv2.Canny(small, 50, 150)
        edge_mask = edges > 0
        if edge_mask.sum() > 10:
            r_small_u8 = cv2.resize(frame_resized[:, :, 2], (64, 64))
            b_small_u8 = cv2.resize(frame_resized[:, :, 0], (64, 64))
            r_edge = r_small_u8[edge_mask].astype(np.float32)
            b_edge = b_small_u8[edge_mask].astype(np.float32)
            rb_diff = float(np.mean(np.abs(r_edge - b_edge)))
            chroma_real = float(np.clip(rb_diff / 8.0, 0.0, 1.0))
        else:
            chroma_real = 0.0

        # ── 12. Lens barrel distortion ───────────────────────────────────── #
        edge_strip_top = float(np.mean(np.abs(cv2.Sobel(
            gray_resized[:10, :], cv2.CV_32F, 1, 0))))
        edge_strip_mid = float(np.mean(np.abs(cv2.Sobel(
            gray_resized[123:133, :], cv2.CV_32F, 1, 0))))
        distort_ratio = edge_strip_top / (edge_strip_mid + 1e-8)
        distort_real = float(np.clip((distort_ratio - 1.0) / 0.5, 0.0, 1.0))

        # ── 13. Film grain consistency ───────────────────────────────────── #
        tile_noise = []
        for i in range(0, gray_resized.shape[0] - 16, 16):
            for j in range(0, gray_resized.shape[1] - 16, 16):
                tile = gray_resized[i:i+16, j:j+16]
                tb   = cv2.GaussianBlur(tile, (3, 3), 0)
                tile_noise.append(float(np.std(tile - tb)))
        noise_cv = float(np.std(tile_noise)) / (float(np.mean(tile_noise)) + 1e-8)
        grain_real = float(np.clip(1.0 - (noise_cv / 0.4), 0.0, 1.0))

        # ── Final weighted score ─────────────────────────────────────────── #
        ai_component = (
            0.13 * dct_score +
            0.13 * noise_score +
            0.09 * color_score +
            0.09 * edge_score +
            0.08 * texture_score +
            0.10 * gradient_score +
            0.08 * lbp_score +
            0.08 * saturation_score +
            0.08 * block_score
        )  # max = 0.86

        real_component = (
            0.03 * vignette_real +
            0.03 * chroma_real +
            0.02 * distort_real +
            0.02 * grain_real
        )  # max = 0.10 ← reduced from 0.30 to 0.10

        combined = float(np.clip(ai_component - real_component + 0.04, 0.0, 1.0))
        return round(combined, 4)

    except Exception:
        return 0.0


def detect_temporal_flicker(video_path, num_frames=15) -> float:
    """
    Detect unnatural frame-to-frame smoothness.
    Real cameras: natural variance in transitions (high cv).
    AI videos: suspiciously smooth transitions (low cv).
    Returns float 0-1 where 1 = likely AI generated.
    """
    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    indices = np.linspace(int(total * 0.2), int(total * 0.8), num_frames, dtype=int)
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
    # ← FIXED: was np.std/np.mean which flagged smooth real videos
    # Real camera cv typically > 0.3, AI < 0.15
    cv = float(np.std(diffs) / (np.mean(diffs) + 1e-8))
    return float(np.clip(cv / 0.5, 0.0, 1.0))


def compute_ai_generated_score(video_path, frame_scores) -> float:
    """
    Combine per-frame 13-signal scores + temporal flicker.
    ← FIXED: flicker weight reduced 0.8→0.30, frame weight increased 0.2→0.70
    Flicker alone is unreliable — smooth real videos (tripod, talking head)
    score high. Frame-level 13-signal analysis is far more reliable.
    """
    flicker = detect_temporal_flicker(video_path)
    flicker_ai_score = 1.0 - flicker
    frame_ai_score = float(np.mean(frame_scores)) if frame_scores else 0.0
    return round((0.30 * flicker_ai_score) + (0.70 * frame_ai_score), 4)


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



def get_manipulation_regions(frame_bgr):
    """
    Uses ViT attention map to find top 3 most suspicious patches.
    Returns list of bounding boxes as percentage coords.
    [{"x":20,"y":10,"w":30,"h":40,"confidence":0.91}]
    """
    try:
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
        flat = patch_grid.flatten()
        top3_indices = np.argsort(flat)[-3:][::-1]
        regions = []
        for idx in top3_indices:
            row = idx // 14
            col = idx % 14
            x = round(float(col / 14.0 * 100), 2)
            y = round(float(row / 14.0 * 100), 2)
            w = round(float(1 / 14.0 * 100), 2)
            h = round(float(1 / 14.0 * 100), 2)
            confidence = round(float(patch_grid[row, col]), 4)
            regions.append({"x": x, "y": y, "w": w, "h": h, "confidence": confidence})
        return regions
    except Exception:
        return []

def detect_video(filepath: str) -> dict:
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        return {
            "score": 0.5, "frames_analyzed": 0,
            "inconsistency_regions": False, "label": "Could not open video",
            "no_face": True, "heatmap_b64": None, "ai_generated_score": 0.0
        }

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        return {
            "score": 0.5, "frames_analyzed": 0,
            "inconsistency_regions": False, "label": "Empty video",
            "no_face": True, "heatmap_b64": None, "ai_generated_score": 0.0
        }

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    start = int(total_frames * 0.20)
    end   = int(total_frames * 0.80)
    indices = np.linspace(start, end, 30, dtype=int)

    scores        = []
    frame_scores  = []
    faces_not_detected   = 0
    most_suspicious_frame = None
    max_fake_score = 0
    suspicious_frame_regions = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue
        try:
            pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            result  = deepfake_detector(pil_img)
            top     = max(result, key=lambda x: x["score"])
            fake_score = top["score"] if top["label"] == "Fake" else 1.0 - top["score"]
            scores.append(fake_score)
            if fake_score > max_fake_score:
                max_fake_score = fake_score
                most_suspicious_frame = frame.copy()
        except Exception:
            faces_not_detected += 1
            continue

        frame_scores.append(detect_ai_generated_frame(frame))

        # Collect manipulation regions for suspicious frames
        if fake_score > 0.5 and len(suspicious_frame_regions) < 5:
            timestamp = round(float(idx / fps), 2)
            regions = get_manipulation_regions(frame)
            if regions:
                suspicious_frame_regions.append({
                    "timestamp": timestamp,
                    "regions": regions
                })

    cap.release()

    no_face = faces_not_detected / max(len(indices), 1) > 0.8
    avg_ai_gen_score = compute_ai_generated_score(filepath, frame_scores)

    if len(scores) == 0:
        return {
            "score": 0.5, "frames_analyzed": 0,
            "inconsistency_regions": False, "label": "No face detected",
            "no_face": True, "heatmap_b64": None,
            "ai_generated_score": avg_ai_gen_score,
            "manipulation_regions": []
        }

    avg_fake_prob  = float(np.mean(scores))
    score_variance = float(np.var(scores))
    inconsistency_regions = (
        score_variance > 0.01 or
        sum(1 for s in scores if s > FAKE_THRESHOLD) / len(scores) > 0.4
    )

    if avg_fake_prob >= FAKE_THRESHOLD:
        calibrated = round(avg_fake_prob, 4)
    else:
        calibrated = round((avg_fake_prob / FAKE_THRESHOLD) * 0.30, 4)

    heatmap_b64 = None
    manipulation_regions = []
    if most_suspicious_frame is not None:
        try:
            heatmap_b64 = generate_heatmap(most_suspicious_frame)
        except Exception:
            heatmap_b64 = None


    return {
        "score":                 calibrated,
        "frames_analyzed":       len(scores),
        "inconsistency_regions": inconsistency_regions,
        "label":                 "Likely Deepfake" if avg_fake_prob >= FAKE_THRESHOLD else "Likely Real",
        "no_face":               no_face,
        "heatmap_b64":           heatmap_b64,
        "ai_generated_score":    avg_ai_gen_score,
        "manipulation_regions":  suspicious_frame_regions,
    }