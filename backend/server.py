from click import File
from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import os
from dotenv import load_dotenv, dotenv_values
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from functools import wraps
import hashlib

app = Flask(__name__)
    
CORS(app)

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

def auth(f):
    
    @wraps(f)
    def decorated(*args, **kwargs):
        if not 'loggedin' in session:
            return "User not logged in"
        else:
           return f(*args, **kwargs)
    return decorated

@app.route("/", methods=["GET"])
@auth
def mainpage():
    

    return jsonify({'success': True}), 200

@app.route("/deleteme", methods=["GET"])
@auth
def deleteMe():

    print(session["username"])
    
    conn = connection()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM users WHERE username='{session["username"]}'")
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
    
    if (username == user[1] and password == user[3]):
    
        session['loggedin'] = "True"
        session['username'] = username
        session['userId'] = int(user[0])
        return jsonify({'success': True}), 200

    # Wrong un and/or pw
    return jsonify({'success': False}), 403

@app.route("/logout", methods=["GET"])
@auth
def logout():
    session.pop("loggedin", None)
    session.pop('username', None)
    
    return jsonify({'success': True}), 200

@app.route("/upload", methods=["POST"])
@auth
def upload_file():
    
    if request.method == 'POST':
        file = request.files['file']
    if file:
        with open("C:/users/marju/Pictures/Work of AI/Nallet/"+file.filename, "rb") as f:
            binary_data = bytearray(f.read())
        
        description = request.form["description"]
                
        conn = connection()
        cur = conn.cursor()
        #cur.execute(f'INSERT INTO images VALUES ({int(session["userId"])}, "{description}", """{binary_data}""" )')
        cur.execute("""INSERT INTO images (userId, description, file_data) VALUES (%s, %s, %s);""", (session["userId"], description, binary_data))
        conn.commit()
        conn.close()
    return jsonify({'success': True}), 201
    
if __name__ == '__main__':
    
    app.secret_key = 'Secret_test_key_for_MY_AND_YOUR_EYES_ONLY'
    app.config['SESSION_TYPE'] = 'filesystem'

    app.run(debug=False)