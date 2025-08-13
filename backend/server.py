import base64
import datetime
import jwt
from flask import Flask, request, jsonify, session, make_response, Response
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from functools import wraps
import hashlib


app = Flask(__name__)
# Salli Reactin pyyntö
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    allow_headers=["Content-Type", "Authorization"]
)

app.secret_key = 'Secret_test_key_for_MY_AND_YOUR_EYES_ONLY'
app.config['SESSION_TYPE'] = 'filesystem'

hostName = "localhost"

create_table_images = """
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    file_data BYTEA NOT NULL,
    userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
)
"""

create_table_users = """
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
)
"""

load_dotenv()

def connection():
    config = {
          'dbname': os.getenv('DB_NAME'),
          'user': os.getenv('DB_USER'),
          'password': os.getenv('DB_PASSWORD'),
              'host': '127.0.0.1',
              'port': '5432'
            }
        
    try:
        conn = psycopg2.connect(**config)
    except psycopg2.Error as err:
        print(err)
        exit(1)
    else:
        print("Database connection established")
        return conn

#conn = connection()
#cur = conn.cursor()

#cur.execute(create_table_images)
#conn.commit()
#conn.close()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return f(*args, **kwargs)

        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'error': 'token is missing'}), 403

        try:
            payload = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            user_id = payload.get("userid")
            if not user_id:
                return jsonify({'error': 'token missing userid'}), 403
        except Exception as error:
            print("JWT ERROR:", error)
            return jsonify({'error': 'token is invalid/expired'}), 403

        return f(user_id, *args, **kwargs)  # välitetään user_id seuraavaan funktioon
    return decorated


    
@app.route("/deleteme", methods=["GET"])
@token_required
def deleteMe(user_id):
    
    conn = connection()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM users WHERE (username={user_id})")
    conn.commit()
    conn.close()
    
    return jsonify({'success': True}), 204

@app.route("/register", methods=["POST"])
def registerUser():
    data = request.get_json()
    
    m = hashlib.sha512()
    secret_key = u'TOP_SECRET_KEY_FOR_MY_YOUR_AND_EVERYONES_EYES_ONLY'
    
    try:
        username = data["username"]
        email = data["email"]
        password = hashlib.sha512((secret_key + data["password"]).encode("UTF-8")).hexdigest()
    except:
        return jsonify({'success': False}), 401
    
    conn = connection()
    cur = conn.cursor()
    cur.execute(f"INSERT INTO users (username, email, password) VALUES ('{username}', '{email}', '{password}')")
    conn.commit()
    conn.close()
    
    return f"{username} {email} {password}"

@app.route("/login", methods=["POST"])
def loginUser():
    data = request.get_json()
    
    m = hashlib.sha512()
    secret_key = u'TOP_SECRET_KEY_FOR_MY_YOUR_AND_EVERYONES_EYES_ONLY'
    
    try:
        username = data["username"]
        password = hashlib.sha512((secret_key + data["password"]).encode("UTF-8")).hexdigest()
    except:
        return jsonify({f"success": False}), 401

    conn = connection()
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM users WHERE username='{username}' AND password='{password}'")
    user = tuple(cur.fetchone())
    conn.close()
    
    #if (username == user[1] and password == user[3]):
    # 
    session['loggedin'] = "True"
    session['username'] = username
        
    token = jwt.encode({"userid": user[0]}, app.secret_key, algorithm="HS256")
    return jsonify({'success': True, 'token': token})
    
    #return make_response('Could not Verify', 401, {'WWW-Authenticate': 'Basic realm ="Login Required"'})

@app.route("/upload", methods=["POST"])
@token_required
def upload_file(user_id):
    file = request.files.get("file")
    description = request.form.get("description")

    if not file or not description:
        return jsonify({"error": "Missing file or description"}), 400

    binary_data = file.read()

    conn = connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO images (userId, description, file_data)
           VALUES (%s, %s, %s)""",
        (user_id, description, psycopg2.Binary(binary_data))
    )
    conn.commit()
    conn.close()

    return jsonify({'success': True}), 201


@app.route("/getUserPics", methods=["GET"])
@token_required
def get_user_pics(user_id):
    
    conn = connection()
    cur = conn.cursor()
    
    try:
        cur.execute(f"""SELECT * FROM images WHERE userId={user_id}""")
        data = tuple(cur.fetchall())
    except:
        pass
    conn.close()

    images = []
    for row in data:
        img_id = row[0]
        description = row[1]
        file_data = base64.b64encode(row[2]).decode("utf-8")  # memoryview → bytes → base64-string

        images.append({
            "id": img_id,
            "description": description,
            "file_data": file_data
        })

    if len(images) > 0:
        return jsonify(images)
    else:
        return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=False)