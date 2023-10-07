import debug from "debug";
import pgp from "pg-promise";

const error = debug("bobaserver:pool-error");
const log = debug("bobaserver:pool-log");
const info = debug("bobaserver:pool-info");

let databaseConfig: Record<string, unknown> = {};
log(`Attempting db connection...`);
if (process.env.NODE_ENV == "production") {
  log(`Connecting to remote database host: ${process.env.POSTGRES_HOST}`);
  databaseConfig = {
    ...databaseConfig,
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    connectionTimeoutMillis: 3000,
    query_timeout: 3000,
  };
  if (process.env.POSTGRES_SSL_ROOT_CERT) {
    databaseConfig.ssl = {
      // TODO: I have given up on getting the ssl config to work. I tried with "sslrootcert"
      // and I suspect it needs the more granular config.
      ca: process.env.POSTGRES_SSL_ROOT_CERT,
    };
  }
} else {
  log(`Attempting connection to local db on port ${process.env.POSTGRES_PORT}`);
  const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@127.0.0.1:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
  databaseConfig = {
    ...databaseConfig,
    connectionString: DATABASE_URL,
  };
}
const pgLib = pgp({
  connect: () => {
    log(`connected to the db on port ${process.env.POSTGRES_PORT}`);
  },
  error: (e) => {
    error(`error occurred on the db `, e);
  },
  query: (q) => {
    info("executing query: ", q.query);
  },
  disconnect: () => {
    log(`disconnected from the db`);
  },
  // This prevents the DB from hanging during tests
  noLocking: process.env.NODE_ENV === "test",
});
const pool = pgLib({ ...databaseConfig, max: 1, allowExitOnIdle: true });

export default pool;
