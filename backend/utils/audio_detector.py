import os
import tempfile
import subprocess
import numpy as np
import librosa
import soundfile as sf

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

_FALLBACK = {
    "score": 0.5,
    "mfcc_anomaly": False,
    "spectral_flatness": 0.0,
    "label": "uncertain",
}

def has_audio_stream(filepath: str) -> bool:
    """Check if the file has an audio stream using ffprobe."""
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "a",
        "-show_entries", "stream=codec_type",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filepath
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return b"audio" in result.stdout

def analyze_audio(filepath: str) -> dict:
    tmp_wav = None

    try:
        ext = os.path.splitext(filepath)[1].lower()

        if ext in VIDEO_EXTENSIONS:
            # Check if video has audio stream first
            if not has_audio_stream(filepath):
                return {
                    "score": 0.5,
                    "mfcc_anomaly": False,
                    "spectral_flatness": 0.0,
                    "label": "No audio stream found",
                }

            tmp_fd, tmp_wav = tempfile.mkstemp(suffix=".wav")
            os.close(tmp_fd)

            cmd = [
                "ffmpeg", "-y",
                "-i", filepath,
                "-ac", "1",
                "-ar", "16000",
                tmp_wav,
            ]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            if result.returncode != 0:
                raise RuntimeError(
                    f"FFmpeg failed: {result.stderr.decode(errors='replace')}"
                )
            load_path = tmp_wav
        else:
            load_path = filepath

        try:
            y, sr = librosa.load(load_path, sr=16000, mono=True)
        except Exception:
            return _FALLBACK

        if len(y) == 0:
            return _FALLBACK

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

        score = float(
            0.45 * flatness_sub +
            0.40 * mfcc_sub +
            0.15 * zcr_sub
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
            "label": label,
        }

    except Exception:
        return _FALLBACK

    finally:
        if tmp_wav and os.path.exists(tmp_wav):
            os.remove(tmp_wav)
