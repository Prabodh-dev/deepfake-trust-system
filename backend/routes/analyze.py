from flask import Blueprint, request, jsonify
import os, uuid
from datetime import datetime, timezone
import backend.config as config
from backend.utils.scoring import calculate_trust_score
from backend.db.database import save_analysis, get_history, get_report, clear_history
from backend.utils.video_detector import detect_video

analyze_bp = Blueprint('analyze', __name__)

def allowed_file(filename):
    return ('.' in filename and
            filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS)

def is_video(filename):
    return filename.rsplit('.', 1)[1].lower() in {'mp4', 'mov', 'avi'}

@analyze_bp.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file. Allowed: mp4, mov, avi, mp3, wav"}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(config.UPLOAD_FOLDER, unique_name)
    file.save(filepath)

    try:
        # ── STUBS (P1 and P2 replace these when they push) ──────────────
        video_result = detect_video(filepath) if is_video(file.filename) else {
    "score": 0.5,
    "frames_analyzed": 0,
    "inconsistency_regions": False,
    "label": "N/A - Audio file"
}
        audio_result = {
            "score": 0.5, "mfcc_anomaly": False,
            "spectral_flatness": 0.0, "label": "Pending — P2 not integrated yet"
        }
        metadata_result = {
            "score": 0.5, "missing_fields": [],
            "software_mismatch": False,
            "compression_reencodes": 0, "label": "Pending — P2 not integrated yet"
        }
        # ── END STUBS ─────────────────────────────────────────────────────

        score_data = calculate_trust_score(video_result, audio_result, metadata_result)

        analysis_id = str(uuid.uuid4())
        result = {
            "id":          analysis_id,
            "filename":    file.filename,
            "file_type":   "video" if is_video(file.filename) else "audio",
            "trust_score": score_data["trust_score"],
            "risk_level":  score_data["risk_level"],
            "explanation": score_data["explanation"],
            "signals": {
                "video":    video_result,
                "audio":    audio_result,
                "metadata": metadata_result
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        save_analysis(result)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@analyze_bp.route('/history', methods=['GET'])
def history():
    return jsonify(get_history()), 200

@analyze_bp.route('/report/<analysis_id>', methods=['GET'])
def report(analysis_id):
    data = get_report(analysis_id)
    if not data:
        return jsonify({"error": "Report not found"}), 404
    return jsonify(data), 200

@analyze_bp.route('/history/clear', methods=['DELETE'])
def clear():
    clear_history()
    return jsonify({"cleared": True}), 200