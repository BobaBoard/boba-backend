import debug from "debug";
import { Pool } from "pg";

const log = debug("bobaserver:pool");

const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@127.0.0.1:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const databaseConfig = { connectionString: DATABASE_URL };
log(`attempting connection to the db on port ${process.env.POSTGRES_PORT}`);
const pool = new Pool(databaseConfig);

pool.on("connect", () => {
  log(`connected to the db on port ${process.env.POSTGRES_PORT}`);
});

pool.on("error", (e) => {
  log(`error occurred on the db `, e);
});

export default pool;
