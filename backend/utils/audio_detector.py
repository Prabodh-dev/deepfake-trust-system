import os
import json
import tempfile
import subprocess
import numpy as np
import librosa
import soundfile as sf


VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


def detect_gan_artifacts(y: np.ndarray, sr: int) -> float:
    """
    Detect GAN voice synthesis artifacts using spectral rolloff variance
    and spectral contrast.

    GAN-generated audio has two telltale signs:
    - Unusually LOW spectral rolloff variance → the frequency cutoff
      barely moves over time (real voices shift constantly)
    - Unusually LOW spectral contrast → GAN audio lacks the sharp
      peaks and valleys of natural speech harmonics

    Parameters
    ----------
    y  : np.ndarray  raw audio samples
    sr : int         sample rate

    Returns
    -------
    float [0, 1] — higher means more likely GAN-synthesised
    """

    # ── Spectral rolloff variance ─────────────────────────────────────── #
    # Rolloff = frequency below which 85% of energy sits.
    # Real voices shift this a lot; GAN voices keep it unnaturally flat.
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)        # (1, T)
    rolloff_std = float(np.std(rolloff))

    # Normalise: std < 500 Hz is suspiciously flat → score near 1
    ROLLOFF_STD_THRESHOLD = 500.0
    rolloff_sub = float(np.clip(1.0 - (rolloff_std / ROLLOFF_STD_THRESHOLD), 0.0, 1.0))

    # ── Spectral contrast ────────────────────────────────────────────── #
    # Contrast measures the difference between peaks and valleys in each
    # frequency band. Natural speech has rich harmonic structure (high
    # contrast). GAN audio is spectrally smoother (low contrast).
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)      # (7, T)
    mean_contrast = float(np.mean(contrast))

    # Normalise: contrast < 10 dB average is suspiciously flat
    CONTRAST_THRESHOLD = 10.0
    contrast_sub = float(np.clip(1.0 - (mean_contrast / (CONTRAST_THRESHOLD * 3)), 0.0, 1.0))

    # Weighted combination
    gan_score = round(float(0.60 * rolloff_sub + 0.40 * contrast_sub), 4)
    return max(0.0, min(gan_score, 1.0))


