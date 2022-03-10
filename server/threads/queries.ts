import { THREAD_OWNER_PERMISSIONS, ThreadPermissions } from "types/permissions";
import {
  addNewIdentityToThreadByBoardId,
  maybeAddCategoryTags,
  maybeAddContentWarningTags,
  maybeAddIndexTags,
} from "../posts/queries";

import { DbThreadType } from "Types";
import debug from "debug";
import { extractThreadPermissions } from "utils/permissions-utils";
import { getBoardBySlug } from "../boards/queries";
import pool from "server/db-pool";
import sql from "./sql";
import { v4 as uuidv4 } from "uuid";

const log = debug("bobaserver:threads:queries-log");
const error = debug("bobaserver:threads:queries-error");

export const getThreadByStringId = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId?: string;
}): Promise<DbThreadType | null> => {
  const thread = await pool.oneOrNone<DbThreadType>(sql.threadByStringId, {
    thread_string_id: threadId,
    firebase_id: firebaseId,
  });

  if (!thread) {
    log(`Thread not found: ${threadId}`);
    return null;
  }

  return thread;
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

export const starThread = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.starThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while adding star thread.`);
    error(e);
    return false;
  }
};

export const unstarThread = async ({
  threadId,
  firebaseId,
}: {
  threadId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unstarThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while removing star thread.`);
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
  try {
    const permissions = [];
    const threadDetails = await pool.one(sql.getThreadDetails, {
      firebase_id: firebaseId,
      thread_string_id: threadId,
    });

    if (threadDetails.is_thread_owner) {
      permissions.push(...THREAD_OWNER_PERMISSIONS);
    }

    const board = await getBoardBySlug({
      firebaseId,
      slug: threadDetails.parent_board_slug,
    });
    const threadPermissions = extractThreadPermissions(board.permissions);
    permissions.push(...threadPermissions);
    return permissions;
  } catch (e) {
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
      subscriptionIds: string[];
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
      subscriptionIds: result.subscription_ids,
    }));
  } catch (e) {
    error(`Error while getting triggered webhooks.`);
    error(e);
    return false;
  }
};

export const moveThread = async ({
  threadId,
  destinationId,
}: {
  threadId: string;
  destinationId: string;
}) => {
  try {
    const result = await pool.none(sql.moveThread, {
      board_string_id: destinationId,
      thread_string_id: threadId,
    });
    return true;
  } catch (e) {
    error(`Error while getting triggered webhooks.`);
    error(e);
    return false;
  }
};
