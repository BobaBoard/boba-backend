import debug from "debug";
import pool from "../pool";
import sql from "./sql";

const log = debug("bobaserver:board:queries-log");
const error = debug("bobaserver:board:queries-error");

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

export const getBoardActivityBySlug = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}): Promise<any> => {
  try {
    const rows = await pool.manyOrNone(sql.getBoardActivityBySlug, {
      board_slug: slug,
      firebase_id: firebaseId,
    });

    if (!rows) {
      log(`Board not found: ${slug}`);
      return null;
    }

    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Board empty: ${slug}`);
      return [];
    }

    const result = rows;
    log(`Got getBoardActivityBySlug query result`, result);
    return result;
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
