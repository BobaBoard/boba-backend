import debug from "debug";
import pool from "../db-pool";
import sql from "./sql";
import postsSQL from "../posts/sql";
import { DbBoardMetadata, DbActivityThreadType } from "../../Types";
import { getMetadataDelta } from "./utils";
import { encodeCursor, decodeCursor } from "../../utils/queries-utils";

const info = debug("bobaserver:board:queries-info");
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

export const getBoardBySlug = async ({
  firebaseId,
  slug,
}: {
  firebaseId: string | undefined;
  slug: string;
}): Promise<DbBoardMetadata> => {
  try {
    const rows = await pool.oneOrNone(sql.getBoardBySlug, {
      firebase_id: firebaseId,
      board_slug: slug,
    });

    if (!rows) {
      log(`Board not found: ${slug}`);
      return null;
    }

    info(`Got getBoardBySlug query result:`, rows);
    log(`Fetched board ${slug} for user ${firebaseId}`);
    return rows;
  } catch (e) {
    error(`Error while fetching board by slug (${slug}).`);
    error(e);
    return null;
  }
};

export const getBoardByUUID = async ({
  firebaseId,
  uuid,
}: {
  firebaseId: string | undefined;
  uuid: string;
}): Promise<DbBoardMetadata> => {
  try {
    const rows = await pool.oneOrNone(sql.getBoardByUUID, {
      firebase_id: firebaseId,
      board_uuid: uuid,
    });

    if (!rows) {
      log(`Board not found: ${uuid}`);
      return null;
    }

    info(`Got getBoardByUUID query result:`, rows);
    log(`Fetched board ${uuid} for user ${firebaseId}`);
    return rows;
  } catch (e) {
    error(`Error while fetching board by slug (${uuid}).`);
    error(e);
    return null;
  }
};

