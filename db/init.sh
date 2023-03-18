set -e
echo "****************"
echo "****************"
echo "Running db init!"
echo "****************"
echo "****************"
echo $POSTGRES_USER
echo $POSTGRES_DB
for f in docker-entrypoint-initdb.d/init/*.sql; do
  echo "$0: running $f"
  psql -U $POSTGRES_USER $POSTGRES_DB -f $f -v ON_ERROR_STOP=1
  echo $?
done
echo "****************"
echo "****************"
echo "Done with db creation!"
echo "****************"
echo "****************"
for f in docker-entrypoint-initdb.d/test_db_init/*.sql; do
  echo "$0: running $f"
  psql -U $POSTGRES_USER $POSTGRES_DB -f $f -v ON_ERROR_STOP=1
  echo $?
done
echo "****************"
echo "****************"
echo "Done with db init!"
echo "****************"
echo "****************"
