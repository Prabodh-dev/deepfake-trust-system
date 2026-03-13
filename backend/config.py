import os

MODEL_PATH          = os.getenv('MODEL_PATH', 'backend/models/xception.pt')
UPLOAD_FOLDER       = 'backend/uploads'
MAX_FILE_SIZE       = 200 * 1024 * 1024
VIDEO_THRESHOLD     = 0.5
AUDIO_THRESHOLD     = 0.5
DATABASE_PATH       = 'backend/db/history.db'
VIDEO_WEIGHT        = 0.55
AUDIO_WEIGHT        = 0.25
METADATA_WEIGHT     = 0.20
ALLOWED_EXTENSIONS  = {'mp4', 'mov', 'avi', 'mp3', 'wav'}
