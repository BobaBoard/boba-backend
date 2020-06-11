import debug from "debug";
import { Pool } from "pg";

const log = debug("bobaserver:pool");

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
const pool = new Pool(databaseConfig);

pool.on("connect", () => {
  log(`connected to the db on port ${process.env.POSTGRES_PORT}`);
});

pool.on("error", (e) => {
  log(`error occurred on the db `, e);
});

export default pool;
