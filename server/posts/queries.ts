import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";
import sql from "./sql";

const log = debug("bobaserver:posts:queries-log");
const error = debug("bobaserver:posts:queries-error");

export const postNewContribution = async ({
  firebaseId,
  parentPostId,
  content,
  anonymityType,
}: {
  firebaseId: string;
  parentPostId: string;
  content: string;
  anonymityType: string;
}): Promise<any> => {
  return pool
    .tx("create-contribution", async (t) => {
      const { user_id, thread_id, post_id, identity_id } = await t.one(
        sql.getThreadDetails,
        {
          post_string_id: parentPostId,
          firebase_id: firebaseId,
        }
      );
      const secret_identity_id =
        identity_id ||
        (
          await t.one(sql.getRandomIdentity, {
            thread_id,
          })
        ).secret_identity_id;
      if (!identity_id) {
        // The secret identity id is not currently in the thread data.
        // Add it.
        await t.none(sql.addIdentityToThread, {
          user_id,
          thread_id,
          secret_identity_id,
        });
      }

      return t.one(sql.makePost, {
        post_string_id: uuidv4(),
        parent_post: post_id,
        parent_thread: thread_id,
        user_id,
        content,
        anonymity_type: anonymityType,
      });
    })
    .catch((e) => {
      error(`Error while creating contribution.`);
      error(e);
      return false;
    });
};

export const postNewComment = async ({
  firebaseId,
  parentPostId,
  content,
  anonymityType,
}: {
  firebaseId: string;
  parentPostId: string;
  content: string;
  anonymityType: string;
}): Promise<any> => {
  return pool
    .tx("create-comment", async (t) => {
      const { user_id, thread_id, post_id, identity_id } = await t.one(
        sql.getThreadDetails,
        {
          post_string_id: parentPostId,
          firebase_id: firebaseId,
        }
      );
      const secret_identity_id =
        identity_id ||
        (
          await t.one(sql.getRandomIdentity, {
            thread_id,
          })
        ).secret_identity_id;
      if (!identity_id) {
        // The secret identity id is not currently in the thread data.
        // Add it.
        await t.none(sql.addIdentityToThread, {
          user_id,
          thread_id,
          secret_identity_id,
        });
      }

      return await t.one(sql.makeComment, {
        comment_string_id: uuidv4(),
        parent_post: post_id,
        parent_thread: thread_id,
        user_id,
        content,
        anonymity_type: anonymityType,
      });
    })
    .catch((e) => {
      error(`Error while creating comment.`);
      error(e);
      return false;
    });
};
