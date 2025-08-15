import psycopg2
from psycopg2 import OperationalError
import os
import time
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Odotetaan DB:n valmistumista
while True:
    try:
        conn = psycopg2.connect(DATABASE_URL)
        break
    except OperationalError:
        print("DB not ready, retrying...")
        time.sleep(1)
        
cur = conn.cursor()


cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    file_data BYTEA NOT NULL,
    userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE)
""")
conn.commit()

cur.close()
conn.close()

print("Databases initialized!")