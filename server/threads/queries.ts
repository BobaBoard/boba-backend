import { DbThreadType, ThreadPermissions } from "../../Types";
import {
  addNewIdentityToThread,
  maybeAddCategoryTags,
  maybeAddContentWarningTags,
  maybeAddIndexTags,
} from "../posts/queries";

import debug from "debug";
import { getBoardBySlug } from "../boards/queries";
import pool from "../db-pool";
import sql from "./sql";
import { transformThreadPermissions } from "../../utils/permissions-utils";
import { v4 as uuidv4 } from "uuid";

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
    const thread = await pool.oneOrNone(sql.threadByStringId, {
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

export const updateThreadView = async ({
  threadId,
  defaultView,
}: {
  threadId: string;
  defaultView: string;
}) => {
  try {
    await pool.one(sql.updateThreadViewByStringId, {
      thread_string_id: threadId,
      thread_default_view: defaultView,
    });
    return true;
  } catch (e) {
    error(`Error while updating thread view.`);
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
  indexTags,
  categoryTags,
  contentWarnings,
  identityId,
  accessoryId,
  defaultView,
}: {
  firebaseId: string;
  content: string;
  isLarge: boolean;
  defaultView: string;
  anonymityType: string;
  boardSlug: string;
  whisperTags: string[];
  indexTags: string[];
  categoryTags: string[];
  contentWarnings: string[];
  identityId?: string;
  accessoryId?: string;
}) => {
  return pool
    .tx("create-thread", async (t) => {
      const threadStringId = uuidv4();
      const createThreadResult = await t.one(sql.createThread, {
        thread_string_id: threadStringId,
        board_slug: boardSlug,
        thread_options: {
          default_view: defaultView,
        },
      });
      log(`Created thread entry for thread ${threadStringId}`);

      const postStringId = uuidv4();
      const postResult = await t.one(sql.createPost, {
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

      await maybeAddIndexTags(t, {
        indexTags,
        postId: postResult.id,
      });
      await maybeAddCategoryTags(t, {
        categoryTags,
        postId: postResult.id,
      });
      await maybeAddContentWarningTags(t, {
        contentWarnings,
        postId: postResult.id,
      });

      await addNewIdentityToThread(t, {
        user_id: postResult.author,
        identityId,
        accessory_id: accessoryId,
        thread_id: createThreadResult.id,
        firebaseId,
        board_slug: boardSlug,
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

export const muteThread = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.muteThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while muting thread.`);
    error(e);
    return false;
  }
};

export const unmuteThread = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unmuteThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting thread.`);
    error(e);
    return false;
  }
};

export const hideThread = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.hideThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while hiding thread.`);
    error(e);
    return false;
  }
};

export const unhideThread = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unhideThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while unhiding thread.`);
    error(e);
    return false;
  }
};

export const getUserPermissionsForThread = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  console.log("$$$$$$$$$$");
  console.log("$$$$$$$$$$");
  console.log("$$$$$$$$$$");
  console.log("$$$$$$$$$$");
  try {
    const permissions = [];
    console.log("$$$$$$$$$$");
    const threadDetails = await pool.one(sql.getThreadDetails, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });

    console.log("$$$$$$$$$$");
    if (threadDetails.is_thread_owner) {
      permissions.push(ThreadPermissions.editDefaultView);
    }

    const board = await getBoardBySlug({
      firebaseId,
      slug: threadDetails.parent_board_slug,
    });
    const threadPermissions = transformThreadPermissions(board.permissions);
    permissions.push(...threadPermissions);
    return permissions;
  } catch (e) {
    console.log("$$$$$$$$$$");
    error(`Error while getting user permissions for the thread.`);
    error(e);
    return false;
  }
};

export const getTriggeredWebhooks = async ({
  slug,
  categories,
}: {
  slug: string;
  categories: string[];
}): Promise<
  | {
      webhook: string;
      subscriptionNames: string[];
      triggeredCategories: string[];
    }[]
  | false
> => {
  try {
    const result = await pool.manyOrNone(sql.getTriggeredWebhooks, {
      board_slug: slug,
      category_names: categories.map((category) =>
        category.toLowerCase().trim()
      ),
    });
    return result.map((result) => ({
      webhook: result.webhook,
      subscriptionNames: result.subscription_names,
      triggeredCategories: result.triggered_categories,
    }));
  } catch (e) {
    error(`Error while getting triggered webhooks.`);
    error(e);
    return false;
  }
};

export const moveThread = async ({
  threadId,
  destinationSlug,
}: {
  threadId: string;
  destinationSlug: string;
}) => {
  try {
    const result = await pool.none(sql.moveThread, {
      board_slug: destinationSlug,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while getting triggered webhooks.`);
    error(e);
    return false;
  }
};
