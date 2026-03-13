import json
import os
import subprocess
from datetime import datetime


# Fields whose absence strongly suggests a synthetic or re-processed file
# GPSInfo removed — most users have GPS off, too many false positives
CRITICAL_FIELDS = ["CreateDate"]

# Keywords in the Software field that indicate deepfake / AI generation tools
SUSPICIOUS_SOFTWARE_KEYWORDS = [
    "deepfake", "faceswap", "reface", "deepfacelab", "facefusion",
    "runway", "synthesia", "d-id", "wav2lip", "first-order-motion",
    "adobe firefly", "midjourney", "stable diffusion", "sora",
]

# Resolutions commonly used by AI face-generation models
# Real phone/camera recordings are never these square low-res sizes
SUSPICIOUS_RESOLUTIONS = {
    (512, 512), (256, 256), (128, 128), (1024, 1024),
    (512, 256), (256, 512), (640, 640),
}

# Encoder strings left behind by deepfake / AI processing tools
# Found inside ffprobe stream tags
DEEPFAKE_ENCODER_SIGNATURES = [
    "lavf",          # FFmpeg muxer — file was re-processed through FFmpeg
    "lavc",          # FFmpeg codec — re-encoded with FFmpeg
    "ffmpeg",        # Explicit FFmpeg tag
    "deepfacelab",   # DeepFaceLab encoder tag
    "facefusion",    # FaceFusion
    "faceswap",      # FaceSwap
    "handbrake",     # HandBrake re-encoder (common in manipulation workflow)
    "obs",           # OBS screen recorder — suspicious for "real" footage
    "davinci",       # DaVinci Resolve — video was edited
    "premiere",      # Adobe Premiere — video was edited
]


