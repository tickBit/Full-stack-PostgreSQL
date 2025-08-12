from flask import Flask, request, jsonify
from flask_cors import CORS

from http.server import BaseHTTPRequestHandler, HTTPServer

app = Flask(__name__)
CORS(app)

hostName = "localhost"

@app.route("/register", methods=["POST"])
def registerUser():
    data = request.get_json()
    
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