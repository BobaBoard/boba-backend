import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";
import sql from "./sql";
import { DbPostType } from "../types/Types";

const log = debug("bobaserver:posts:queries-log");
const error = debug("bobaserver:posts:queries-error");

export const postNewContribution = async ({
  firebaseId,
  parentPostId,
  content,
  isLarge,
  anonymityType,
  whisperTags,
}: {
  firebaseId: string;
  parentPostId: string;
  content: string;
  isLarge: boolean;
  anonymityType: string;
  whisperTags: string;
}): Promise<DbPostType | false> => {
  return pool
    .tx("create-contribution", async (t) => {
      let {
        user_id,
        username,
        user_avatar,
        secret_identity_id,
        secret_identity_name,
        secret_identity_avatar,
        thread_id,
        thread_string_id,
        post_id,
      } = await t.one(sql.getThreadDetails, {
        post_string_id: parentPostId,
        firebase_id: firebaseId,
      });

      if (!secret_identity_id) {
        const randomIdentityResult = await t.one(sql.getRandomIdentity, {
          thread_id,
        });
        secret_identity_name = randomIdentityResult.secret_identity_name;
        secret_identity_avatar = randomIdentityResult.secret_identity_avatar;
        // The secret identity id is not currently in the thread data.
        // Add it.
        await t.one(sql.addIdentityToThread, {
          user_id,
          thread_id,
          secret_identity_id,
        });
      }

      const result = await t.one(sql.makePost, {
        post_string_id: uuidv4(),
        parent_post: post_id,
        parent_thread: thread_id,
        user_id,
        content,
        anonymity_type: anonymityType,
        whisper_tags: whisperTags,
        options: {
          wide: isLarge,
        },
      });
      log(`Added new contribution to thread ${thread_id}.`);
      log(result);
      return {
        post_id: result.string_id,
        parent_thread_id: thread_string_id,
        parent_post_id: parentPostId,
        author: user_id,
        username,
        user_avatar,
        secret_identity_name,
        secret_identity_avatar,
        created: result.created,
        content: result.content,
        options: result.options,
        type: result.type,
        whisper_tags: result.whisper_tags,
        anonymity_type: result.anonymity_type,
        total_comments_amount: 0,
        new_comments_amount: 0,
        comments: null,
        friend: false,
        self: true,
        is_new: true,
        is_own: true,
      };
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
