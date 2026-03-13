import backend.config as config

def calculate_trust_score(video_result: dict,
                           audio_result: dict,
                           metadata_result: dict) -> dict:

    v = video_result.get('score', 0.5)
    a = audio_result.get('score', 0.5)
    m = metadata_result.get('score', 0.5)

    raw_fake = (
        config.VIDEO_WEIGHT    * v +
        config.AUDIO_WEIGHT    * a +
        config.METADATA_WEIGHT * m
    )

    trust_score = round(100 - (raw_fake * 100))
    trust_score = max(0, min(100, trust_score))

    if trust_score >= 70:
        risk_level = "Low"
    elif trust_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "High"

    signals_text = []
    if v > 0.6:
        signals_text.append("facial inconsistencies across multiple frames")
    if a > 0.6:
        signals_text.append("audio spectral anomalies indicating synthesis")
    if m > 0.6:
        signals_text.append("metadata irregularities suggesting re-encoding")

    if signals_text:
        explanation = (f"Trust score {trust_score}/100. "
                       f"Detected: {', '.join(signals_text)}.")
    else:
        explanation = (f"Trust score {trust_score}/100. "
                       f"No major manipulation signals. Content appears authentic.")

    return {
        "trust_score": trust_score,
        "risk_level":  risk_level,
        "explanation": explanation
    }