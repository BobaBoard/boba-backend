import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";
import sql from "./sql";
import threadsSql from "../threads/sql";
import { DbPostType, DbCommentType } from "../../Types";
import { ITask } from "pg-promise";
import { canPostAs } from "../permissions-utils";

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

export const maybeAddCategoryTags = async (
  transaction: ITask<any>,
  {
    categoryTags,
    postId,
  }: {
    categoryTags: string[];
    postId: number;
  }
): Promise<string[]> => {
  if (!categoryTags?.length) {
    return [];
  }
  const tags = categoryTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim());
  await transaction.manyOrNone(sql.createAddCategoriesQuery(tags));
  log(`Returning tags:`);
  await transaction.many(sql.createAddCategoriesToPostQuery(postId, tags));

  return tags.map((tag) => tag.toLowerCase());
};

export const maybeAddContentWarningTags = async (
  transaction: ITask<any>,
  {
    contentWarnings,
    postId,
  }: {
    contentWarnings: string[];
    postId: number;
  }
): Promise<string[]> => {
  if (!contentWarnings?.length) {
    return [];
  }
  const tags = contentWarnings
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim());
  await transaction.manyOrNone(sql.createAddContentWarningsQuery(tags));
  log(`Returning tags:`);
  await transaction.many(sql.createAddContentWarningsToPostQuery(postId, tags));

  return tags.map((tag) => tag.toLowerCase());
};

