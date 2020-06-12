import debug from "debug";
import pgp from "pg-promise";

const error = debug("bobaserver:pool-error");
const log = debug("bobaserver:pool-log");
const info = debug("bobaserver:pool-info");

let databaseConfig;
log(`Attempting db connection...`);
if (process.env.NODE_ENV == "production") {
  log(`Connecting to remote database host: ${process.env.POSTGRES_HOST}`);
  databaseConfig = {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  };
} else {
  log(`Attempting connection to local db on port ${process.env.POSTGRES_PORT}`);
  const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@127.0.0.1:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
  databaseConfig = { connectionString: DATABASE_URL };
}
const pgLib = pgp({
  connect: () => {
    log(`connected to the db on port ${process.env.POSTGRES_PORT}`);
  },
  error: (e) => {
    error(`error occurred on the db `, e);
  },
  query: (q) => {
    info("executing query: ", q);
  },
});
const pool = pgLib(databaseConfig);

export default pool;
