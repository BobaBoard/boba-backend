import debug from "debug";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { Pool } from "pg";

dotenvExpand(dotenv.config());

const log = debug("bobaserver:pool");

const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@127.0.0.1:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const databaseConfig = { connectionString: DATABASE_URL };
const pool = new Pool(databaseConfig);

pool.on("connect", () => {
  log("connected to the db");
});

export default pool;
