set -e

DB_INIT_DIR=${1:-docker-entrypoint-initdb.d}

echo "****************"
echo "****************"
echo "Running db init!"
echo "Using base directory: $DB_INIT_DIR"
echo "****************"
echo "****************"

for f in $DB_INIT_DIR/init/*.sql; do 
  echo "$0: running $f"
  PGPASSWORD=$POSTGRES_PASSWORD psql -U $POSTGRES_USER -h $POSTGRES_HOST -p $POSTGRES_PORT -d $POSTGRES_DB --set=sslmode=require -f $f -v ON_ERROR_STOP=1
  echo $?
done

echo "****************"
echo "****************"
echo "Done with db creation!"
echo "****************"
echo "****************"

for f in $DB_INIT_DIR/test_db_init/*.sql; do 
  echo "$0: running $f"
  PGPASSWORD=$POSTGRES_PASSWORD psql -U $POSTGRES_USER -h $POSTGRES_HOST -p $POSTGRES_PORT -d $POSTGRES_DB --set=sslmode=require -f $f -v ON_ERROR_STOP=1
  echo $?
done

echo "****************"
echo "****************"
echo "Done with db init!"
echo "****************"
echo "****************"
