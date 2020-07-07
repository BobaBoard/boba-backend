import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";
import sql from "./sql";
import { DbThreadType, DbIdentityType } from "../types/Types";

const log = debug("bobaserver:threads:queries-log");
const error = debug("bobaserver:threads:queries-error");

export const getThreadByStringId = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId?: string;
}): Promise<DbThreadType | false> => {
  try {
    const thread = await pool.oneOrNone(sql.threadIdByString, {
      thread_string_id: threadId,
      firebase_id: firebaseId,
    });

    if (!thread) {
      log(`Thread not found: ${threadId}`);
      return null;
    }

    return thread;
  } catch (e) {
    error(`Error while fetching thread: ${threadId}.`);
    error(e);
    return false;
  }
};

export const getThreadIdentitiesByStringId = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId?: string;
}): Promise<DbIdentityType[] | false> => {
  try {
    const rows = await pool.many(sql.threadIdentitiesByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });

    log(`Found thread identities: `, rows);

    return rows;
  } catch (e) {
    error(`Error while fetching thread identities.`);
    error(e);
    return false;
  }
};

export const createThread = async ({
  firebaseId,
  content,
  isLarge,
  anonymityType,
  boardSlug,
  whisperTags,
}: {
  firebaseId: string;
  content: string;
  isLarge: boolean;
  anonymityType: string;
  boardSlug: string;
  whisperTags: string;
}) => {
  return pool
    .tx("create-thread", async (t) => {
      const threadStringId = uuidv4();
      const createThreadResult = await t.one(sql.createThread, {
        thread_string_id: threadStringId,
        board_slug: boardSlug,
      });
      log(`Created thread entry for thread ${threadStringId}`);

      const postStringId = uuidv4();
      await t.one(sql.createPost, {
        post_string_id: postStringId,
        parent_thread: createThreadResult.id,
        firebase_id: firebaseId,
        options: {
          wide: isLarge,
        },
        content,
        anonymity_type: anonymityType,
        whisper_tags: whisperTags,
      });
      log(`Created post entry for thread ${postStringId}`);

      const identityRes = await t.one(sql.getRandomIdentityId);
      log(`Got new identity for thread ${threadStringId}:`);
      log(identityRes);

      await t.none(sql.insertNewIdentity, {
        thread_id: createThreadResult.id,
        firebase_id: firebaseId,
        secret_identity_id: identityRes.id,
      });
      log(`Added identity for ${threadStringId}.`);
      return threadStringId;
    })
    .catch((e) => {
      error(`Error while creating thread on board ${boardSlug}: `, e);
      return false;
    });
};

export const markThreadVisit = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.visitThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while recording thread visit.`);
    error(e);
    return false;
  }
};