def _run_exiftool(filepath: str) -> dict:
    """Run exiftool -json on a file and return the first metadata record."""
    result = subprocess.run(
        ["exiftool", "-json", filepath],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0 or not result.stdout.strip():
        return {}
    try:
        records = json.loads(result.stdout)
        return records[0] if records else {}
    except (json.JSONDecodeError, IndexError):
        return {}


def _run_ffprobe(filepath: str) -> dict:
    """Run ffprobe to get stream/format info as a dict."""
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            "-show_format",
            filepath,
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0 or not result.stdout.strip():
        return {}
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {}


def _count_reencodes(ffprobe_data: dict) -> int:
    """
    Estimate re-encode count from ffprobe stream data.

    Heuristics used:
    - Multiple streams of the same type suggest re-packaging.
    - Encoder tags referencing generic muxers (e.g. Lavf) indicate
      the file passed through FFmpeg at least once.
    - Each distinct encoder tag found across streams counts as one
      re-encode event.
    """
    streams = ffprobe_data.get("streams", [])
    fmt = ffprobe_data.get("format", {})
    tags = fmt.get("tags", {})

    encoder_tags = set()

    # Collect encoder strings from format-level tags
    for key in ("encoder", "Encoder", "major_brand", "compatible_brands"):
        val = tags.get(key, "").strip()
        if val:
            encoder_tags.add(val.lower())

    # Collect encoder strings from each stream's tags
    for stream in streams:
        stream_tags = stream.get("tags", {})
        for key in ("encoder", "Encoder", "handler_name"):
            val = stream_tags.get(key, "").strip()
            if val:
                encoder_tags.add(val.lower())

    # Every distinct encoder entry beyond the first implies a re-encode
    reencodes = max(0, len(encoder_tags) - 1)

    # Also bump if we see telltale FFmpeg/Lavf markers
    lavf_markers = [t for t in encoder_tags if "lavf" in t or "lavc" in t or "ffmpeg" in t]
    if lavf_markers:
        reencodes += len(lavf_markers)

    return min(reencodes, 10)  # cap at 10 to avoid absurd values


def _check_suspicious_resolution(ffprobe_data: dict) -> bool:
    """
    Return True if the video resolution matches known AI generation sizes.
    Real cameras never produce 512x512 or 256x256 footage.
    """
    for stream in ffprobe_data.get("streams", []):
        w = stream.get("width", 0)
        h = stream.get("height", 0)
        if w and h and (w, h) in SUSPICIOUS_RESOLUTIONS:
            return True
    return False


def _check_date_mismatch(filepath: str, exif_data: dict) -> bool:
    """
    Return True if the file's actual modification date on disk is
    suspiciously far from the CreateDate stored in its metadata.

    Deepfakes are often generated fresh but given old metadata dates,
    or vice versa — the file on disk is old but metadata was wiped/reset.
    A gap of more than 30 days is flagged as suspicious.
    """
    create_date_str = exif_data.get("CreateDate", "")
    if not create_date_str:
        return False  # no date to compare against
    try:
        # ExifTool format: "2024:03:13 10:00:00"
        meta_date = datetime.strptime(create_date_str[:10], "%Y:%m:%d")
        file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
        diff_days = abs((file_mtime - meta_date).days)
        return diff_days > 30
    except Exception:
        return False  # if parsing fails, don't penalise


def _check_encoder_signatures(ffprobe_data: dict) -> int:
    """
    Scan all ffprobe stream and format tags for known deepfake /
    AI-processing tool encoder signatures.

    Returns
    -------
    int — number of distinct suspicious signatures found (0 = clean)
    """
    all_tags = []

    # Collect all tag values from format level
    for val in ffprobe_data.get("format", {}).get("tags", {}).values():
        all_tags.append(str(val).lower())

    # Collect all tag values from each stream
    for stream in ffprobe_data.get("streams", []):
        for val in stream.get("tags", {}).values():
            all_tags.append(str(val).lower())

    hits = set()
    for sig in DEEPFAKE_ENCODER_SIGNATURES:
        if any(sig in tag for tag in all_tags):
            hits.add(sig)

    return len(hits)


def _build_label(score: float) -> str:
    if score < 0.30:
        return "Clean Metadata"
    if score < 0.60:
        return "Suspicious Metadata"
    return "High-Risk Metadata"


def extract_metadata(filepath: str) -> dict:
    """
    Extract and analyse metadata from a media file using ExifTool and ffprobe.

    Parameters
    ----------
    filepath : str
        Path to the media file (video or audio).

    Returns
    -------
    dict with keys:
        score                – float [0, 1]  metadata risk score
        missing_fields       – list[str]     critical fields absent from file
        compression_reencodes– int           estimated number of re-encode events
        suspicious_resolution– bool          True if resolution matches AI gen sizes
        date_mismatch        – bool          True if metadata date vs disk date gap > 30d
        encoder_hits         – int           number of deepfake encoder signatures found
        label                – str
    """
    _FALLBACK = {
        "score": 0.5,
        "missing_fields": [],
        "compression_reencodes": 0,
        "suspicious_resolution": False,
        "date_mismatch": False,
        "encoder_hits": 0,
        "label": "Unknown",
    }

    try:
        exif_data = _run_exiftool(filepath)
        ffprobe_data = _run_ffprobe(filepath)

        # ------------------------------------------------------------------ #
        # 1. Check for missing critical fields                                #
        # ------------------------------------------------------------------ #
        missing_fields = [f for f in CRITICAL_FIELDS if not exif_data.get(f)]

        # ------------------------------------------------------------------ #
        # 2. Compression / re-encode history via ffprobe                      #
        # ------------------------------------------------------------------ #
        compression_reencodes = _count_reencodes(ffprobe_data)

        # ------------------------------------------------------------------ #
        # 3. Additional checks                                                #
        # ------------------------------------------------------------------ #
        suspicious_resolution = _check_suspicious_resolution(ffprobe_data)
        date_mismatch = _check_date_mismatch(filepath, exif_data)
        encoder_hits = _check_encoder_signatures(ffprobe_data)

        # ------------------------------------------------------------------ #
        # 4. Confidence-weighted risk score                                   #
        #                                                                     #
        #  HIGH confidence (strong, reliable indicators):                     #
        #    +0.35  suspicious resolution  — real cameras never do 512x512   #
        #    +0.15  per encoder signature  — direct deepfake tool fingerprint #
        #                                                                     #
        #  MEDIUM confidence:                                                 #
        #    +0.20  date mismatch          — metadata date vs file on disk   #
        #                                                                     #
        #  LOW confidence:                                                    #
        #    +0.08  per missing field                                         #
        #    +0.05  per re-encode          — capped at 0.15                  #
        # ------------------------------------------------------------------ #
        score = 0.0

        # High confidence
        if suspicious_resolution:
            score += 0.35
        score += min(encoder_hits * 0.15, 0.30)

        # Medium confidence
        if date_mismatch:
            score += 0.20

        # Low confidence
        score += len(missing_fields) * 0.08
        score += min(compression_reencodes * 0.05, 0.15)

        score = round(min(score, 1.0), 4)

        return {
            "score": score,
            "missing_fields": missing_fields,
            "compression_reencodes": compression_reencodes,
            "suspicious_resolution": suspicious_resolution,
            "date_mismatch": date_mismatch,
            "encoder_hits": encoder_hits,
            "label": _build_label(score),
        }

    except FileNotFoundError as exc:
        print(f"[metadata_extractor] Tool not found: {exc}. Is ExifTool installed?")
        return _FALLBACK

    except Exception as exc:
        print(f"[metadata_extractor] Unexpected error: {exc}")
        return _FALLBACK