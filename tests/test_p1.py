import sys, os
sys.path.insert(0, os.path.abspath('.'))

from backend.utils.video_detector import detect_video

result = detect_video("tests/sample_files/test.mp4")
print(result)