def _get_compression_chain(filepath: str) -> int:
    """
    Use ffprobe to count how many times the audio codec changed in the
    file's encoding history.

    Each codec change = one re-encode event. Multiple re-encodes are
    common in manipulated/processed media but rare in original recordings.

    Returns
    -------
    int — number of detected codec changes (0 = likely original)
    """
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_streams",
                filepath,
            ],
            capture_output=True,
            text=True,
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

            # Also check tags for encoder history
            tags = stream.get("tags", {})
            for key in ("encoder", "handler_name"):
                val = tags.get(key, "").lower().strip()
                if val:
                    codecs_seen.add(val)

        # Every codec beyond the first implies at least one re-encode
        return max(0, len(codecs_seen) - 1)

    except Exception:
        return 0


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
        score             – float [0, 1]  (higher = more suspicious)
        mfcc_anomaly      – bool          (True if MFCC variance looks synthetic)
        spectral_flatness – float         (mean spectral flatness across the clip)
        gan_score         – float [0, 1]  (GAN artifact likelihood)
        compression_chain – int           (number of codec changes detected)
        label             – str

    Scoring weights
    ---------------
        0.30  spectral_flatness  — strongest GAN indicator; vocoders blur
                                   harmonic energy, pushing flatness above 0.4
        0.25  mfcc_sub          — synthetic voices reuse learned embeddings,
                                   giving unnaturally low MFCC variance
        0.25  gan_score         — rolloff variance (flat in GAN) +
                                   spectral contrast (compressed in GAN)
        0.10  zcr_sub           — GAN models under-produce stop-consonant
                                   voiced/unvoiced transitions
        0.10  compression_sub   — multiple codec changes indicate re-processing
    """
    _FALLBACK = {
        "score": 0.5,
        "mfcc_anomaly": False,
        "spectral_flatness": 0.0,
        "gan_score": 0.0,
        "compression_chain": 0,
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
            try:
                result = subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
                if result.returncode != 0:
                    stderr_output = result.stderr.decode(errors='replace')
                    if "does not contain any stream" in stderr_output or \
                       "Output file does not contain any stream" in stderr_output:
                        return {
                            "score": 0.5,
                            "mfcc_anomaly": False,
                            "spectral_flatness": 0.0,
                            "gan_score": 0.0,
                            "compression_chain": 0,
                            "label": "No audio stream found",
                        }
                    raise RuntimeError(f"FFmpeg failed: {stderr_output}")
            except FileNotFoundError:
                return {
                    "score": 0.5,
                    "mfcc_anomaly": False,
                    "spectral_flatness": 0.0,
                    "gan_score": 0.0,
                    "compression_chain": 0,
                    "label": "No audio stream found",
                }
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
        # 20-coeff MFCCs encode vocal tract shape. Real speech continuously   #
        # reshapes the tract → high variance. Cloned voices reuse learned     #
        # embeddings → unnaturally low variance.                              #
        # ------------------------------------------------------------------ #
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)   # (20, T)
        mfcc_std_per_coeff = np.std(mfcc, axis=1)
        mean_mfcc_std = float(np.mean(mfcc_std_per_coeff))

        MFCC_STD_THRESHOLD = 4.0
        mfcc_anomaly = mean_mfcc_std < MFCC_STD_THRESHOLD
        mfcc_sub = float(np.clip(1.0 - (mean_mfcc_std / (MFCC_STD_THRESHOLD * 2)), 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 4. Spectral flatness                                                #
        # Wiener entropy: 0 = pure tone, 1 = white noise.                    #
        # GAN vocoders smear harmonic energy → flatness > 0.4.               #
        # ------------------------------------------------------------------ #
        flatness = librosa.feature.spectral_flatness(y=y)     # (1, T)
        mean_flatness = float(np.mean(flatness))

        FLATNESS_THRESHOLD = 0.4
        flatness_sub = float(np.clip(mean_flatness / FLATNESS_THRESHOLD, 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 5. Zero-crossing rate                                               #
        # Correlates with voiced/unvoiced transitions. TTS models often       #
        # under-produce fine-grained stop-consonant dynamics.                 #
        # ------------------------------------------------------------------ #
        zcr = librosa.feature.zero_crossing_rate(y)           # (1, T)
        mean_zcr = float(np.mean(zcr))

        ZCR_THRESHOLD = 0.15
        zcr_sub = float(np.clip(mean_zcr / ZCR_THRESHOLD, 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 6. GAN artifact detection                                           #
        # Rolloff variance (flat in GAN) + spectral contrast (compressed).   #
        # ------------------------------------------------------------------ #
        gan_score = detect_gan_artifacts(y, sr)

        # ------------------------------------------------------------------ #
        # 7. Compression chain detection                                      #
        # ------------------------------------------------------------------ #
        compression_chain = _get_compression_chain(filepath)
        compression_sub = float(np.clip(compression_chain / 3.0, 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 8. Composite anomaly score                                          #
        # ------------------------------------------------------------------ #
        score = float(
            0.30 * flatness_sub +
            0.25 * mfcc_sub +
            0.25 * gan_score +
            0.10 * zcr_sub +
            0.10 * compression_sub
        )
        score = round(min(max(score, 0.0), 1.0), 4)

        # ------------------------------------------------------------------ #
        # 9. Human-readable label                                             #
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
            "gan_score": gan_score,
            "compression_chain": compression_chain,
            "label": label,
        }

    except sf.SoundFileError:
        return _FALLBACK

    finally:
        if tmp_wav and os.path.exists(tmp_wav):
            os.remove(tmp_wav)