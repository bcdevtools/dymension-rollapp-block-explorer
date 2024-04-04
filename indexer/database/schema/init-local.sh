#!/bin/bash

set -eu

DB_HOST="localhost"
DB_PORT=25432
DB_NAME="drbe"
DB_USER_ADMIN="postgres"
DB_PASS_ADMIN="1234567"
DB_USER_LOCAL="drbe"
DB_PASS_LOCAL="1234567"

CONTAINER_NAME="dev-$DB_NAME"

docker rm -f "$CONTAINER_NAME"
docker run -d --restart unless-stopped \
        --name "$CONTAINER_NAME" \
        -p "$DB_PORT:5432" \
        -e "POSTGRES_PASSWORD=$DB_PASS_ADMIN" \
        postgres:15.2

sleep 5

PGPASSWORD="$DB_PASS_ADMIN" psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -U "$DB_USER_ADMIN" -c "CREATE DATABASE $DB_NAME;"
PGPASSWORD="$DB_PASS_ADMIN" psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -U "$DB_USER_ADMIN" -c "CREATE ROLE $DB_USER_LOCAL WITH ENCRYPTED PASSWORD '$DB_PASS_LOCAL';"
PGPASSWORD="$DB_PASS_ADMIN" psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -U "$DB_USER_ADMIN" -c "ALTER ROLE $DB_USER_LOCAL WITH LOGIN;"
PGPASSWORD="$DB_PASS_ADMIN" psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -U "$DB_USER_ADMIN" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER_LOCAL;"
PGPASSWORD="$DB_PASS_ADMIN" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER_ADMIN" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DB_USER_LOCAL;"
PGPASSWORD="$DB_PASS_LOCAL" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER_LOCAL" -f "schema.sql"

echo 'Initialized schema'
