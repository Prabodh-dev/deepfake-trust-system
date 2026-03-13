import sqlite3
import json
import backend.config as config

def init_db():
    conn = sqlite3.connect(config.DATABASE_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            filename TEXT,
            trust_score INTEGER,
            risk_level TEXT,
            timestamp TEXT,
            full_json TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_analysis(data: dict):
    conn = sqlite3.connect(config.DATABASE_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO analyses
        (id, filename, trust_score, risk_level, timestamp, full_json)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['id'], data['filename'], data['trust_score'],
        data['risk_level'], data['timestamp'], json.dumps(data)
    ))
    conn.commit()
    conn.close()

def get_history(limit=10):
    conn = sqlite3.connect(config.DATABASE_PATH)
    c = conn.cursor()
    c.execute('''
        SELECT id, filename, trust_score, risk_level, timestamp
        FROM analyses
        ORDER BY timestamp DESC LIMIT ?
    ''', (limit,))
    rows = c.fetchall()
    conn.close()
    return [
        {"id":r[0], "filename":r[1], "trust_score":r[2],
         "risk_level":r[3], "timestamp":r[4]}
        for r in rows
    ]

def get_report(analysis_id: str):
    conn = sqlite3.connect(config.DATABASE_PATH)
    c = conn.cursor()
    c.execute('SELECT full_json FROM analyses WHERE id = ?', (analysis_id,))
    row = c.fetchone()
    conn.close()
    return json.loads(row[0]) if row else None

def clear_history():
    conn = sqlite3.connect(config.DATABASE_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM analyses')
    conn.commit()
    conn.close()

def get_stats():
    conn = sqlite3.connect(config.DATABASE_PATH)
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM analyses')
    total = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM analyses WHERE risk_level = "High"')
    high_risk = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM analyses WHERE risk_level = "Medium"')
    medium_risk = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM analyses WHERE risk_level = "Low"')
    low_risk = c.fetchone()[0]
    c.execute('SELECT AVG(trust_score) FROM analyses')
    avg_score = c.fetchone()[0]
    conn.close()
    return {
        "total_analyses": total,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "average_trust_score": round(avg_score, 1) if avg_score else 0
    }

