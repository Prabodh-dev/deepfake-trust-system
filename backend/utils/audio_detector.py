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


def detect_tts_artifacts(y: np.ndarray, sr: int) -> float:
    """
    Detect fully TTS-synthesised audio (ElevenLabs, Bark, XTTS, etc.)
    by checking three patterns that TTS models always leave behind.

    Unlike GAN voice cloning (which manipulates a real voice), TTS generates
    speech from scratch — no real human voice is involved at all. This
    produces different and more extreme artefacts.

    Pattern 1 — Unnatural silence gaps
        Real speech has micro-pauses filled with breath noise and room tone.
        TTS goes completely silent between words/sentences and the gaps are
        suspiciously regular in length. Detected by measuring RMS energy per
        frame and counting frames that fall below a silence threshold.

    Pattern 2 — Pitch variance too low
        Real speakers drift in pitch naturally (vibrato, stress, emotion).
        TTS keeps pitch unnaturally flat and controlled. Detected via
        librosa.pyin which extracts the fundamental frequency (F0) over time.
        Low std dev of voiced F0 values = TTS-like.

    Pattern 3 — Energy envelope too regular
        Real speech energy fluctuates dramatically (loud vowels, quiet
        consonants, breath peaks). TTS compresses this dynamic range,
        producing a suspiciously even energy envelope. Detected by measuring
        the coefficient of variation (std/mean) of the RMS energy envelope.

    Parameters
    ----------
    y  : np.ndarray  raw audio samples at *sr* Hz
    sr : int         sample rate (expected: 16 000 Hz)

    Returns
    -------
    float [0.0, 1.0] — higher = more likely fully TTS-synthesised
    """

    # ── Pattern 1: Unnatural silence gaps ────────────────────────────── #
    # Compute RMS energy per frame. Count frames below silence threshold.
    # TTS silence frames are perfectly zero; real silence has background noise.
    frame_length = 512
    hop_length   = 160

    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

    SILENCE_THRESHOLD = 0.01   # frames below this are "silent"
    total_frames   = len(rms)
    silent_frames  = int(np.sum(rms < SILENCE_THRESHOLD))
    silence_ratio  = silent_frames / total_frames if total_frames > 0 else 0.0

    # High silence ratio alone isn't suspicious — check regularity too.
    # Find lengths of consecutive silent runs; low variance = unnaturally regular.
    is_silent = rms < SILENCE_THRESHOLD
    silent_run_lengths = []
    run = 0
    for s in is_silent:
        if s:
            run += 1
        elif run > 0:
            silent_run_lengths.append(run)
            run = 0
    if run > 0:
        silent_run_lengths.append(run)

    if len(silent_run_lengths) > 1:
        run_std  = float(np.std(silent_run_lengths))
        run_mean = float(np.mean(silent_run_lengths))
        # Low coefficient of variation = gaps are unnaturally equal in length
        cv = run_std / (run_mean + 1e-6)
        regularity_sub = float(np.clip(1.0 - cv, 0.0, 1.0))
    else:
        regularity_sub = 0.0

    # Combine: suspicious if BOTH silence ratio is high AND gaps are regular
    silence_sub = float(np.clip(silence_ratio * 2.0, 0.0, 1.0))  # normalise 50% → 1.0
    gap_score   = 0.50 * silence_sub + 0.50 * regularity_sub

    # ── Pattern 2: Pitch variance too low ────────────────────────────── #
    # librosa.pyin returns F0 estimates and a voiced flag per frame.
    # Only use voiced frames — unvoiced frames have no pitch by definition.
    try:
        f0, voiced_flag, _ = librosa.pyin(
            y,
            fmin=librosa.note_to_hz('C2'),   # ~65 Hz  — below any human voice
            fmax=librosa.note_to_hz('C7'),   # ~2093 Hz — above any human voice
            sr=sr,
        )
        voiced_f0 = f0[voiced_flag == 1.0]

        if len(voiced_f0) > 10:
            pitch_std = float(np.std(voiced_f0))
            # Real speakers: std > 20 Hz typical. TTS: often < 5 Hz.
            PITCH_STD_THRESHOLD = 20.0
            pitch_sub = float(np.clip(1.0 - (pitch_std / PITCH_STD_THRESHOLD), 0.0, 1.0))
        else:
            pitch_sub = 0.0   # not enough voiced frames to judge
    except Exception:
        pitch_sub = 0.0       # pyin can fail on very short clips

    # ── Pattern 3: Energy envelope too regular ───────────────────────── #
    # Coefficient of variation of RMS energy. Real speech: CV > 1.0.
    # TTS compresses dynamic range: CV < 0.5 is suspicious.
    mean_rms = float(np.mean(rms))
    std_rms  = float(np.std(rms))
    cv_rms   = std_rms / (mean_rms + 1e-6)

    CV_THRESHOLD = 1.0   # below this = unnaturally even
    energy_sub = float(np.clip(1.0 - (cv_rms / CV_THRESHOLD), 0.0, 1.0))

    # ── Weighted combination ──────────────────────────────────────────── #
    # Pitch variance is the most reliable single TTS indicator (0.40).
    # Energy regularity is second (0.35).
    # Silence gap pattern is weakest alone but corroborates (0.25).
    tts_score = (
        0.40 * pitch_sub  +
        0.35 * energy_sub +
        0.25 * gap_score
    )
    return round(float(np.clip(tts_score, 0.0, 1.0)), 4)


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
        0.25  spectral_flatness  — GAN indicator; vocoders blur harmonic
                                   energy, pushing flatness above 0.4
        0.25  mfcc_sub          — synthetic voices reuse learned embeddings,
                                   giving unnaturally low MFCC variance
        0.25  gan_score         — rolloff variance (flat in GAN) +
                                   spectral contrast (compressed in GAN)
        0.20  tts_score         — pitch variance, energy regularity, and
                                   silence gap patterns specific to TTS
        0.10  zcr_sub           — voiced/unvoiced transition dynamics
        0.05  compression_sub   — codec re-encode history
    """
    _FALLBACK = {
        "score": 0.5,
        "mfcc_anomaly": False,
        "spectral_flatness": 0.0,
        "gan_score": 0.0,
        "tts_score": 0.0,
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
                            "score": 0.1,
                            "mfcc_anomaly": False,
                            "spectral_flatness": 0.0,
                            "gan_score": 0.0,
                            "tts_score": 0.0,
                            "compression_chain": 0,
                            "label": "No audio stream found",
                        }
                    raise RuntimeError(f"FFmpeg failed: {stderr_output}")
            except FileNotFoundError:
                return {
                    "score": 0.1,
                    "mfcc_anomaly": False,
                    "spectral_flatness": 0.0,
                    "gan_score": 0.0,
                    "tts_score": 0.0,
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
        # 7. TTS artifact detection                                           #
        # Pitch variance, energy regularity, silence gap patterns.           #
        # Catches ElevenLabs, Bark, XTTS — no real voice involved at all.   #
        # ------------------------------------------------------------------ #
        tts_score = detect_tts_artifacts(y, sr)

        # ------------------------------------------------------------------ #
        # 8. Compression chain detection                                      #
        # ------------------------------------------------------------------ #
        compression_chain = _get_compression_chain(filepath)
        compression_sub = float(np.clip(compression_chain / 3.0, 0.0, 1.0))

        # ------------------------------------------------------------------ #
        # 9. Composite anomaly score                                          #
        # flatness  0.30 → 0.25  (TTS score added, rebalanced)               #
        # compression 0.10 → 0.05  (less discriminative than TTS/GAN)        #
        # ------------------------------------------------------------------ #
        score = float(
            0.25 * flatness_sub +
            0.25 * mfcc_sub +
            0.25 * gan_score +
            0.20 * tts_score +
            0.10 * zcr_sub +
            0.05 * compression_sub
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
            "tts_score": tts_score,
            "compression_chain": compression_chain,
            "label": label,
        }

    except sf.SoundFileError:
        return _FALLBACK

    finally:
        if tmp_wav and os.path.exists(tmp_wav):
            os.remove(tmp_wav)