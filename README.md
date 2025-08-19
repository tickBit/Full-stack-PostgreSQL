# React & Python + Postgres + Docker

A little full-stack image gallery project.

## How to run?

### Frontend

Go to frontend drawer and do `npm install`.

Start the frontend: `npm start`.

### Backend

1. Create `.env` to backend drawer:

Put there:
* POSTGRES_USER=postgres
* POSTGRES_PASSWORD=secret
* POSTGRES_DB=mydb
* DATABASE_URL=postgresql://postgres:secret@db:5432/mydb

where

- `postgres` is _your_ username for PostgreSQL database
- `secret` _your_ password for the database
- `mydb` _your_ database name

2. Start the containers

docker-compose up --build

3. Backend serves at address http://localhost:5000

Please notice, that you need Docker to run this.

### Picture of the app running

![PostgreSQL-database](https://github.com/user-attachments/assets/6ed4c8f1-dfe0-4ddb-910e-09cce7bd74f5)


