import sys, os
sys.path.insert(0, os.path.abspath('.'))

from backend.utils.audio_detector import analyze_audio
from backend.utils.metadata_extractor import extract_metadata

audio_result = analyze_audio("tests/sample_files/test.mp4")
print("AUDIO RESULT:", audio_result)

meta_result = extract_metadata("tests/sample_files/test.mp4")
print("METADATA RESULT:", meta_result)