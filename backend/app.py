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

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"error": "File too large. Max size is 200MB"}), 413

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)