const getThreadDetails = async (
  transaction: ITask<any>,
  {
    parentPostId,
    firebaseId,
    parentCommentId,
    identityId,
  }: {
    firebaseId: string;
    parentPostId: string;
    parentCommentId?: string;
    identityId?: string;
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
  comment_id: number;
}> => {
  let {
    user_id,
    username,
    user_avatar,
    secret_identity_id,
    role_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    thread_string_id,
    post_id,
    comment_id,
    board_slug,
  } = await transaction.one(sql.getThreadDetails, {
    post_string_id: parentPostId,
    firebase_id: firebaseId,
    parent_comment_string_id: parentCommentId,
  });

  log(`Found details for thread:`);
  log({
    user_id,
    username,
    user_avatar,
    secret_identity_id,
    role_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    thread_string_id,
    post_id,
  });

  if (!role_identity_id && !secret_identity_id) {
    ({
      secret_identity_id,
      secret_identity_name,
      secret_identity_avatar,
      role_identity_id,
    } = await addNewIdentityToThread(transaction, {
      user_id,
      identityId,
      thread_id,
      firebaseId,
      board_slug,
    }));
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
    comment_id,
  };
};

export const postNewContribution = async ({
  firebaseId,
  identityId,
  parentPostId,
  content,
  isLarge,
  anonymityType,
  whisperTags,
  indexTags,
  contentWarnings,
  categoryTags,
}: {
  firebaseId: string;
  identityId?: string;
  parentPostId: string;
  content: string;
  isLarge: boolean;
  anonymityType: string;
  whisperTags: string[];
  indexTags: string[];
  categoryTags: string[];
  contentWarnings: string[];
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
        identityId,
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

      const categoryTagsResult = await maybeAddCategoryTags(t, {
        categoryTags,
        postId: result.id,
      });
      const contentWarningsResult = await maybeAddContentWarningTags(t, {
        contentWarnings,
        postId: result.id,
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
        category_tags: categoryTagsResult,
        content_warnings: contentWarningsResult,
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

const postNewCommentWithTransaction = async ({
  firebaseId,
  parentPostId,
  parentCommentId,
  chainParentId,
  content,
  anonymityType,
  transaction,
}: {
  transaction?: ITask<any>;
  firebaseId: string;
  parentPostId: string;
  parentCommentId: string;
  chainParentId: number | null;
  content: string;
  anonymityType: string;
}): Promise<{ id: number; comment: DbCommentType }> => {
  let {
    user_id,
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    post_id,
    comment_id,
  } = await getThreadDetails(transaction, {
    parentPostId,
    firebaseId,
    parentCommentId,
  });

  log(`Retrieved details for thread ${parentPostId}:`);
  log({
    user_id,
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    thread_id,
    post_id,
    comment_id,
  });

  const result = await transaction.one(sql.makeComment, {
    comment_string_id: uuidv4(),
    parent_post: post_id,
    parent_comment: comment_id,
    parent_thread: thread_id,
    chain_parent_comment: chainParentId,
    user_id,
    content,
    anonymity_type: anonymityType,
  });

  return {
    id: result.id,
    comment: {
      comment_id: result.string_id,
      parent_post: parentPostId,
      parent_comment: parentCommentId,
      chain_parent_id: result.chain_parent_comment,
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
    },
  };
};

export const postNewComment = async ({
  firebaseId,
  parentPostId,
  parentCommentId,
  content,
  anonymityType,
}: {
  firebaseId: string;
  parentPostId: string;
  parentCommentId: string;
  content: string;
  anonymityType: string;
}): Promise<DbCommentType | false> => {
  return pool
    .tx("create-comment", async (transaction) => {
      const result = await postNewCommentWithTransaction({
        firebaseId,
        parentPostId,
        parentCommentId,
        chainParentId: null,
        content,
        anonymityType,
        transaction,
      });
      return result.comment;
    })
    .catch((e) => {
      error(`Error while creating comment.`);
      error(e);
      return false;
    });
};

export const postNewCommentChain = async ({
  firebaseId,
  parentPostId,
  parentCommentId,
  contentArray,
  anonymityType,
}: {
  firebaseId: string;
  parentPostId: string;
  parentCommentId: string;
  contentArray: string[];
  anonymityType: string;
}): Promise<DbCommentType[] | false> => {
  return pool
    .tx("create-comment-chaim", async (transaction) => {
      let prevId: number = null;
      let prevStringId: string = null;
      const comments = [];
      for (let content of contentArray) {
        const newComment = await postNewCommentWithTransaction({
          firebaseId,
          parentPostId,
          parentCommentId,
          chainParentId: prevId,
          content,
          anonymityType,
          transaction,
        });
        newComment.comment.chain_parent_id = prevStringId;
        prevId = newComment.id;
        prevStringId = newComment.comment.comment_id;
        comments.push(newComment.comment);
      }
      return comments;
    })
    .catch((e) => {
      error(`Error while creating comment.`);
      error(e);
      return false;
    });
};

const addNewIdentityToThread = async (
  transaction: ITask<any>,
  {
    user_id,
    identityId,
    thread_id,
    firebaseId,
    board_slug,
  }: {
    identityId: string;
    firebaseId: string;
    user_id: any;
    board_slug: any;
    thread_id: any;
  }
) => {
  let secret_identity_id = null;
  let role_identity_id = null;
  let secret_identity_name;
  let secret_identity_avatar;

  if (!identityId) {
    const randomIdentityResult = await transaction.one(sql.getRandomIdentity, {
      thread_id,
    });
    secret_identity_id = randomIdentityResult.secret_identity_id;
    secret_identity_name = randomIdentityResult.secret_identity_name;
    secret_identity_avatar = randomIdentityResult.secret_identity_avatar;
  } else {
    const roleResult = await transaction.one(threadsSql.getRoleByStringId, {
      role_id: identityId,
      firebase_id: firebaseId,
      board_slug,
    });
    if (!canPostAs(roleResult.permissions)) {
      throw new Error(
        "Attempted to post on thread with identity without post as permissions"
      );
    }
    role_identity_id = roleResult.id;
    secret_identity_name = roleResult.name;
    secret_identity_avatar = roleResult.avatar_reference_id;
  }

  // The secret identity id is not currently in the thread data.
  // Add it.
  log(`Adding identity to thread:`);
  log({
    role_identity_id,
    secret_identity_id,
    secret_identity_name,
    secret_identity_avatar,
  });

  await transaction.one(sql.addIdentityToThread, {
    user_id,
    thread_id,
    secret_identity_id,
    role_identity_id,
  });

  return {
    secret_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    role_identity_id,
  };
};
