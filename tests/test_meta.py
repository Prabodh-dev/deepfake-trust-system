import sys, os
sys.path.insert(0, os.path.abspath('.'))

from backend.utils.metadata_extractor import extract_metadata

result = extract_metadata("tests/sample_files/test.mp4")
print("METADATA RESULT:", result)