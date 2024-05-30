from flask import Flask, request, jsonify
import sqlite3
import os
import json

app = Flask(__name__)

# Connect to the Anki SQLite database
conn = sqlite3.connect("save.sqlite", check_same_thread=False)
c = conn.cursor()

# Create the 'words' table if it doesn't exist
c.execute("""
CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT,
    reading TEXT,
    sentence TEXT,
    definition TEXT,
    frequency TEXT,
    clipboard TEXT,
    type TEXT,
    learning INTEGER,
    status TEXT,
    time TEXT,
    params TEXT
);
CREATE TABLE IF NOT EXISTS bin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    words TEXT,
    keep TEXT,
    alllearned TEXT,
    deleted TEXT,
    learning TEXT
);
""")

c.execute("SELECT name FROM sqlite_master WHERE type='table';")
for table in c.fetchall():
    table_name = table[0]
    print(f"Table: {table_name}")

    # Get the column information for the current table
    c.execute(f"PRAGMA table_info({table_name});")
    columns = [column[1] for column in c.fetchall()]
    print(", ".join(columns))

    # Print all the rows for the current table
    try:
        c.execute(f"SELECT * FROM {table_name} LIMIT 50;")
        rows = c.fetchall()
        for row in rows:
            row_values = []
            for i, value in enumerate(row):
                column_name = columns[i]
                row_values.append(f"{column_name}: {value}")
            print(", ".join(row_values))
    except sqlite3.OperationalError as e:
        print(e)
    print()

# Create
@app.route('/yomu', methods=['POST'])
def create_yomu():
    data = request.get_json()
    if 'id' in data:
        id = data['id']
    else:
        c.execute("SELECT MAX(id) FROM words")
        max_id = c.fetchone()[0]
        if max_id is None:
            id = 1
        else:
            id = max_id + 1

    c.execute("INSERT INTO words (id, word, reading, sentence, definition, frequency, clipboard, learning, status, time, params, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              (id, data['word'], data['reading'], data['sentence'], data['definition'], data['frequency'], data['clipboard'], data['learning'], data['status'], data['time'], data['params'], data['type']))
    conn.commit()
    return jsonify({'id': id})

# Read
@app.route('/yomu/<int:id>', methods=['GET'])
def read_yomu(id):
    c.execute("SELECT * FROM words WHERE id = ?", (id,))
    yomu = c.fetchone()
    if yomu is None:
        return jsonify({'error': 'Yomu entry not found'}), 404
    return jsonify({
        'id': yomu[0],
        'word': yomu[1],
        'reading': yomu[2],
        'sentence': yomu[3],
        'definition': yomu[4],
        'frequency': yomu[5],
        'clipboard': yomu[6],
        'tyoe': yomu[7],
        'learning': yomu[8],
        'status': yomu[9],
        'time': yomu[10],
        'params': yomu[11]
    })

# Update
@app.route('/yomu/<int:id>', methods=['PUT'])
def update_yomu(id):
    data = request.get_json()
    c.execute("UPDATE words SET word = ?, reading = ?, sentence = ?, definition = ?, frequency = ?, clipboard = ?, type = ?, learning = ?, status = ?, time = ?, params = ? WHERE id = ?",
              (data['word'], data['reading'], data['sentence'], data['definition'], data['frequency'], data['clipboard'], data['type'], data['learning'], data['status'], data['time'], data['params'], id))
    conn.commit()
    return jsonify({'id': id})

# Delete
@app.route('/yomu/<int:id>', methods=['DELETE'])
def delete_yomu(id):
    c.execute("DELETE FROM words WHERE id = ?", (id,))
    conn.commit()
    return jsonify({'message': 'Yomu entry deleted'})

if __name__ == '__main__':
    app.run(debug=True, port=5300)