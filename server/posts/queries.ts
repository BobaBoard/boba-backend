import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";
import sql from "./sql";
import { DbPostType, DbCommentType } from "../types/Types";
import { ITask } from "pg-promise";

const log = debug("bobaserver:posts:queries-log");
const error = debug("bobaserver:posts:queries-error");

export const maybeAddIndexTags = async (
  transaction: ITask<any>,
  {
    indexTags,
    postId,
  }: {
    indexTags: string[];
    postId: number;
  }
): Promise<string[]> => {
  if (!indexTags?.length) {
    return [];
  }
  const tags = indexTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim());
  await transaction.manyOrNone(sql.createAddTagsQuery(tags));
  log(`Returning tags:`);
  await transaction.many(sql.createAddTagsToPostQuery(postId, tags));

  return tags.map((tag) => tag.toLowerCase());
};

const getThreadDetails = async (
  transaction: ITask<any>,
  {
    parentPostId,
    firebaseId,
  }: {
    firebaseId: string;
    parentPostId: string;
  }
): Promise<{
  user_id: number;
  username: string;
  user_avatar: string;
  secret_identity_name: string;
  secret_identity_avatar: string;
  thread_id: number;
  thread_string_id: string;
  post_id: number;
}> => {
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
  } = await transaction.one(sql.getThreadDetails, {
    post_string_id: parentPostId,
    firebase_id: firebaseId,
  });

  log(`Found details for thread:`);
  log({
    user_id,
    username,
    user_avatar,
    secret_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    thread_string_id,
    post_id,
  });

  if (!secret_identity_id) {
    const randomIdentityResult = await transaction.one(sql.getRandomIdentity, {
      thread_id,
    });
    secret_identity_id = randomIdentityResult.secret_identity_id;
    secret_identity_name = randomIdentityResult.secret_identity_name;
    secret_identity_avatar = randomIdentityResult.secret_identity_avatar;
    // The secret identity id is not currently in the thread data.
    // Add it.
    log(`Adding identity to thread:`);
    log({
      secret_identity_id,
      secret_identity_name,
      secret_identity_avatar,
    });
    await transaction.one(sql.addIdentityToThread, {
      user_id,
      thread_id,
      secret_identity_id,
    });
  }

  return {
    user_id,
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    thread_string_id,
    post_id,
  };
};

export const postNewContribution = async ({
  firebaseId,
  parentPostId,
  content,
  isLarge,
  anonymityType,
  whisperTags,
  indexTags,
}: {
  firebaseId: string;
  parentPostId: string;
  content: string;
  isLarge: boolean;
  anonymityType: string;
  whisperTags: string[];
  indexTags: string[];
}): Promise<DbPostType | false> => {
  return pool
    .tx("create-contribution", async (t) => {
      let {
        user_id,
        username,
        user_avatar,
        secret_identity_name,
        secret_identity_avatar,
        thread_id,
        thread_string_id,
        post_id,
      } = await getThreadDetails(t, {
        parentPostId,
        firebaseId,
      });
      const result = await t.one(sql.makePost, {
        post_string_id: uuidv4(),
        parent_post: post_id,
        parent_thread: thread_id,
        user_id,
        content,
        anonymity_type: anonymityType,
        whisper_tags: whisperTags,
        indexTags: indexTags,
        options: {
          wide: isLarge,
        },
      });
      log(`Added new contribution to thread ${thread_id}.`);
      log(result);

      const indexedTags = await maybeAddIndexTags(t, {
        postId: result.id,
        indexTags,
      });

      return {
        post_id: result.string_id,
        parent_thread_id: thread_string_id,
        parent_post_id: parentPostId,
        author: user_id,
        username,
        user_avatar,
        secret_identity_name,
        secret_identity_avatar,
        created: result.created_string,
        content: result.content,
        options: result.options,
        type: result.type,
        whisper_tags: result.whisper_tags,
        index_tags: indexedTags,
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
}): Promise<DbCommentType | false> => {
  return pool
    .tx("create-comment", async (t) => {
      let {
        user_id,
        username,
        user_avatar,
        secret_identity_name,
        secret_identity_avatar,
        thread_id,
        post_id,
      } = await getThreadDetails(t, {
        parentPostId,
        firebaseId,
      });

      const result = await t.one(sql.makeComment, {
        comment_string_id: uuidv4(),
        parent_post: post_id,
        parent_thread: thread_id,
        user_id,
        content,
        anonymity_type: anonymityType,
      });

      return {
        comment_id: result.string_id,
        parent_post: parentPostId,
        chain_parent_string_id: null,
        author: user_id,
        content: result.content,
        created: result.created_string,
        anonymity_type: result.anonymity_type,
        username,
        user_avatar,
        secret_identity_name,
        secret_identity_avatar,
        is_new: true,
        is_own: true,
        friend: false,
        self: true,
      };
    })
    .catch((e) => {
      error(`Error while creating comment.`);
      error(e);
      return false;
    });
};
