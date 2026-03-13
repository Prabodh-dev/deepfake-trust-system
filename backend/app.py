from flask import Flask, jsonify
from flask_cors import CORS
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import backend.config as config
from backend.routes.analyze import analyze_bp
from backend.db.database import init_db

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = config.MAX_FILE_SIZE

app.register_blueprint(analyze_bp, url_prefix='/api')
os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)

@app.route('/ping')
def ping():
    return jsonify({"status": "ok", "version": "1.0"})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)