from flask import Flask, request, jsonify
import sqlite3
import os
import json
from collections import defaultdict
import threading
import time
import random

lock = threading.Lock()
app = Flask(__name__)

# Connect to the Anki SQLite database
cd = os.getcwd()

# Get the absolute path of the current script
script_path = os.path.abspath(__file__)

# Get the directory where the script is located
script_dir = os.path.dirname(script_path)
path = os.path.join(script_dir, "db\\save.sqlite")
jsonPath = os.path.join(script_dir, "db\\data.json")
print(path)
conn = sqlite3.connect(path, check_same_thread=False)
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
)""")
c.execute("""
CREATE TABLE IF NOT EXISTS bin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    words TEXT,
    keep TEXT,
    alllearned TEXT,
    deleted TEXT,
    learning TEXT
);
""")
# c.execute("INSERT INTO bin (words, keep, alllearned, deleted, learning) VALUES (?, ?, ?, ?, ?)", ('', '', '', '', ''))
# conn.commit()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [table[0] for table in c.fetchall()]

# Create a defaultdict to store the data
data = defaultdict(list)

for table_name in tables:
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
            row_values = [f"{col_name}: {value}" for col_name, value in zip(columns, row)]
            print(", ".join(row_values))
    except sqlite3.OperationalError as e:
        print(f"Error accessing table '{table_name}': {e}")
    print()

    # Fetch all rows from the table and create a list of dictionaries
    c.execute(f"SELECT * FROM {table_name};")
    rows = c.fetchall()
    table_data = [
        {col_name: value for col_name, value in zip(columns, row)}
        for row in rows
    ]
    data[table_name] = table_data
print()
t = c.execute(f"SELECT * FROM words ORDER BY id ASC LIMIT 4;")
for i in t.fetchall():
    print(" --- ", i)
# Save the data to a JSON file
with open(jsonPath, 'w', encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)
# Create
import threading

lock = threading.Lock()

@app.route('/bin', methods=['POST'])
def insert_data():
    data = request.get_json()
    words = data.get('words', '')
    keep = data.get('keep', '')
    alllearned = data.get('alllearned', '')
    deleted = data.get('deleted', '')
    learning = data.get('learning', '')

    with lock:
        try:
            c.execute("BEGIN TRANSACTION")
            c.execute("INSERT INTO bin (words, keep, alllearned, deleted, learning) VALUES (?, ?, ?, ?, ?)", (words, keep, alllearned, deleted, learning))
            c.execute("COMMIT")
        except:
            c.execute("ROLLBACK")
            raise

    return jsonify({'message': 'Data inserted successfully'}), 200

@app.route('/bin/<int:id>', methods=['PUT'])
def update_data(id):
    data = request.get_json()
    updated_fields = []
    update_values = []

    with lock:
        try:
            c.execute("BEGIN TRANSACTION")

            if 'words' in data:
                updated_fields.append("words = ?")
                update_values.append(data['words'])
            if 'keep' in data:
                updated_fields.append("keep = ?")
                update_values.append(data['keep'])
            if 'alllearned' in data:
                updated_fields.append("alllearned = ?")
                update_values.append(data['alllearned'])
            if 'deleted' in data:
                updated_fields.append("deleted = ?")
                update_values.append(data['deleted'])
            if 'learning' in data:
                updated_fields.append("learning = ?")
                update_values.append(data['learning'])

            if updated_fields:
                update_query = "UPDATE bin SET " + ", ".join(updated_fields) + " WHERE id = ?"
                update_values.append(id)
                c.execute(update_query, update_values)

            c.execute("COMMIT")
        except:
            c.execute("ROLLBACK")
            raise

    return jsonify({'message': 'Data updated successfully'}), 200


@app.route('/yomu', methods=['POST'])
def create_yomu():
    data = request.get_json()
    time.sleep(random.randint(8, 25))
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

# Update, Read, and Delete routes for /yomu remain the same as before

if __name__ == '__main__':
    app.run(debug=True, port=5300)