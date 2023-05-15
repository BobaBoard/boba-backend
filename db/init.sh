set -e
echo "****************"
echo "****************"
echo "Running db init!"
echo "****************"
echo "****************"
for f in ./db/init/*.sql; do 
  echo "$0: running $f"
  echo $f
  echo $POSTGRES_USER $POSTGRES_DB
  psql -U $POSTGRES_USER $POSTGRES_DB -f $f -v ON_ERROR_STOP=1
  echo $?
done
echo "****************"
echo "****************"
echo "Done with db creation!"
echo "****************"
echo "****************"
for f in ./db/test_db_init/*.sql; do 
  echo "$0: running $f"
  psql -U $POSTGRES_USER $POSTGRES_DB -f $f -v ON_ERROR_STOP=1
  echo $?
done
echo "****************"
echo "****************"
echo "Done with db init!"
echo "****************"
echo "****************"