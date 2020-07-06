import debug from "debug";
import pool from "../pool";
import sql from "./sql";
import { DbThreadType } from "../types/Types";

const log = debug("bobaserver:board:queries-log");
const error = debug("bobaserver:board:queries-error");

// visible for testing
export const encodeCursor = (cursor: {
  last_activity_cursor: string;
  page_size: number;
}) => {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
};

const decodeCursor = (
  cursor: string
): {
  last_activity_cursor: string;
  page_size: number;
} => {
  return JSON.parse(Buffer.from(cursor, "base64").toString()) as any;
};

export const getBoards = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<any> => {
  try {
    return await pool.many(sql.getAllBoards, { firebase_id: firebaseId });
  } catch (e) {
    error(`Error while fetching boards.`);
    error(e);
    return false;
  }
};

export const getBoardBySlug = async (slug: string): Promise<any> => {
  try {
    const rows = await pool.oneOrNone(sql.getBoardBySlug, { board_slug: slug });

    if (!rows) {
      log(`Board not found: ${slug}`);
      return null;
    }

    log(`Got getBoardBySlug query result:`, rows);
    return rows;
  } catch (e) {
    error(`Error while fetching board by slug (${slug}).`);
    error(e);
    return null;
  }
};

const DEFAULT_PAGE_SIZE = 10;
export const getBoardActivityBySlug = async ({
  slug,
  firebaseId,
  cursor,
  pageSize,
}: {
  slug: string;
  firebaseId: string;
  cursor: string;
  pageSize?: number;
}): Promise<
  | {
      cursor: string | null;
      activity: DbThreadType[];
    }
  | false
> => {
  try {
    const decodedCursor = cursor && decodeCursor(cursor);

    const finalPageSize =
      decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
    const rows = await pool.manyOrNone(sql.getBoardActivityBySlug, {
      board_slug: slug,
      firebase_id: firebaseId,
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
    log(`Got getBoardActivityBySlug query result`, result);
    if (result.length > finalPageSize) {
      nextCursor = encodeCursor({
        last_activity_cursor: result[result.length - 1].last_activity,
        page_size: finalPageSize,
      });
      // remove last element from array
      result.pop();
    }

    return { cursor: nextCursor, activity: rows };
  } catch (e) {
    error(`Error while fetching board by slug (${slug}).`);
    error(e);
    return false;
  }
};

export const markBoardVisit = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.markBoardVisit, {
      firebase_id: firebaseId,
      board_slug: slug,
    });
    return true;
  } catch (e) {
    error(`Error while recording thread visit.`);
    error(e);
    return false;
  }
};
