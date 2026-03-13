import json
import subprocess
import os

os.environ["PATH"] += r";C:\Windows\exiftool"
os.environ["PATH"] += r";C:\Windows\System32"

# Fields whose absence strongly suggests a synthetic or re-processed file
CRITICAL_FIELDS = ["CreateDate", "Make", "Model", "Software", "GPSInfo"]

# Keywords in the Software field that indicate deepfake / AI generation tools
SUSPICIOUS_SOFTWARE_KEYWORDS = [
    "deepfake", "faceswap", "reface", "deepfacelab", "facefusion",
    "runway", "synthesia", "d-id", "wav2lip", "first-order-motion",
    "adobe firefly", "midjourney", "stable diffusion", "sora",
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


def _check_software_mismatch(exif_data: dict) -> bool:
    """
    Return True if the Software field is absent OR contains a known
    deepfake / AI-generation tool name.
    """
    software = exif_data.get("Software", "").lower().strip()

    if not software:
        return True  # Absent software field is itself suspicious

    for keyword in SUSPICIOUS_SOFTWARE_KEYWORDS:
        if keyword in software:
            return True

    return False


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
        software_mismatch    – bool          True if Software tag is absent/suspicious
        compression_reencodes– int           estimated number of re-encode events
        label                – str
    """
    _FALLBACK = {
        "score": 0.5,
        "missing_fields": [],
        "software_mismatch": False,
        "compression_reencodes": 0,
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
        # 2. Software mismatch / absence                                      #
        # ------------------------------------------------------------------ #
        software_mismatch = _check_software_mismatch(exif_data)

        # ------------------------------------------------------------------ #
        # 3. Compression / re-encode history via ffprobe                      #
        # ------------------------------------------------------------------ #
        compression_reencodes = _count_reencodes(ffprobe_data)

        # ------------------------------------------------------------------ #
        # 4. Risk score                                                        #
        #    +0.20 per missing critical field                                  #
        #    +0.20 if software mismatch                                        #
        #    +0.10 per re-encode (capped at 0.30)                              #
        # ------------------------------------------------------------------ #
        score = 0.0
        score += len(missing_fields) * 0.20
        if software_mismatch:
            score += 0.20
        score += min(compression_reencodes * 0.10, 0.30)

        score = round(min(score, 1.0), 4)

        return {
            "score": score,
            "missing_fields": missing_fields,
            "software_mismatch": software_mismatch,
            "compression_reencodes": compression_reencodes,
            "label": _build_label(score),
        }

    except FileNotFoundError as exc:
        # exiftool or ffprobe not installed
        print(f"[metadata_extractor] Tool not found: {exc}. Is ExifTool installed?")
        return _FALLBACK

    except Exception as exc:
        print(f"[metadata_extractor] Unexpected error: {exc}")
        return _FALLBACK