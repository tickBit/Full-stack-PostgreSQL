from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from envs import env
import psycopg2
import argparse

app = Flask(__name__)
CORS(app)

hostName = "localhost"

db_conn_str = "dbname={DB_NAME} user={DB_USER}"

conn = psycopg2.connect(db_conn_str)
curs = conn.cursor()

@app.route("/register", methods=["POST"])
def registerUser():
    data = request.get_json()
    
    print(env('DB_PASSWORD'))
    
    try:
        username = data["username"]
        password = data["password"]
    except:
        return jsonify({'success': False}), 401
    
    return f"{username} {password}"

@app.route("/login", methods=["POST"])
def loginUser():
    data = request.get_json()
    
    try:
        username = data["username"]
        password = data["password"]
    except:
        return jsonify({f"success": False}), 401
    
    return f"{username} {password}"

if __name__ == '__main__':
    app.run(debug=True)