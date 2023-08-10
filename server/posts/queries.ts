import { BadRequest400Error, Forbidden403Error } from "types/errors/api";
import { DbCommentType, DbPostType, QueryTagsType } from "Types";

import { ITask } from "pg-promise";
import { canPostAs } from "utils/permissions-utils";
import debug from "debug";
import invariant from "tiny-invariant";
import pool from "server/db-pool";
import sql from "./sql";
import threadsSql from "../threads/sql";
import { v4 as uuidv4 } from "uuid";

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
    .map((tag) => tag.trim().toLowerCase());
  await transaction.manyOrNone(sql.createAddTagsQuery(tags));
  log(`Returning tags:`);
  await transaction.many(sql.createAddTagsToPostQuery(postId, tags));

  return tags;
};

export const removeIndexTags = async (
  transaction: ITask<any>,
  {
    indexTags,
    postId,
  }: {
    indexTags: string[];
    postId: number;
  }
): Promise<null> => {
  if (!indexTags?.length) {
    return null;
  }
  const tags = indexTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());

  return await transaction.none(sql.deleteTagsFromPost, {
    post_id: postId,
    tags,
  });
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
    .map((tag) => tag.trim().toLowerCase());

  await transaction.manyOrNone(sql.createAddCategoriesQuery(tags));
  log(`Returning tags: ${tags}`);
  await transaction.many(sql.createAddCategoriesToPostQuery(postId, tags));

  return tags;
};

export const removeCategoryTags = async (
  transaction: ITask<any>,
  {
    categoryTags,
    postId,
  }: {
    categoryTags: string[];
    postId: number;
  }
): Promise<null> => {
  if (!categoryTags?.length) {
    return null;
  }
  const tags = categoryTags
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());

  return await transaction.none(sql.deleteCategoriesFromPost, {
    post_id: postId,
    categories: tags,
  });
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
    .map((tag) => tag.trim().toLowerCase());
  await transaction.manyOrNone(sql.createAddContentWarningsQuery(tags));
  log(`Returning tags:`);
  await transaction.many(sql.createAddContentWarningsToPostQuery(postId, tags));

  return tags;
};

export const removeContentWarningTags = async (
  transaction: ITask<any>,
  {
    contentWarnings,
    postId,
  }: {
    contentWarnings: string[];
    postId: number;
  }
): Promise<null> => {
  if (!contentWarnings?.length) {
    return null;
  }
  const tags = contentWarnings
    .filter((tag) => !!tag.trim().length)
    .map((tag) => tag.trim().toLowerCase());

  return await transaction.none(sql.deleteContentWarningsFromPost, {
    post_id: postId,
    warnings: tags,
  });
};

export const updateWhisperTags = async (
  transaction: ITask<any>,
  {
    postId,
    whisperTags,
  }: {
    postId: number;
    whisperTags: string[];
  }
): Promise<null> => {
  return await transaction.none(sql.updatePostWhisperTags, {
    whisper_tags: whisperTags,
    post_id: postId,
  });
};

