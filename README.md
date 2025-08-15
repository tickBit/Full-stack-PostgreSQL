# React & Python + Postgres + Docker

A little full-stack image gallery project.

## How to run?

1. Create `.env` to backend drawer:

Put there:
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
POSTGRES_DB=mydb
DATABASE_URL=postgresql://postgres:secret@db:5432/mydb

where

- `postgres` is the _your_ username for PostgreSQL database
- `secret` _your_ password for the database
- `mydb` _your_ database name

2. Start the containers

docker-compose up --build

3. Backend servers at address http://localhost:5000

Please notice, that you need Docker to run this.
