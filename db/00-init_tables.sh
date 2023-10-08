set -e

DB_INIT_DIR=${1:-docker-entrypoint-initdb.d}

echo "****************"
echo "****************"
echo "Running db init!"
echo "Using base directory: $DB_INIT_DIR"
echo "****************"
echo "****************"

POSTGRES_FLAGS="-U $POSTGRES_USER -d $POSTGRES_DB"

# Docker is being mean to me and not allowing to use localhost as host
# to connect to the db. I don't want to figure out how to appease it
# so I'm just not going to pass the host, which works.
if [ $POSTGRES_HOST ]; then
  POSTGRES_FLAGS="$POSTGRES_FLAGS -h $POSTGRES_HOST -p $POSTGRES_PORT --set=sslmode=require"
fi

for f in $DB_INIT_DIR/init/*.sql; do 
  echo "$0: running $f"
    psql $POSTGRES_FLAGS -f $f -v ON_ERROR_STOP=1

  echo $?
done

echo "****************"
echo "****************"
echo "Done with db creation!"
echo "****************"
echo "****************"