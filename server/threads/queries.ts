import {
  THREAD_OWNER_PERMISSIONS,
  type ThreadPermissions,
} from "types/permissions.js";

import { type ZodDbThreadType } from "types/db/schemas.js";
import debug from "debug";
import { extractThreadPermissions } from "utils/permissions-utils.js";
import { getBoardByExternalId } from "../boards/queries.js";
import pool from "../db-pool.js";
import sql from "./sql/index.js";

const log = debug("bobaserver:threads:queries-log");
const error = debug("bobaserver:threads:queries-error");

export const getThreadByExternalId = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId?: string | null | undefined;
}): Promise<ZodDbThreadType | null> => {
  const thread = await pool.oneOrNone<ZodDbThreadType>(sql.threadByExternalId, {
    thread_external_id: threadExternalId,
    firebase_id: firebaseId,
  });

  if (!thread) {
    log(`Thread not found: ${threadExternalId}`);
    return null;
  }

  return thread;
};

export const updateThreadView = async ({
  threadExternalId,
  defaultView,
}: {
  threadExternalId: string;
  defaultView: string;
}) => {
  try {
    await pool.one(sql.updateThreadViewByExternalId, {
      thread_external_id: threadExternalId,
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
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.visitThreadByExternalId, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while recording thread visit.`);
    error(e);
    return false;
  }
};

export const muteThread = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.muteThreadByExternalId, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while muting thread.`);
    error(e);
    return false;
  }
};

export const unmuteThread = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unmuteThreadByExternalId, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting thread.`);
    error(e);
    return false;
  }
};

export const starThread = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.starThreadByExternalId, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while adding star thread.`);
    error(e);
    return false;
  }
};

export const unstarThread = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unstarThreadByExternalId, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while removing star thread.`);
    error(e);
    return false;
  }
};

export const hideThread = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.hideThreadByExternalId, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while hiding thread.`);
    error(e);
    return false;
  }
};

export const unhideThread = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unhideThreadByExternalId, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while unhiding thread.`);
    error(e);
    return false;
  }
};

export const getUserPermissionsForThread = async ({
  threadExternalId,
  firebaseId,
}: {
  threadExternalId: string;
  firebaseId: string;
}) => {
  try {
    const permissions = [];
    const threadDetails = await pool.one(sql.getThreadDetails, {
      firebase_id: firebaseId,
      thread_external_id: threadExternalId,
    });

    if (threadDetails.is_thread_owner) {
      permissions.push(...THREAD_OWNER_PERMISSIONS);
    }

    const board = await getBoardByExternalId({
      firebaseId,
      boardExternalId: threadDetails.parent_board_id,
    });
    const threadPermissions = extractThreadPermissions(board?.permissions);
    permissions.push(...threadPermissions);
    return permissions;
  } catch (e) {
    error(`Error while getting user permissions for the thread.`);
    error(e);
    return false;
  }
};

export const moveThread = async ({
  threadExternalId,
  destinationId,
}: {
  threadExternalId: string;
  destinationId: string;
}) => {
  try {
    const result = await pool.none(sql.moveThread, {
      board_external_id: destinationId,
      thread_external_id: threadExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while getting triggered webhooks.`);
    error(e);
    return false;
  }
};
