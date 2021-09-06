import debug from "debug";
import pool from "../db-pool";
import sql from "./sql";
import { DbFeedType } from "../../Types";
import { encodeCursor, decodeCursor } from "../../utils/queries-utils";

const info = debug("bobaserver:feeds:queries-info");
const log = debug("bobaserver:feeds:queries-log");
const error = debug("bobaserver:feeds:queries-error");

const DEFAULT_PAGE_SIZE = 10;
export const getBoardActivityBySlug = async ({
  slug,
  firebaseId,
  filterCategory,
  cursor,
  pageSize,
}: {
  slug: string;
  firebaseId: string;
  filterCategory?: string | null;
  cursor: string;
  pageSize?: number;
}): Promise<DbFeedType | false> => {
  try {
    const decodedCursor = cursor && decodeCursor(cursor);

    const finalPageSize =
      decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
    const rows = await pool.manyOrNone(sql.getBoardActivityBySlug, {
      board_slug: slug,
      firebase_id: firebaseId,
      filtered_category: filterCategory || null,
      last_activity_cursor: decodedCursor?.last_activity_cursor || null,
      page_size: finalPageSize,
    });

    if (!rows) {
      log(`Board not found: ${slug}`);
      return null;
    }

    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Board empty: ${slug}`);
      return { cursor: undefined, activity: [] };
    }

    let result = rows;
    let nextCursor = null;
    info(`Got getBoardActivityBySlug query result`, result);
    if (result.length > finalPageSize) {
      nextCursor = encodeCursor({
        last_activity_cursor:
          result[result.length - 1].thread_last_activity_at_micro,
        page_size: finalPageSize,
      });
      // remove last element from array
      result.pop();
    }

    log(`Fetched board ${slug} activity data for user ${firebaseId}`);
    return { cursor: nextCursor, activity: rows };
  } catch (e) {
    error(`Error while fetching board by slug (${slug}).`);
    error(e);
    return false;
  }
};

export const getUserActivity = async ({
  firebaseId,
  cursor,
  pageSize,
  updatedOnly,
  ownOnly,
}: {
  firebaseId: string;
  updatedOnly: boolean;
  ownOnly: boolean;
  cursor: string | null;
  pageSize?: number;
}): Promise<DbFeedType | false> => {
  try {
    const decodedCursor = cursor && decodeCursor(cursor);

    const finalPageSize =
      decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
    const rows = await pool.manyOrNone(sql.getUserFeedActivity, {
      firebase_id: firebaseId,
      last_activity_cursor: decodedCursor?.last_activity_cursor || null,
      page_size: finalPageSize,
      updated_only: updatedOnly,
      own_only: ownOnly,
    });

    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Feed empty.`);
      return { cursor: undefined, activity: [] };
    }

    let result = rows;
    let nextCursor = null;
    log(`Got getBoardActivityBySlug query result`, result);
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
