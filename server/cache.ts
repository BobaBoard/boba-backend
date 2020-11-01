import debug from "debug";

import redis from "redis";
import { promisify } from "util";

const error = debug("bobaserver:pool-error");
const log = debug("bobaserver:pool-log");
const info = debug("bobaserver:pool-info");

let client: redis.RedisClient;

log(`Attempting cache connection...`);
if (process.env.NODE_ENV == "production") {
  log(`Connecting to remote cache host: ${process.env.POSTGRES_HOST}`);
} else {
  log(
    `Attempting connection to redis client on port ${process.env.REDIS_PORT}`
  );
  client = redis.createClient(process.env.REDIS_PORT);
}

client.on("connect", function () {
  log("You are now connected to the cache");
});
client.on("error", (err) => {
  log(err);
});
client.on("monitor", (time, args) => {
  log(`Received command: ${args}`);
});

export default {
  set: promisify(client.set).bind(client),
  get: promisify(client.get).bind(client),
  del: promisify(client.del).bind(client),
  hset: promisify(client.hset).bind(client),
  hget: promisify(client.hget).bind(client),
  hdel: promisify(client.hdel).bind(client),
};

export enum CacheKeys {
  // All boards data.
  BOARDS,
  // Data pertaining to a single board, keyed by the board slug.
  BOARD,
  // Data pertaining to the user, keyed by the user's firebase id.
  USER,
}
