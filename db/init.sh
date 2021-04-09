echo "****************"
echo "****************"
echo "Running db init!"
echo "****************"
echo "****************"
for f in docker-entrypoint-initdb.d/init/*.sql; do 
  echo "$0: running $f"
  psql -U $POSTGRES_USER $POSTGRES_DB -f $f
done
echo "****************"
echo "****************"
echo "Done with db creation!"
echo "****************"
echo "****************"
for f in docker-entrypoint-initdb.d/test_db_init/*.sql; do 
  echo "$0: running $f"
  psql -U $POSTGRES_USER $POSTGRES_DB -f $f
done
echo "****************"
echo "****************"
echo "Done with db init!"
echo "****************"
echo "****************"