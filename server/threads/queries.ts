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
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId?: string;
}): Promise<DbThreadType | null> => {
  const thread = await pool.oneOrNone<DbThreadType>(sql.threadByStringId, {
    thread_string_id: threadStringId,
    firebase_id: firebaseId,
  });

  if (!thread) {
    log(`Thread not found: ${threadStringId}`);
    return null;
  }

  return thread;
};

export const updateThreadView = async ({
  threadStringId,
  defaultView,
}: {
  threadStringId: string;
  defaultView: string;
}) => {
  try {
    await pool.one(sql.updateThreadViewByStringId, {
      thread_string_id: threadStringId,
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
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.visitThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while recording thread visit.`);
    error(e);
    return false;
  }
};

export const muteThread = async ({
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.muteThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while muting thread.`);
    error(e);
    return false;
  }
};

export const unmuteThread = async ({
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unmuteThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting thread.`);
    error(e);
    return false;
  }
};

export const starThread = async ({
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.starThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while adding star thread.`);
    error(e);
    return false;
  }
};

export const unstarThread = async ({
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unstarThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while removing star thread.`);
    error(e);
    return false;
  }
};

export const hideThread = async ({
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.hideThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while hiding thread.`);
    error(e);
    return false;
  }
};

export const unhideThread = async ({
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unhideThreadByStringId, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while unhiding thread.`);
    error(e);
    return false;
  }
};

export const getUserPermissionsForThread = async ({
  threadStringId,
  firebaseId,
}: {
  threadStringId: string;
  firebaseId: string;
}) => {
  try {
    const permissions = [];
    const threadDetails = await pool.one(sql.getThreadDetails, {
      firebase_id: firebaseId,
      thread_string_id: threadStringId,
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

export const moveThread = async ({
  threadStringId,
  destinationId,
}: {
  threadStringId: string;
  destinationId: string;
}) => {
  try {
    const result = await pool.none(sql.moveThread, {
      board_string_id: destinationId,
      thread_string_id: threadStringId,
    });
    return true;
  } catch (e) {
    error(`Error while getting triggered webhooks.`);
    error(e);
    return false;
  }
};
