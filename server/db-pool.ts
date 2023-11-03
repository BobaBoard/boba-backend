import debug from "debug";
import fs from "fs";
import monitor from "pg-monitor";
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
    // connectionTimeoutMillis: 3000,
    // query_timeout: 3000,
  };
  if (process.env.POSTGRES_SSL_ROOT_CERT_PATH) {
    databaseConfig.ssl = {
      ca: fs.readFileSync(process.env.POSTGRES_SSL_ROOT_CERT_PATH).toString(),
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

function forward(event: monitor.LogEvent, args: IArguments) {
  // safe event forwarding into pg-monitor:

  (monitor as any)[event].apply(monitor, [...args]);
}

const pgpOptions: pgp.IInitOptions = {
  connect(e) {
    // @ts-ignore
    forward("connect", [{ client: e }]);
  },
  error(e) {
    error(`error occurred on the db `, e);
  },
  disconnect(e) {
    log(`disconnected from the db`);

    // @ts-ignore
    forward("disconnect", [{ client: e }]);
  },

  query(q) {
    forward("query", arguments);
  },
  // This prevents the DB from hanging during tests
  noLocking: process.env.NODE_ENV === "test",
};

monitor.setLog((msg, queryInfo) => {
  queryInfo.display = false;
  log(msg);
});

const pgLib = pgp(pgpOptions);

const pool = pgLib({
  ...databaseConfig,
  max: process.env.NODE_ENV === "test" ? 1 : 30,
  allowExitOnIdle: true,
});

export default pool;
