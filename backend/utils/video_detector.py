import cv2
import numpy as np
from PIL import Image
from facenet_pytorch import MTCNN
import tensorflow as tf
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from models.model_loader import get_model

mtcnn = MTCNN(keep_all=False, device="cpu")

def detect_video(filepath):
    cap = cv2.VideoCapture(filepath)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    indices = np.linspace(0, total_frames - 1, 30, dtype=int)

    scores = []
    model = get_model()

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue

        pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        face = mtcnn(pil_img)

        if face is None:
            continue

        face_np = face.permute(1, 2, 0).numpy()
        face_np = (face_np * 128 + 128).clip(0, 255).astype(np.uint8)
        face_resized = cv2.resize(face_np, (299, 299))
        face_input = tf.keras.applications.xception.preprocess_input(
            face_resized.astype(np.float32)
        )
        face_input = np.expand_dims(face_input, axis=0)

        features = model.predict(face_input, verbose=0)
        score = float(np.mean(features))
        scores.append(score)

    cap.release()

    if len(scores) == 0:
        return {
            "score": 0.5,
            "frames_analyzed": 0,
            "inconsistency_regions": False,
            "label": "No face detected — fallback score",
            "no_face": True
        }

    avg_score = float(np.mean(scores))
    normalized = (avg_score + 1) / 2
    fake_prob = 1 - normalized
    inconsistency = sum(1 for s in scores if s < -0.2) / len(scores) > 0.4

    return {
        "score": round(fake_prob, 4),
        "frames_analyzed": len(scores),
        "inconsistency_regions": inconsistency,
        "label": "Likely Deepfake" if fake_prob > 0.5 else "Likely Real",
        "no_face": False
    }
