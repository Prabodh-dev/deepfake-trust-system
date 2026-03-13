import os
import json
import tempfile
import subprocess
import numpy as np
import librosa
import soundfile as sf


VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


def detect_gan_artifacts(y: np.ndarray, sr: int) -> float:
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    rolloff_std = float(np.std(rolloff))
    ROLLOFF_STD_THRESHOLD = 500.0
    rolloff_sub = float(np.clip(1.0 - (rolloff_std / ROLLOFF_STD_THRESHOLD), 0.0, 1.0))

    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    mean_contrast = float(np.mean(contrast))
    CONTRAST_THRESHOLD = 10.0
    contrast_sub = float(np.clip(1.0 - (mean_contrast / (CONTRAST_THRESHOLD * 3)), 0.0, 1.0))

    gan_score = round(float(0.60 * rolloff_sub + 0.40 * contrast_sub), 4)
    return max(0.0, min(gan_score, 1.0))


def _get_compression_chain(filepath: str) -> int:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", filepath],
            capture_output=True, text=True,
        )
        if result.returncode != 0 or not result.stdout.strip():
            return 0

        data = json.loads(result.stdout)
        streams = data.get("streams", [])
        codecs_seen = set()
        for stream in streams:
            codec = stream.get("codec_name", "").lower().strip()
            if codec and codec not in ("", "none"):
                codecs_seen.add(codec)
            tags = stream.get("tags", {})
            for key in ("encoder", "handler_name"):
                val = tags.get(key, "").lower().strip()
                if val:
                    codecs_seen.add(val)
        return max(0, len(codecs_seen) - 1)
    except Exception:
        return 0


def analyze_audio(filepath: str) -> dict:
    _FALLBACK = {
        "score": 0.5,
        "mfcc_anomaly": False,
        "spectral_flatness": 0.0,
        "gan_score": 0.0,
        "compression_chain": 0,
        "label": "uncertain",
    }

    tmp_wav = None

    try:
        ext = os.path.splitext(filepath)[1].lower()

        if ext in VIDEO_EXTENSIONS:
            tmp_fd, tmp_wav = tempfile.mkstemp(suffix=".wav")
            os.close(tmp_fd)

            cmd = ["ffmpeg", "-y", "-i", filepath, "-ac", "1", "-ar", "16000", tmp_wav]
            try:
                result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                if result.returncode != 0:
                    stderr_output = result.stderr.decode(errors='replace')
                    if "does not contain any stream" in stderr_output or \
                       "Output file does not contain any stream" in stderr_output:
                        return {
                            "score": 0.1,          # ← FIXED was 0.5
                            "mfcc_anomaly": False,
                            "spectral_flatness": 0.0,
                            "gan_score": 0.0,
                            "compression_chain": 0,
                            "label": "No audio stream found",
                        }
                    raise RuntimeError(f"FFmpeg failed: {stderr_output}")
            except FileNotFoundError:
                return {
                    "score": 0.1,                  # ← FIXED was 0.5
                    "mfcc_anomaly": False,
                    "spectral_flatness": 0.0,
                    "gan_score": 0.0,
                    "compression_chain": 0,
                    "label": "No audio stream found",
                }
            load_path = tmp_wav
        else:
            load_path = filepath

        try:
            y, sr = librosa.load(load_path, sr=16000, mono=True)
        except Exception as exc:
            raise sf.SoundFileError(str(exc)) from exc

        if len(y) == 0:
            raise sf.SoundFileError("Audio signal is empty after loading.")

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        mfcc_std_per_coeff = np.std(mfcc, axis=1)
        mean_mfcc_std = float(np.mean(mfcc_std_per_coeff))
        MFCC_STD_THRESHOLD = 4.0
        mfcc_anomaly = mean_mfcc_std < MFCC_STD_THRESHOLD
        mfcc_sub = float(np.clip(1.0 - (mean_mfcc_std / (MFCC_STD_THRESHOLD * 2)), 0.0, 1.0))

        flatness = librosa.feature.spectral_flatness(y=y)
        mean_flatness = float(np.mean(flatness))
        FLATNESS_THRESHOLD = 0.4
        flatness_sub = float(np.clip(mean_flatness / FLATNESS_THRESHOLD, 0.0, 1.0))

        zcr = librosa.feature.zero_crossing_rate(y)
        mean_zcr = float(np.mean(zcr))
        ZCR_THRESHOLD = 0.15
        zcr_sub = float(np.clip(mean_zcr / ZCR_THRESHOLD, 0.0, 1.0))

        gan_score = detect_gan_artifacts(y, sr)

        compression_chain = _get_compression_chain(filepath)
        compression_sub = float(np.clip(compression_chain / 3.0, 0.0, 1.0))

        score = float(
            0.30 * flatness_sub +
            0.25 * mfcc_sub +
            0.25 * gan_score +
            0.10 * zcr_sub +
            0.10 * compression_sub
        )
        score = round(min(max(score, 0.0), 1.0), 4)

        if score < 0.35:
            label = "likely_real"
        elif score < 0.65:
            label = "uncertain"
        else:
            label = "likely_synthetic"

        return {
            "score": score,
            "mfcc_anomaly": mfcc_anomaly,
            "spectral_flatness": round(mean_flatness, 6),
            "gan_score": gan_score,
            "compression_chain": compression_chain,
            "label": label,
        }

    except sf.SoundFileError:
        return _FALLBACK

    finally:
        if tmp_wav and os.path.exists(tmp_wav):
            os.remove(tmp_wav)