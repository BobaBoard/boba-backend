import debug from "debug";
import pool from "../db-pool";
import sql from "./sql";
import postsSQL from "../posts/sql";
import { DbBoardMetadata, DbActivityThreadType } from "../../Types";
import { getMetadataDelta } from "./utils";

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

export const updateBoardMetadata = async ({
  slug,
  firebaseId,
  oldMetadata,
  newMetadata,
}: {
  slug: string;
  firebaseId: string;
  oldMetadata: DbBoardMetadata;
  newMetadata: Partial<DbBoardMetadata>;
}): Promise<any> => {
  try {
    const delta = getMetadataDelta({
      oldMetadata,
      newMetadata,
    });

    log(`Received metadata delta for update to board ${slug}`);
    // TODO: print at depth (now seeing [Object])
    log(delta);

    const success = await pool
      .tx("update-descriptions", async (transaction) => {
        // Delete all old texts
        await Promise.all(
          delta.texts.deleted.map(async (text) => {
            await transaction.none(sql.deleteSection, {
              section_id: text.id,
              board_slug: slug,
            });
          })
        );
        log("Deleted obsolete text sections");

        // Delete all old category filters
        await Promise.all(
          delta.categoryFilters.deleted.map(async (filter) => {
            await transaction.none(sql.deleteSectionCategories, {
              section_id: filter.id,
              board_slug: slug,
              category_names: null,
            });
            await transaction.none(sql.deleteSection, {
              section_id: filter.id,
              board_slug: slug,
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
                board_slug: slug,
                section_id: text.id,
              });
            } else {
              await transaction.one(sql.createSection, {
                section_id: text.id,
                title: text.title,
                description: text.description,
                index: text.index,
                board_slug: slug,
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
                board_slug: slug,
                section_id: category.id,
              });
            } else {
              await transaction.one(sql.createSection, {
                section_id: category.id,
                title: category.title,
                description: category.description,
                index: category.index,
                board_slug: slug,
                type: "category_filter",
              });
            }
            log("Created new category section (or updated old one).");
            if (category.categories.deleted.length > 0) {
              await transaction.none(sql.deleteSectionCategories, {
                section_id: category.id,
                board_slug: slug,
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
            slug,
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
    return await pool.oneOrNone(sql.getBoardBySlug, {
      board_slug: slug,
      firebase_id: firebaseId,
    });
  } catch (e) {
    error(`Error while updating board (${slug}) metadata.`);
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
