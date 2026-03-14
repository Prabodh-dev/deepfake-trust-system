from flask import Blueprint, request, jsonify
import os, uuid
from datetime import datetime, timezone
import yt_dlp
import backend.config as config
from backend.utils.scoring import calculate_trust_score
from backend.db.database import save_analysis, get_history, get_report, clear_history, get_stats
from backend.utils.video_detector import detect_video
from backend.utils.audio_detector import analyze_audio
from backend.utils.metadata_extractor import extract_metadata, build_provenance_chain

analyze_bp = Blueprint('analyze', __name__)

def allowed_file(filename):
    return ('.' in filename and
            filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS)

def is_video(filename):
    return filename.rsplit('.', 1)[1].lower() in {'mp4', 'mov', 'avi'}

def _strip_response(result, analysis_id):
    if result["signals"]["video"].get("heatmap_b64"):
        if result["risk_level"] in ("High", "Medium"):
            result["signals"]["video"]["heatmap_url"] = f"/api/heatmap/{analysis_id}"
        del result["signals"]["video"]["heatmap_b64"]
    if result["risk_level"] == "Low" or result["signals"]["video"].get("score", 0) < 0.4:
        result["signals"]["video"]["manipulation_regions"] = []
    return result

def _get_ai_generated(video_result, audio_result):
    ai_video_score  = video_result.get("ai_generated_score", 0.0)
    tts_audio_score = audio_result.get("tts_score", 0.0)
    model_ai_score  = video_result.get("model_ai_score", 0.0)
    return bool(
        ai_video_score  > 0.26 or
        tts_audio_score > 0.55 or
        model_ai_score  > 0.60
    )

