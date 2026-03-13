import os
import tempfile
import subprocess
import numpy as np
import librosa
import soundfile as sf

import os
os.environ["PATH"] += r";C:\ffmpeg\bin"
os.environ["PATH"] += r";C:\Windows\exiftool-13.52_64"


VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


def analyze_audio(filepath: str) -> dict:
    """
    Analyse an audio (or video) file for AI-synthesis anomalies.

    Parameters
    ----------
    filepath : str
        Path to an audio or video file.

    Returns
    -------
    dict with keys:
        score            – float [0, 1]  (higher = more suspicious)
        mfcc_anomaly     – bool          (True if MFCC variance looks synthetic)
        spectral_flatness– float         (mean spectral flatness across the clip)
        label            – str           ('likely_real' | 'uncertain' | 'likely_synthetic')
    """
    _FALLBACK = {
        "score": 0.5,
        "mfcc_anomaly": False,
        "spectral_flatness": 0.0,
        "label": "uncertain",
    }

    tmp_wav = None  # track temp file so we can clean up

    try:
        ext = os.path.splitext(filepath)[1].lower()

        # ------------------------------------------------------------------ #
        # 1. Extract audio from video if necessary                            #
        # ------------------------------------------------------------------ #
        if ext in VIDEO_EXTENSIONS:
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

        # ------------------------------------------------------------------ #
        # 2. Load audio at 16 kHz, mono                                       #
        # ------------------------------------------------------------------ #
        try:
            y, sr = librosa.load(load_path, sr=16000, mono=True)
        except Exception as exc:
            raise sf.SoundFileError(str(exc)) from exc

        if len(y) == 0:
            raise sf.SoundFileError("Audio signal is empty after loading.")

        # ------------------------------------------------------------------ #
        # 3. MFCC features                                                    #
        # ------------------------------------------------------------------ #
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)   # (20, T)
        mfcc_std_per_coeff = np.std(mfcc, axis=1)             # variance over time
        mean_mfcc_std = float(np.mean(mfcc_std_per_coeff))

        # AI-synthesised speech tends to have very consistent (low-variance)
        # MFCC trajectories.  Empirically, mean std < 4.0 is suspicious.
        MFCC_STD_THRESHOLD = 4.0
        mfcc_anomaly = mean_mfcc_std < MFCC_STD_THRESHOLD

        # Normalise into a 0-1 sub-score (lower std → higher suspicion)
        mfcc_sub = float(np.clip(1.0 - (mean_mfcc_std / (MFCC_STD_THRESHOLD * 2)), 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 4. Spectral flatness                                                #
        # ------------------------------------------------------------------ #
        flatness = librosa.feature.spectral_flatness(y=y)     # (1, T)
        mean_flatness = float(np.mean(flatness))

        # Values above 0.4 indicate noise-like / synthetic texture
        FLATNESS_THRESHOLD = 0.4
        flatness_sub = float(np.clip(mean_flatness / FLATNESS_THRESHOLD, 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 5. Zero-crossing rate                                               #
        # ------------------------------------------------------------------ #
        zcr = librosa.feature.zero_crossing_rate(y)           # (1, T)
        mean_zcr = float(np.mean(zcr))

        # Very high ZCR (> 0.15) can indicate noise or artefacts
        ZCR_THRESHOLD = 0.15
        zcr_sub = float(np.clip(mean_zcr / ZCR_THRESHOLD, 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 6. Composite anomaly score                                          #
        # ------------------------------------------------------------------ #
        # Weighted combination – spectral flatness and MFCC variance carry
        # most weight; ZCR is a softer signal.
        score = float(
            0.45 * flatness_sub +
            0.40 * mfcc_sub +
            0.15 * zcr_sub
        )
        score = round(min(max(score, 0.0), 1.0), 4)

        # ------------------------------------------------------------------ #
        # 7. Human-readable label                                             #
        # ------------------------------------------------------------------ #
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

    except sf.SoundFileError:
        return _FALLBACK

    finally:
        if tmp_wav and os.path.exists(tmp_wav):
            os.remove(tmp_wav)