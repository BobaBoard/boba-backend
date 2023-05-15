#!/bin/bash

# Parameters
host=localhost
port=35432
user=postgres
database=yourdatabase
retries=10

# Parse command-line flags
# while getopts 'h:p:u:d:r:' flag; do
#   case "${flag}" in
#     h) host=${OPTARG} ;;
#     p) port=${OPTARG} ;;
#     u) user=${OPTARG} ;;
#     d) database=${OPTARG} ;;
#     r) retries=${OPTARG} ;;
#     *) echo "Unexpected option ${flag}"
#        exit 1 ;;
#   esac
# done

# Wait for PostgreSQL
until pg_isready -p "$port" -U "$user" -t 1 >/dev/null 2>&1 || [ $retries -eq 0 ]; do
  echo "Waiting for PostgreSQL to start, $((retries--)) remaining attempts..."
  sleep 2
done

# Check if PostgreSQL is ready
if pg_isready -p "$port" -U "$user" >/dev/null 2>&1; then
  echo "PostgreSQL is ready, running the script..."
  # Run your script here
  psql -U postgres -c "DROP ROLE IF EXISTS $POSTGRES_USER; CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';";
  DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'")

  if [ "$DB_EXISTS" = "1" ]
  then
      echo "Database $POSTGRES_DB already exists"
  else
      psql -U postgres -c "CREATE DATABASE $POSTGRES_DB"
  fi

else
  echo "PostgreSQL is not ready after waiting, exiting..."
  exit 1
fi
