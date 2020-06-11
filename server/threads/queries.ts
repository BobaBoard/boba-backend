import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";
import sql from "./sql";

const log = debug("bobaserver:threads:queries-log");
const error = debug("bobaserver:threads:queries-error");

export const getThreadByStringId = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId?: string;
}): Promise<any> => {
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
}): Promise<any> => {
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
  anonymityType,
  boardSlug,
}: {
  firebaseId: string;
  content: string;
  anonymityType: string;
  boardSlug: string;
}) => {
  return pool
    .tx("create-thread", async (t) => {
      const threadStringId = uuidv4();
      const createThreadResult = await t.one(
        `
        INSERT INTO threads(string_id, parent_board)
        VALUES (
          $/thread_string_id/,
          (SELECT id FROM boards WHERE slug = $/board_slug/)
        RETURNING id`,
        {
          thread_string_id: threadStringId,
          board_slug: boardSlug,
        }
      );

      await t.one(
        `
        INSERT INTO posts(string_id, parent_post, parent_thread, 
                          author, content, type, 
                          whisper_tags, anonymity_type)
        VALUES
          ($/post_string_id/,
          NULL,
          $/parent_thread/,
          (SELECT id FROM users WHERE firebase_id = $/firebase_id/),
          $/content/, 
          'text', 
          NULL, 
          $/anonymity_type/)`,
        {
          post_string_id: uuidv4(),
          parent_thread: createThreadResult.id,
          firebase_id: firebaseId,
          content,
          anonimity_type: anonymityType,
        }
      );

      const randomIdentityId =
        "SELECT id FROM secret_identities ORDER BY RANDOM() LIMIT 1";
      const identityRes = await t.one(randomIdentityId);

      t.one(
        `INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
       VALUES(
         $/thread_id/,
         (SELECT id FROM users WHERE firebase_id = $/firebase_id/), 
         $/secret_identity_id/)`,
        {
          thread_id: createThreadResult.id,
          firebase_id: firebaseId,
          secret_identity_id: randomIdentityId,
        }
      );
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
    await pool.one(sql.visitThreadByStringId, {
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