export const postNewContribution = async (
  contributionData: {
    firebaseId: string;
    identityId?: string;
    accessoryId?: string;
    content: string;
    anonymityType: string;
    whisperTags: string[];
    indexTags: string[];
    categoryTags: string[];
    contentWarnings: string[];
    parentPostId?: string;
    threadExternalId?: string;
  },
  transaction?: ITask<unknown>
): Promise<{ contribution: DbPostType; boardSlug: string } | false> => {
  // We define an inner "createContribution" function that always relies on a transaction.
  // At the end of this function, we'll call createContribution with either the transaction passed
  // by the caller (if defined) or one we define ourselves.
  //
  // We need to do this because the create contribution SQL queries is actually made of many
  // subqueries (e.g. for identities and tags), and if any of those fails the whole contribution creation
  // needs to be cancelled as a single unit.
  const createContribution = async (
    transaction: ITask<unknown>
  ): Promise<{ contribution: DbPostType; boardSlug: string }> => {
    const { parentPostId, threadExternalId, firebaseId } = contributionData;
    invariant(
      parentPostId || threadExternalId,
      `Either parentPostId (${parentPostId}) or threadExternalId (${threadExternalId}) is 
       required when creating a new contribution.`
    );

    let threadData = await transaction.one(
      parentPostId ? sql.getPostDetails : sql.getThreadDetails,
      {
        post_string_id: parentPostId,
        thread_external_id: threadExternalId,
        parent_comment_string_id: null,
        firebase_id: firebaseId,
      }
    );

    if (!threadData.secret_identity_id && !threadData.role_identity_id) {
      // User has no identity assigned within this thread, so we assign it.
      const threadIdentityDetails = await addNewIdentityToThread(transaction, {
        // If an identityId was passed, then we'll try to add that specific identity
        // if not, we'll let addNewIdentityToThreadByBoardId decide how to deal with
        // assigning a new identity.
        identityExternalId: contributionData.identityId ?? null,
        accessory_id: contributionData.accessoryId ?? null,
        thread_id: threadData.thread_id,
        firebaseId,
        boardExternalId: threadData.board_external_id,
      });

      // We update thread data with the newly returned identity details
      threadData = {
        ...threadData,
        ...threadIdentityDetails,
      };
    }

    const {
      content,
      anonymityType,
      whisperTags,
      indexTags,
      contentWarnings,
      categoryTags,
    } = contributionData;
    const postedContribution = await transaction.one(sql.makePost, {
      post_string_id: uuidv4(),
      parent_post: threadData.post_id ?? null,
      parent_thread: threadData.thread_id,
      // TODO: we should remove references to firebaseId from within the server and just make it
      // so the internal user_id is what the server always deals with.
      // This way we won't have to take this information from threadData, where it really doesn't
      // belong.
      user_id: threadData.user_id,
      content: content,
      anonymity_type: anonymityType,
      whisper_tags: whisperTags,
    });
    log(`Added new contribution to thread ${threadData.thread_id}.`);
    log(postedContribution);

    const indexedTags = await maybeAddIndexTags(transaction, {
      postId: postedContribution.id,
      indexTags,
    });

    const categoryTagsResult = await maybeAddCategoryTags(transaction, {
      categoryTags,
      postId: postedContribution.id,
    });
    const contentWarningsResult = await maybeAddContentWarningTags(
      transaction,
      {
        contentWarnings,
        postId: postedContribution.id,
      }
    );

    return {
      contribution: {
        post_id: postedContribution.string_id,
        parent_thread_id: threadData.thread_external_id,
        parent_post_id: parentPostId || null,
        parent_board_slug: threadData.board_slug,
        parent_board_id: threadData.board_external_id,
        author: threadData.user_id,
        username: threadData.username,
        user_avatar: threadData.user_avatar,
        secret_identity_name: threadData.secret_identity_name,
        secret_identity_avatar: threadData.secret_identity_avatar,
        secret_identity_color: threadData.secret_identity_color,
        accessory_avatar: threadData.accessory_avatar,
        created_at: postedContribution.created_at,
        content: postedContribution.content,
        type: postedContribution.type,
        whisper_tags: postedContribution.whisper_tags,
        index_tags: indexedTags,
        category_tags: categoryTagsResult,
        content_warnings: contentWarningsResult,
        anonymity_type: postedContribution.anonymity_type,
        total_comments_amount: 0,
        new_comments_amount: 0,
        comments: null,
        friend: false,
        self: true,
        is_new: true,
        is_own: true,
      },
      boardSlug: threadData.board_slug,
    };
  };
  return transaction
    ? createContribution(transaction)
    : pool.tx("create-contribution", createContribution);
};

