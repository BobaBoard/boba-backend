import { decodeCursor, encodeCursor } from "utils/queries-utils";

import { DbFeedType } from "Types";
import { ZodDbFeedType } from "server/feeds/sql/zodtypes";
import debug from "debug";
import pool from "server/db-pool";
import sql from "./sql";

const info = debug("bobaserver:feeds:queries-info");
const log = debug("bobaserver:feeds:queries-log");
const error = debug("bobaserver:feeds:queries-error");

const DEFAULT_PAGE_SIZE = 10;
export const getBoardActivityByExternalId = async ({
  boardExternalId,
  firebaseId,
  categoryFilter,
  cursor,
  pageSize,
}: {
  boardExternalId: string;
  firebaseId: string | null;
  categoryFilter?: string | null;
  cursor: string | null;
  pageSize?: number;
}): Promise<ZodDbFeedType | null | false> => {
  try {
    const decodedCursor = cursor ? decodeCursor(cursor) : null;

    const finalPageSize =
      decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
    const rows = await pool.manyOrNone(sql.getBoardActivityByExternalId, {
      board_id: boardExternalId,
      firebase_id: firebaseId,
      filtered_category: categoryFilter || null,
      last_activity_cursor: decodedCursor?.last_activity_cursor || null,
      page_size: finalPageSize,
    });

    if (!rows) {
      log(`Board not found: ${boardExternalId}`);
      return null;
    }

    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Board empty: ${boardExternalId}`);
      return { cursor: null, activity: [] };
    }

    let result = rows;
    let nextCursor = null;
    info(`Got getBoardActivityByExternalId query result`, result);
    if (result.length > finalPageSize) {
      nextCursor = encodeCursor({
        last_activity_cursor:
          result[result.length - 1].thread_last_activity_at_micro,
        page_size: finalPageSize,
      });
      // remove last element from array
      result.pop();
    }

    log(
      `Fetched board ${boardExternalId} activity data for user ${firebaseId}`
    );
    return { cursor: nextCursor, activity: rows };
  } catch (e) {
    error(`Error while fetching board by slug (${boardExternalId}).`);
    error(e);
    return false;
  }
};

export const getUserActivity = async ({
  firebaseId,
  cursor,
  pageSize,
  realmExternalId,
  updatedOnly,
  ownOnly,
}: {
  firebaseId: string;
  updatedOnly: boolean;
  ownOnly: boolean;
  realmExternalId: string;
  cursor: string | null;
  pageSize?: number;
}): Promise<ZodDbFeedType | false> => {
  try {
    const decodedCursor = cursor ? decodeCursor(cursor) : null;

    const finalPageSize =
      decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
    const rows = await pool.manyOrNone(sql.getUserFeedActivity, {
      firebase_id: firebaseId,
      last_activity_cursor: decodedCursor?.last_activity_cursor || null,
      page_size: finalPageSize,
      updated_only: updatedOnly,
      own_only: ownOnly,
      realm_id: realmExternalId,
    });

    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Feed empty.`);
      return { cursor: null, activity: [] };
    }

    let result = rows;
    let nextCursor = null;
    info(`Got getUserActivity query result`, result);
    if (result.length > finalPageSize) {
      nextCursor = encodeCursor({
        last_activity_cursor:
          result[result.length - 1].thread_last_activity_at_micro,
        page_size: finalPageSize,
      });
      // remove last element from array
      result.pop();
    }

    return { cursor: nextCursor, activity: rows };
  } catch (e) {
    error(`Error while fetching activity for user (${firebaseId}).`);
    error(e);
    return false;
  }
};

export const getUserStarFeed = async ({
  firebaseId,
  cursor,
  pageSize,
}: {
  firebaseId: string;
  cursor: string | null;
  pageSize?: number;
}): Promise<ZodDbFeedType> => {
  const decodedCursor = cursor ? decodeCursor(cursor) : null;

  const finalPageSize =
    decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
  const rows = await pool.manyOrNone(sql.getUserStarThreads, {
    firebase_id: firebaseId,
    last_activity_cursor: decodedCursor?.last_activity_cursor || null,
    page_size: finalPageSize,
  });

  if (rows.length == 1 && rows[0].thread_id == null) {
    log(`Star Feed empty.`);
    return { cursor: null, activity: [] };
  }

  let result = rows;
  let nextCursor = null;
  log(`Got getBoardActivityByExternalId query result`, result);
  if (result.length > finalPageSize) {
    nextCursor = encodeCursor({
      last_activity_cursor:
        result[result.length - 1].thread_last_activity_at_micro,
      page_size: finalPageSize,
    });
    // remove last element from array
    result.pop();
  }

  return { cursor: nextCursor, activity: rows };
};