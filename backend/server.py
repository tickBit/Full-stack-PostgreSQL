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

CORS(app,
     supports_credentials=True)
#CORS(
#    app,
#    supports_credentials=True,
#    resources={r"/*": {"origins": "http://localhost:3000"}},
#    allow_headers=["Content-Type", "Authorization"]
#)

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

DATABASE_URL = os.getenv("DATABASE_URL")

def connection():
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Database connection established")
        return conn
    except psycopg2.Error as err:
        print(err)
        exit(1)
        

#conn = connection()
#cur = conn.cursor()

#cur.execute(create_table_images)
#conn.commit()
#conn.close()

# Magic code, that checks, if the user is logged in
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

@app.route("/deletePic/<int:pic_id>", methods=["DELETE"])
@token_required
def delete_pic(user_id, pic_id):
    conn = connection()
    cur = conn.cursor()

    # Varmistetaan että kuva kuuluu kyseiselle käyttäjälle
    cur.execute(
        "DELETE FROM images WHERE id = %s AND userId = %s RETURNING id",
        (pic_id, user_id)
    )
    deleted = cur.fetchone()
    conn.commit()
    conn.close()

    if deleted:
        return jsonify({"success": True, "message": "Picture deleted", "id": deleted[0]})
    else:
        return jsonify({"success": False, "message": "Picture not found or not yours"}), 404

    
@app.route("/deleteme", methods=["DELETE"])
@token_required
def deleteMe(user_id):
    
    conn = connection()
    cur = conn.cursor()
    
    cur.execute(f"SELECT * FROM images WHERE userid='{user_id}'")

    try:
        imgs = tuple(cur.fetchone())
    except:
        cur.execute(f"DELETE FROM users WHERE username='{user_id}'")
        conn.commit()
        conn.close()
        return jsonify({'success': True}), 204
    
    else:
        return jsonify({'success': False, 'message': 'There are pics by this user'}), 401

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
    
    cur.execute(f"SELECT '{username}' FROM users")
    
    try:
        user_id = tuple(cur.fetchone())
    except:
        
        cur.execute(f"INSERT INTO users (username, email, password) VALUES ('{username}', '{email}', '{password}')")
        conn.commit()
    
        cur.execute(f"SELECT '{username}' FROM users")
        user_id = tuple(cur.fetchone())[0]
        conn.close()
    
        token = jwt.encode({"userid": user_id}, app.secret_key, algorithm="HS256")
        return jsonify({'success': True, 'token': token}), 201

    return jsonify({'success': False}), 400

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
    
    try:
        user = tuple(cur.fetchone())
    except:
        conn.close()
        return make_response('Could not Verify', 401, {'WWW-Authenticate': 'Basic realm ="Login Required"'})
        
    conn.close()
        
    token = jwt.encode({"userid": user[0]}, app.secret_key, algorithm="HS256")
    return jsonify({'success': True, 'token': token})

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
           VALUES (%s, %s, %s) RETURNING id""",
        (user_id, description, psycopg2.Binary(binary_data))
    )
    conn.commit()
    
    # get the ID of just created record
    id = cur.fetchone()[0]
    
    conn.close()
    
    return jsonify({'success': True, 'id': id, 'description': description, 'file_data': base64.b64encode(binary_data).decode("utf-8")}), 201


@app.route("/getUserPics", methods=["GET"])
@token_required
def get_user_pics(user_id):
    
    conn = connection()
    cur = conn.cursor()
    
    try:
        cur.execute(f"""SELECT * FROM images WHERE userId='{user_id}'""")
        data = cur.fetchall()
    except:
        conn.close()
        return jsonify({'success': False, 'message': 'Error with the database'}), 405
    
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

        
    return jsonify(images)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)