export const postNewCommentWithTransaction = async (
  transaction: ITask<any>,
  commentData: {
    firebaseId: string;
    parentPostId: string;
    parentCommentId: string;
    chainParentId: number | null;
    content: string;
    anonymityType: string;
    identityId?: string;
    accessoryId?: string;
  }
): Promise<{ id: number; comment: DbCommentType }> => {
  const { parentPostId, firebaseId, identityId, accessoryId, parentCommentId } =
    commentData;
  let threadData = await transaction.one(sql.getPostDetails, {
    post_string_id: parentPostId,
    parent_comment_string_id: parentCommentId,
    firebase_id: firebaseId,
  });

  if (!threadData.secret_identity_id && !threadData.role_identity_id) {
    // User has no identity assigned within this thread, so we assign it.
    const threadIdentityDetails = await addNewIdentityToThread(transaction, {
      // If an identityId was passed, then we'll try to add that specific identity
      // if not, we'll let addNewIdentityToThreadByBoardId decide how to deal with
      // assigning a new identity.
      identityExternalId: identityId ?? null,
      accessory_id: accessoryId ?? null,
      thread_id: threadData.thread_id,
      firebaseId: firebaseId,
      boardExternalId: threadData.board_external_id,
    });

    // We update thread data with the newly returned identity details
    threadData = {
      ...threadData,
      ...threadIdentityDetails,
    };
  }

  log(`Retrieved details for thread ${parentPostId}:`, threadData);

  const result = await transaction!.one(sql.makeComment, {
    comment_string_id: uuidv4(),
    parent_post_id: threadData.post_id,
    parent_comment_id: threadData.comment_id,
    parent_thread_id: threadData.thread_id,
    chain_parent_comment_id: commentData.chainParentId,
    user_id: threadData.user_id,
    content: commentData.content,
    anonymity_type: commentData.anonymityType,
  });

  const {
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    secret_identity_color,
    accessory_avatar,
  } = threadData;
  return {
    id: result.id,
    comment: {
      comment_id: result.string_id,
      parent_post_id: parentPostId,
      parent_comment_id: commentData.parentCommentId,
      chain_parent_id: result.chain_parent_comment_id,
      author: threadData.user_id,
      content: result.content,
      created_at: result.created_at,
      anonymity_type: result.anonymity_type,
      username,
      user_avatar,
      secret_identity_name,
      secret_identity_avatar,
      secret_identity_color,
      accessory_avatar,
      is_new: true,
      is_own: true,
      friend: false,
      self: true,
    },
  };
};

