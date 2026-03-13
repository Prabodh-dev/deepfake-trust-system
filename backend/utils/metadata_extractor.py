import json
import subprocess
import os

os.environ["PATH"] += r";C:\Windows\exiftool"
os.environ["PATH"] += r";C:\Windows\System32"

# Reduced critical fields — only fields real cameras always have
CRITICAL_FIELDS = ["CreateDate", "Make", "Model"]

SUSPICIOUS_SOFTWARE_KEYWORDS = [
    "deepfake", "faceswap", "reface", "deepfacelab", "facefusion",
    "runway", "synthesia", "d-id", "wav2lip", "first-order-motion",
    "adobe firefly", "midjourney", "stable diffusion", "sora",
]

def _run_exiftool(filepath: str) -> dict:
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
    streams = ffprobe_data.get("streams", [])
    fmt = ffprobe_data.get("format", {})
    tags = fmt.get("tags", {})

    encoder_tags = set()

    for key in ("encoder", "Encoder", "major_brand", "compatible_brands"):
        val = tags.get(key, "").strip()
        if val:
            encoder_tags.add(val.lower())

    for stream in streams:
        stream_tags = stream.get("tags", {})
        for key in ("encoder", "Encoder", "handler_name"):
            val = stream_tags.get(key, "").strip()
            if val:
                encoder_tags.add(val.lower())

    reencodes = max(0, len(encoder_tags) - 1)

    lavf_markers = [t for t in encoder_tags if "lavf" in t or "lavc" in t or "ffmpeg" in t]
    if lavf_markers:
        reencodes += len(lavf_markers)

    return min(reencodes, 10)

def _check_software_mismatch(exif_data: dict) -> bool:
    software = exif_data.get("Software", "").lower().strip()

    if not software:
        return False  # Don't penalize missing software field anymore

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
    _FALLBACK = {
        "score": 0.2,
        "missing_fields": [],
        "software_mismatch": False,
        "compression_reencodes": 0,
        "label": "Unknown",
    }

    try:
        exif_data = _run_exiftool(filepath)
        ffprobe_data = _run_ffprobe(filepath)

        missing_fields = [f for f in CRITICAL_FIELDS if not exif_data.get(f)]
        software_mismatch = _check_software_mismatch(exif_data)
        compression_reencodes = _count_reencodes(ffprobe_data)

        score = 0.0
        score += len(missing_fields) * 0.10      # max 0.30
        if software_mismatch:
            score += 0.10
        score += min(compression_reencodes * 0.05, 0.15)  # max 0.15

        score = round(min(score, 1.0), 4)

        return {
            "score": score,
            "missing_fields": missing_fields,
            "software_mismatch": software_mismatch,
            "compression_reencodes": compression_reencodes,
            "label": _build_label(score),
        }

    except FileNotFoundError as exc:
        print(f"[metadata_extractor] Tool not found: {exc}. Is ExifTool installed?")
        return _FALLBACK

    except Exception as exc:
        print(f"[metadata_extractor] Unexpected error: {exc}")
        return _FALLBACK