export const updateBoardMetadata = async ({
  uuid,
  firebaseId,
  oldMetadata,
  newMetadata,
}: {
  uuid: string;
  firebaseId: string;
  oldMetadata: DbBoardMetadata;
  newMetadata: Partial<DbBoardMetadata>;
}): Promise<any> => {
  try {
    const delta = getMetadataDelta({
      oldMetadata,
      newMetadata,
    });

    log(`Received metadata delta for update to board ${uuid}`);
    // TODO: print at depth (now seeing [Object])
    log(delta);

    const success = await pool
      .tx("update-descriptions", async (transaction) => {
        // Delete all old texts
        await Promise.all(
          delta.texts.deleted.map(async (text) => {
            await transaction.none(sql.deleteSection, {
              section_id: text.id,
              board_uuid: uuid,
            });
          })
        );
        log("Deleted obsolete text sections");

        // Delete all old category filters
        await Promise.all(
          delta.categoryFilters.deleted.map(async (filter) => {
            await transaction.none(sql.deleteSectionCategories, {
              section_id: filter.id,
              board_uuid: uuid,
              category_names: null,
            });
            await transaction.none(sql.deleteSection, {
              section_id: filter.id,
              board_uuid: uuid,
            });
          })
        );
        log("Deleted obsolete category filters sections");

        // Update or insert texts
        await Promise.all(
          delta.texts.newAndUpdated.map(async (text) => {
            if (oldMetadata.descriptions?.find((c) => c.id == text.id)) {
              // this is the update of an already-existing section
              await transaction.one(sql.updateSection, {
                title: text.title,
                description: text.description,
                index: text.index,
                board_uuid: uuid,
                section_id: text.id,
              });
            } else {
              await transaction.one(sql.createSection, {
                section_id: text.id,
                title: text.title,
                description: text.description,
                index: text.index,
                board_uuid: uuid,
                type: "text",
              });
            }
          })
        );
        log("Added (and updated) text sections.");

        // Update or insert category sections
        await Promise.all(
          delta.categoryFilters.newAndUpdated.map(async (category) => {
            if (oldMetadata.descriptions?.find((c) => c.id == category.id)) {
              // this is the update of an already-existing section
              await transaction.one(sql.updateSection, {
                title: category.title,
                description: category.description,
                index: category.index,
                board_uuid: uuid,
                section_id: category.id,
              });
            } else {
              await transaction.one(sql.createSection, {
                section_id: category.id,
                title: category.title,
                description: category.description,
                index: category.index,
                board_uuid: uuid,
                type: "category_filter",
              });
            }
            log("Created new category section (or updated old one).");
            if (category.categories.deleted.length > 0) {
              await transaction.none(sql.deleteSectionCategories, {
                section_id: category.id,
                board_uuid: uuid,
                category_names: category.categories.deleted,
              });
              log("Removed obsolete categories from filter.");
            }
            if (category.categories.new.length > 0) {
              await transaction.manyOrNone(
                postsSQL.createAddCategoriesQuery(category.categories.new)
              );
              await transaction.manyOrNone(
                sql.createAddCategoriesToFilterSectionQuery(
                  category.id,
                  category.categories.new
                )
              );
              log("Added new categories to filter.");
            }
          })
        );

        if (delta.tagline || delta.accentColor) {
          await transaction.none(sql.updateBoardSettings, {
            uuid,
            tagline: delta.tagline || oldMetadata.tagline,
            settings: {
              accentColor:
                delta.accentColor || oldMetadata.settings?.accentColor,
            },
          });
        }

        log("Added (and updated) category filter sections.");
        return true;
      })
      .catch((e) => {
        error(`Error while updating board metadata.`);
        error(e);
        return false;
      });

    if (!success) {
      return false;
    }

    // Now return the new result
    return await pool.oneOrNone(sql.getBoardByUUID, {
      board_uuid: uuid,
      firebase_id: firebaseId,
    });
  } catch (e) {
    error(`Error while updating board (${uuid}) metadata.`);
    error(e);
    return false;
  }
};

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
}): Promise<
  | {
      cursor: string | null;
      activity: DbActivityThreadType[];
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
        last_activity_cursor: result[result.length - 1].thread_last_activity,
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

export const getBoardActivityByUUID = async ({
  uuid,
  firebaseId,
  filterCategory,
  cursor,
  pageSize,
}: {
  uuid: string;
  firebaseId: string;
  filterCategory?: string | null;
  cursor: string;
  pageSize?: number;
}): Promise<
  | {
      cursor: string | null;
      activity: DbActivityThreadType[];
    }
  | false
> => {
  try {
    const decodedCursor = cursor && decodeCursor(cursor);

    const finalPageSize =
      decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
    const rows = await pool.manyOrNone(sql.getBoardActivityBySlug, {
      board_slug: uuid,
      firebase_id: firebaseId,
      filtered_category: filterCategory || null,
      last_activity_cursor: decodedCursor?.last_activity_cursor || null,
      page_size: finalPageSize,
    });

    if (!rows) {
      log(`Board not found: ${uuid}`);
      return null;
    }

    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Board empty: ${uuid}`);
      return { cursor: undefined, activity: [] };
    }

    let result = rows;
    let nextCursor = null;
    info(`Got getBoardActivityBySlug query result`, result);
    if (result.length > finalPageSize) {
      nextCursor = encodeCursor({
        last_activity_cursor: result[result.length - 1].thread_last_activity,
        page_size: finalPageSize,
      });
      // remove last element from array
      result.pop();
    }

    log(`Fetched board ${uuid} activity data for user ${firebaseId}`);
    return { cursor: nextCursor, activity: rows };
  } catch (e) {
    error(`Error while fetching board by uuid (${uuid}).`);
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

export const muteBoard = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.muteBoardBySlug, {
      firebase_id: firebaseId,
      board_slug: slug,
    });
    return true;
  } catch (e) {
    error(`Error while muting board.`);
    error(e);
    return false;
  }
};

export const unmuteBoard = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unmuteBoardBySlug, {
      firebase_id: firebaseId,
      board_slug: slug,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting board.`);
    error(e);
    return false;
  }
};

export const pinBoard = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.pinBoardBySlug, {
      firebase_id: firebaseId,
      board_slug: slug,
    });
    return true;
  } catch (e) {
    error(`Error while pinning board.`);
    error(e);
    return false;
  }
};

export const unpinBoard = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unpinBoardBySlug, {
      firebase_id: firebaseId,
      board_slug: slug,
    });
    return true;
  } catch (e) {
    error(`Error while unpinning board.`);
    error(e);
    return false;
  }
};

export const dismissBoardNotifications = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.dismissNotificationsBySlug, {
      firebase_id: firebaseId,
      board_slug: slug,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting board.`);
    error(e);
    return false;
  }
};