AUDIO_ONLY_VIDEO = {
    "score": 0.5,
    "frames_analyzed": 0,
    "inconsistency_regions": False,
    "label": "N/A - Audio file",
    "ai_generated_score": 0.0,
    "model_ai_score": 0.0,
    "manipulation_regions": []
}

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

    print(f"[RECEIVED] File: {file.filename} | Size: {os.path.getsize(filepath)} bytes")

    try:
        video_result = detect_video(filepath) if is_video(file.filename) else dict(AUDIO_ONLY_VIDEO)

        audio_result    = analyze_audio(filepath)
        metadata_result = extract_metadata(filepath)
        try:
            metadata_result["provenance_chain"] = build_provenance_chain(filepath)
        except Exception:
            metadata_result["provenance_chain"] = []

        if "anomaly_segments" not in audio_result:
            audio_result["anomaly_segments"] = []

        score_data   = calculate_trust_score(video_result, audio_result, metadata_result)
        ai_generated = _get_ai_generated(video_result, audio_result)

        analysis_id = str(uuid.uuid4())
        result = {
            "id":           analysis_id,
            "filename":     file.filename,
            "file_type":    "video" if is_video(file.filename) else "audio",
            "trust_score":  score_data["trust_score"],
            "risk_level":   score_data["risk_level"],
            "explanation":  score_data["explanation"],
            "ai_generated": ai_generated,
            "signals": {
                "video":    video_result,
                "audio":    audio_result,
                "metadata": metadata_result
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        save_analysis(result)
        result = _strip_response(result, analysis_id)

        print(f"[SENT] File: {file.filename} | Trust Score: {result['trust_score']} | Risk: {result['risk_level']} | AI Generated: {ai_generated}")
        print(f"[SCORES] Video: {video_result['score']} | Audio: {audio_result['score']} | Metadata: {metadata_result['score']} | AI Gen: {video_result.get('ai_generated_score',0)} | Model: {video_result.get('model_ai_score',0)} | SDXL: {video_result.get('sdxl_score',0)} | TTS: {audio_result.get('tts_score',0)}")
        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] File: {file.filename} | Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


@analyze_bp.route('/analyze/url', methods=['POST'])
def analyze_url():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400

    url = data['url'].strip()

    if not any(domain in url for domain in [
        'youtube.com', 'youtu.be',
        'instagram.com', 'instagr.am'
    ]):
        return jsonify({
            "error": "Only YouTube and Instagram URLs are supported"
        }), 400

    unique_name  = str(uuid.uuid4())
    download_dir = config.UPLOAD_FOLDER
    outtmpl      = os.path.join(download_dir, f"{unique_name}.%(ext)s")
    filepath     = None

    print(f"[URL] Downloading: {url}")

    try:
        ydl_opts = {
            'format': 'best[ext=mp4][filesize<200M]/best[ext=mp4]/best/best',
            'outtmpl': outtmpl,
            'quiet': True,
            'no_warnings': True,
            'socket_timeout': 30,
            'merge_output_format': 'mp4',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info        = ydl.extract_info(url, download=True)
            video_title = info.get('title', url)
            duration    = info.get('duration', 0)
            ext         = info.get('ext', 'mp4')
            filepath    = os.path.join(download_dir, f"{unique_name}.{ext}")

        if not os.path.exists(filepath):
            for f in os.listdir(download_dir):
                if f.startswith(unique_name):
                    filepath = os.path.join(download_dir, f)
                    print(f"[URL] Resolved filepath via scan: {filepath}")
                    break

        if duration and duration > 300:
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                "error": f"Video too long ({duration}s). Max 5 minutes allowed."
            }), 400

        if not filepath or not os.path.exists(filepath):
            return jsonify({"error": "Download failed — file not found"}), 500

        print(f"[URL] Downloaded: {video_title} | Size: {os.path.getsize(filepath)} bytes")

        video_result    = detect_video(filepath)
        audio_result    = analyze_audio(filepath)
        metadata_result = extract_metadata(filepath)

        try:
            metadata_result["provenance_chain"] = build_provenance_chain(filepath)
        except Exception:
            metadata_result["provenance_chain"] = []

        if "anomaly_segments" not in audio_result:
            audio_result["anomaly_segments"] = []

        score_data   = calculate_trust_score(video_result, audio_result, metadata_result)
        ai_generated = _get_ai_generated(video_result, audio_result)

        analysis_id = str(uuid.uuid4())
        result = {
            "id":           analysis_id,
            "filename":     video_title,
            "file_type":    "video",
            "source_url":   url,
            "trust_score":  score_data["trust_score"],
            "risk_level":   score_data["risk_level"],
            "explanation":  score_data["explanation"],
            "ai_generated": ai_generated,
            "signals": {
                "video":    video_result,
                "audio":    audio_result,
                "metadata": metadata_result
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        save_analysis(result)
        result = _strip_response(result, analysis_id)

        print(f"[URL] Done: {video_title} | Score: {result['trust_score']} | Risk: {result['risk_level']}")
        return jsonify(result), 200

    except yt_dlp.utils.DownloadError as e:
        print(f"[URL ERROR] Download failed: {str(e)}")
        return jsonify({"error": "Could not download video. Check URL or try another."}), 400

    except Exception as e:
        print(f"[URL ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)


@analyze_bp.route('/history', methods=['GET'])
def history():
    print(f"[HISTORY] Request received")
    return jsonify(get_history()), 200


@analyze_bp.route('/report/<analysis_id>', methods=['GET'])
def report(analysis_id):
    print(f"[REPORT] Requested ID: {analysis_id}")
    data = get_report(analysis_id)
    if not data:
        return jsonify({"error": "Report not found"}), 404
    return jsonify(data), 200


@analyze_bp.route('/history/clear', methods=['DELETE'])
def clear():
    print(f"[CLEAR] History cleared")
    clear_history()
    return jsonify({"cleared": True}), 200


@analyze_bp.route('/analyze/batch', methods=['POST'])
def analyze_batch():
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist('files')
    if len(files) == 0:
        return jsonify({"error": "Empty file list"}), 400

    if len(files) > 5:
        return jsonify({"error": "Max 5 files allowed per batch"}), 400

    results = []
    for file in files:
        if not file.filename or not allowed_file(file.filename):
            results.append({"filename": file.filename, "error": "Invalid file type"})
            continue

        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(config.UPLOAD_FOLDER, unique_name)
        file.save(filepath)

        print(f"[BATCH] Processing: {file.filename}")

        try:
            video_result = detect_video(filepath) if is_video(file.filename) else dict(AUDIO_ONLY_VIDEO)
            audio_result    = analyze_audio(filepath)
            metadata_result = extract_metadata(filepath)
            try:
                metadata_result["provenance_chain"] = build_provenance_chain(filepath)
            except Exception:
                metadata_result["provenance_chain"] = []

            if "anomaly_segments" not in audio_result:
                audio_result["anomaly_segments"] = []

            score_data   = calculate_trust_score(video_result, audio_result, metadata_result)
            ai_generated = _get_ai_generated(video_result, audio_result)

            analysis_id = str(uuid.uuid4())
            result = {
                "id":           analysis_id,
                "filename":     file.filename,
                "file_type":    "video" if is_video(file.filename) else "audio",
                "trust_score":  score_data["trust_score"],
                "risk_level":   score_data["risk_level"],
                "explanation":  score_data["explanation"],
                "ai_generated": ai_generated,
                "signals": {
                    "video":    video_result,
                    "audio":    audio_result,
                    "metadata": metadata_result
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            save_analysis(result)
            result = _strip_response(result, analysis_id)

            print(f"[BATCH] Done: {file.filename} | Score: {result['trust_score']} | Risk: {result['risk_level']} | AI Generated: {ai_generated}")
            results.append(result)

        except Exception as e:
            print(f"[BATCH ERROR] {file.filename}: {str(e)}")
            results.append({"filename": file.filename, "error": str(e)})

        finally:
            if os.path.exists(filepath):
                os.remove(filepath)

    return jsonify({"total": len(results), "results": results}), 200


@analyze_bp.route('/stats', methods=['GET'])
def stats():
    print(f"[STATS] Request received")
    return jsonify(get_stats()), 200


@analyze_bp.route('/heatmap/<analysis_id>', methods=['GET'])
def heatmap(analysis_id):
    print(f"[HEATMAP] Requested ID: {analysis_id}")
    data = get_report(analysis_id)
    if not data:
        return jsonify({"error": "Not found"}), 404
    heatmap_b64 = data.get("signals", {}).get("video", {}).get("heatmap_b64")
    if not heatmap_b64:
        return jsonify({"error": "No heatmap available for this analysis"}), 404
    return jsonify({"heatmap_b64": heatmap_b64}), 200