import { createClient } from "redis";
import type { RedisClientType } from "redis";

import debug from "debug";

const error = debug("bobaserver:cache-error");
const log = debug("bobaserver:cache-log");
const info = debug("bobaserver:cache-info");

let client: {
  set: (key: CacheKeys, value: string) => Promise<string | null>;
  get: (key: CacheKeys) => Promise<string | null>;
  del: (key: CacheKeys) => Promise<number>;
  hSet: (key: CacheKeys, objectKey: string, value: string) => Promise<number>;
  hGet: (key: CacheKeys, objectKey: string) => Promise<string | undefined>;
  hDel: (key: CacheKeys, objectKey: string) => Promise<number>;
};

export const initCache = (createClientMethod?: any) => {
  if (client) {
    return;
  }
  // This is mostly used for testing so we can pass stubbed instances
  // TODO: figure out if any of this is still useful after the swith to JEST
  if (createClientMethod) {
    client = createClientMethod();
    return;
  }

  let innerClient: RedisClientType = createClient({
    socket: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
    },
  });
  innerClient.connect();
  log(`Attempting cache connection...`);
  log(
    `Attempting connection to redis client on host ${process.env.REDIS_HOST} and port ${process.env.REDIS_PORT}`
  );

  innerClient.on("connect", () => {
    log("You are now connected to the cache");
  });
  innerClient.on("error", (err) => {
    error("Redis connection failed");
  });

  client = innerClient;
};

export const cache = () => client;

export enum CacheKeys {
  // All boards data.
  BOARDS = "BOARDS",
  // Data pertaining to a single board. Keyed by board string id.
  BOARD = "BOARD",
  // Data pertaining to a single board's metadata. Keyed by the board slug.
  BOARD_METADATA = "BOARD_METADATA",
  // Data pertaining to a thread. Keyed by thread string id.
  THREAD = "THREAD",
  // Data pertaining to a subscription. Keyed by subscription string id.
  SUBSCRIPTION = "SUBSCRIPTION",
  // Data pertaining to the user, keyed by the user's firebase id.
  USER = "USER",
  // Data pertaining to user settings, keyed by the user's firebase id.
  USER_SETTINGS = "USER_SETTINGS",
  // Data pertaining to the user's pinned boards, keyed by the user's firebase id.
  USER_PINS = "USER_PINS",
}