export const postNewCommentChain = async ({
  firebaseId,
  parentPostId,
  parentCommentId,
  contentArray,
  anonymityType,
  identityId,
  accessoryId,
}: {
  firebaseId: string;
  parentPostId: string;
  parentCommentId: string;
  contentArray: string[];
  anonymityType: string;
  identityId?: string;
  accessoryId?: string;
}): Promise<DbCommentType[] | false> => {
  return pool
    .tx("create-comment-chain", async (transaction) => {
      let prevId: number | null = null;
      let prevExternalId: string | null = null;
      const comments = [];
      for (let content of contentArray) {
        const newComment: { id: number; comment: DbCommentType } =
          await postNewCommentWithTransaction(transaction, {
            firebaseId,
            parentPostId,
            parentCommentId,
            chainParentId: prevId,
            content,
            anonymityType,
            identityId,
            accessoryId,
          });
        newComment.comment.chain_parent_id = prevExternalId;
        prevId = newComment.id;
        prevExternalId = newComment.comment.comment_id;
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

const addAccessoryToIdentity = async (
  transaction: ITask<any>,
  {
    identity_id,
    role_identity_id,
    accessory_id,
    thread_id,
  }: {
    identity_id: string;
    role_identity_id: string;
    accessory_id: string;
    thread_id: string;
  }
) => {
  invariant(
    identity_id || role_identity_id,
    "Accessory must be added to either identity or role identity"
  );
  // TODO: this is to get a random accessory for events.
  // Right now we only support actually choosing one.
  // const accessory = await transaction.one(sql.getRandomAccessory);

  const allowed_accessories =
    (await transaction.manyOrNone(sql.getUserAccessories)) || [];

  log(`allowed_accessories`, allowed_accessories);
  const selectedAccessory = allowed_accessories.find(
    (accessory) => accessory.string_id == accessory_id
  );
  if (!selectedAccessory) {
    throw new BadRequest400Error(
      "Selected accessory was not found for this user."
    );
  }

  await transaction.one(sql.addAccessoryToIdentity, {
    thread_id,
    identity_id,
    role_id: role_identity_id,
    accessory_id: selectedAccessory.id,
  });

  return {
    accessory_avatar: selectedAccessory.avatar,
  };
};

export const addNewIdentityToThread = async (
  transaction: ITask<any>,
  params: {
    firebaseId: string;
    boardExternalId: string;
    // The external id of the identity/role to post as, if such identity is predetermined.
    // If this is null, then the identity will be assigned randomly.
    identityExternalId: string | null;
    accessory_id: string | null;
    thread_id: string;
  }
) => {
  const {
    firebaseId,
    boardExternalId,
    identityExternalId,
    thread_id,
    accessory_id,
  } = params;

  let secret_identity_id;
  let role_identity_id;
  let secret_identity_name;
  let secret_identity_avatar;
  let secret_identity_color;

  if (identityExternalId) {
    // An identity/role was passed to this method, which means we don't need to randomize it.
    // The only thing we need to check is whether the user is *actually able* to post
    // as that identity.
    //
    // We find this out by checking whether the user has that role assigned to them in the board
    // or realm where the thread is, and whether the permission of that role are such that the
    const roleResult = await transaction.oneOrNone(
      threadsSql.getUserBoardRoleByExternalId,
      {
        role_external_id: identityExternalId,
        board_external_id: boardExternalId,
        firebase_id: firebaseId,
      }
    );
    if (!roleResult || !canPostAs(roleResult.permissions)) {
      throw new Forbidden403Error(
        `Attempted to post on thread ${thread_id} with unauthorized identity ${identityExternalId} for board ${boardExternalId} and user ${firebaseId}.`
      );
    }
    role_identity_id = roleResult.id;
    secret_identity_name = roleResult.name;
    secret_identity_avatar = roleResult.avatar_reference_id;
    secret_identity_color = roleResult.color;
  } else {
    const randomIdentityResult = await transaction.one(sql.getRandomIdentity, {
      thread_id,
    });
    secret_identity_id = randomIdentityResult.secret_identity_id;
    secret_identity_name = randomIdentityResult.secret_identity_name;
    secret_identity_avatar = randomIdentityResult.secret_identity_avatar;
  }

  // The secret identity id is not currently in the thread data.
  // Add it.
  log(`Adding identity to thread:`, {
    role_identity_id,
    secret_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    secret_identity_color,
    accessory_id,
  });

  await transaction.one(sql.addIdentityToThread, {
    firebase_id: firebaseId,
    thread_id,
    secret_identity_id,
    role_identity_id,
  });

  let accessory_avatar = null;
  if (accessory_id) {
    ({ accessory_avatar } = await addAccessoryToIdentity(transaction, {
      identity_id: secret_identity_id,
      role_identity_id,
      thread_id,
      accessory_id,
    }));
  }

  return {
    secret_identity_id,
    secret_identity_name,
    secret_identity_avatar,
    role_identity_id,
    accessory_avatar,
    secret_identity_color,
  };
};

export const getPostByExternalId = async (
  transaction: ITask<any> | null,
  {
    firebaseId,
    postExternalId,
  }: {
    firebaseId: string | undefined;
    postExternalId: string;
  }
): Promise<DbPostType> => {
  return await (transaction ?? pool).one(sql.postByExternalId, {
    firebase_id: firebaseId,
    post_string_id: postExternalId,
  });
};

export const updatePostTags = async (
  transaction: ITask<any> | null,
  {
    firebaseId,
    postExternalId,
    tagsDelta,
  }: {
    firebaseId: string;
    postExternalId: string;
    tagsDelta: {
      added: QueryTagsType;
      removed: QueryTagsType;
    };
  }
): Promise<DbPostType | false> => {
  const updateTagsMethod = async (transaction: ITask<any>) => {
    const post = await getPostByExternalId(transaction, {
      firebaseId,
      postExternalId,
    });
    const numericId = (
      await transaction.one<{ id: number }>(sql.getPostIdFromExternalId, {
        post_string_id: postExternalId,
      })
    ).id;
    await maybeAddIndexTags(transaction, {
      indexTags: tagsDelta.added.indexTags,
      postId: numericId,
    });
    await removeIndexTags(transaction, {
      indexTags: tagsDelta.removed.indexTags,
      postId: numericId,
    });
    await maybeAddCategoryTags(transaction, {
      categoryTags: tagsDelta.added.categoryTags,
      postId: numericId,
    });
    await removeCategoryTags(transaction, {
      categoryTags: tagsDelta.removed.categoryTags,
      postId: numericId,
    });
    await maybeAddContentWarningTags(transaction, {
      contentWarnings: tagsDelta.added.contentWarnings,
      postId: numericId,
    });
    await removeContentWarningTags(transaction, {
      contentWarnings: tagsDelta.removed.contentWarnings,
      postId: numericId,
    });
    const newWhisperTags = post.whisper_tags
      .filter((tag) => !tagsDelta.removed.whisperTags.includes(tag))
      .concat(tagsDelta.added.whisperTags);
    await updateWhisperTags(transaction, {
      postId: numericId,
      whisperTags: newWhisperTags,
    });

    return await getPostByExternalId(transaction, {
      firebaseId,
      postExternalId,
    });
  };

  try {
    return await (transaction
      ? updateTagsMethod(transaction)
      : pool.tx("update-tags", updateTagsMethod));
  } catch (e) {
    log(e);
    return false;
  }
};
