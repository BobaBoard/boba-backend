import { BoardByExternalId, BoardByExternalIdSchema } from "./sql/types";

import { ITask } from "pg-promise";
import debug from "debug";
import { getMetadataDelta } from "./utils";
import pool from "server/db-pool";
import { postNewContribution } from "server/posts/queries";
import postsSQL from "../posts/sql";
import sql from "./sql";
import threadsSql from "../threads/sql";
import { v4 as uuidv4 } from "uuid";

const info = debug("bobaserver:board:queries-info");
const log = debug("bobaserver:board:queries-log");
const error = debug("bobaserver:board:queries-error");

export const getBoards = async ({
  firebaseId,
  realmExternalId,
}: {
  firebaseId: string | null;
  realmExternalId?: string;
}): Promise<any> => {
  try {
    return await pool.many(sql.getAllBoards, {
      firebase_id: firebaseId,
      realm_external_id: realmExternalId,
    });
  } catch (e) {
    error(`Error while fetching boards.`);
    error(e);
    return false;
  }
};

export const getBoardByExternalId = async ({
  firebaseId,
  boardExternalId,
}: {
  firebaseId: string | undefined;
  boardExternalId: string;
}) => {
  try {
    const rows = await pool.oneOrNone(sql.getBoardByExternalId, {
      firebase_id: firebaseId,
      board_id: boardExternalId,
    });

    if (!rows) {
      log(`Board not found: ${boardExternalId}`);
      return null;
    }

    info(`Got getBoardByExternalId query result:`, rows);
    log(`Fetched board ${boardExternalId} for user ${firebaseId}`);
    return BoardByExternalIdSchema.parse(rows);
  } catch (e) {
    error(`Error while fetching board by id (${boardExternalId}).`);
    error(e);
    return null;
  }
};

const updateCategoriesDescriptions = async (
  tx: ITask<unknown>,
  {
    boardExternalId,
    categoryFilters,
  }: {
    boardExternalId: string;
    categoryFilters: ReturnType<typeof getMetadataDelta>["categoryFilters"];
  }
) => {
  // Delete all old category filters
  await Promise.all(
    categoryFilters.deleted.map(async (filter) => {
      await tx.none(sql.deleteSectionCategories, {
        section_id: filter.id,
        board_id: boardExternalId,
        category_names: null,
      });
      await tx.none(sql.deleteSection, {
        section_id: filter.id,
        board_id: boardExternalId,
      });
    })
  );
  log("Deleted obsolete category filters sections");

  // Update or insert category sections
  await Promise.all(
    categoryFilters.newAndUpdated.map(async (category) => {
      if (category.updated) {
        // this is the update of an already-existing section
        await tx.one(sql.updateSection, {
          title: category.title,
          description: category.description,
          index: category.index,
          board_id: boardExternalId,
          section_id: category.id,
        });
      } else {
        await tx.one(sql.createSection, {
          section_id: category.id,
          title: category.title,
          description: category.description,
          index: category.index,
          board_id: boardExternalId,
          type: "category_filter",
        });
      }
      log("Created new category section (or updated old one).");
      if (category.categories!.deleted.length > 0) {
        await tx.none(sql.deleteSectionCategories, {
          section_id: category.id,
          board_id: boardExternalId,
          category_names: category.categories!.deleted,
        });
        log("Removed obsolete categories from filter.");
      }
      if (category.categories!.new.length > 0) {
        await tx.manyOrNone(
          postsSQL.createAddCategoriesQuery(category.categories!.new)
        );
        await tx.manyOrNone(
          sql.createAddCategoriesToFilterSectionQuery(
            category.id,
            category.categories!.new
          )
        );
        log("Added new categories to filter.");
      }
    })
  );
  log("Added (and updated) category filter sections.");
};

const updateTextDescriptions = async (
  tx: ITask<unknown>,
  {
    boardExternalId,
    texts,
  }: {
    boardExternalId: string;
    texts: ReturnType<typeof getMetadataDelta>["texts"];
  }
) => {
  // Delete all old texts
  await Promise.all(
    texts.deleted.map(async (text) => {
      await tx.none(sql.deleteSection, {
        section_id: text.id,
        board_id: boardExternalId,
      });
    })
  );
  log("Deleted obsolete text sections");

  // Update or insert texts
  await Promise.all(
    texts.newAndUpdated.map(async (text) => {
      if (text.updated) {
        // this is the update of an already-existing section
        await tx.one(sql.updateSection, {
          title: text.title,
          description: text.description,
          index: text.index,
          board_id: boardExternalId,
          section_id: text.id,
        });
      } else {
        await tx.one(sql.createSection, {
          section_id: text.id,
          title: text.title,
          description: text.description,
          index: text.index,
          board_id: boardExternalId,
          type: "text",
        });
      }
    })
  );
  log("Added (and updated) text sections.");
};

export const updateBoardMetadata = async ({
  boardExternalId,
  firebaseId,
  oldMetadata,
  newMetadata,
}: {
  boardExternalId: string;
  firebaseId: string;
  oldMetadata: BoardByExternalId;
  newMetadata: Partial<BoardByExternalId>;
}): Promise<any> => {
  try {
    const delta = getMetadataDelta({
      oldMetadata,
      newMetadata,
    });

    log(`Received metadata delta for update to board ${boardExternalId}`);
    info(delta);

    const success = await pool
      .tx("update-descriptions", async (transaction) => {
        if (delta.tagline || delta.accentColor) {
          await transaction.none(sql.updateBoardSettings, {
            board_id: boardExternalId,
            tagline: delta.tagline || oldMetadata.tagline,
            settings: {
              accentColor:
                delta.accentColor || oldMetadata.settings?.accentColor,
            },
          });
        }

        await updateCategoriesDescriptions(transaction, {
          boardExternalId,
          categoryFilters: delta.categoryFilters,
        });
        await updateTextDescriptions(transaction, {
          boardExternalId,
          texts: delta.texts,
        });

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
    return await pool.oneOrNone(sql.getBoardByExternalId, {
      board_id: boardExternalId,
      firebase_id: firebaseId,
    });
  } catch (e) {
    error(`Error while updating board (${boardExternalId}) metadata.`);
    error(e);
    return false;
  }
};

export const markBoardVisit = async ({
  boardExternalId,
  firebaseId,
}: {
  boardExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.markBoardVisit, {
      firebase_id: firebaseId,
      board_id: boardExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while recording thread visit.`);
    error(e);
    return false;
  }
};

export const muteBoard = async ({
  boardExternalId,
  firebaseId,
}: {
  boardExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.muteBoardByExternalId, {
      firebase_id: firebaseId,
      board_id: boardExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while muting board.`);
    error(e);
    return false;
  }
};

export const unmuteBoard = async ({
  boardExternalId,
  firebaseId,
}: {
  boardExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unmuteBoardByExternalId, {
      firebase_id: firebaseId,
      board_id: boardExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting board.`);
    error(e);
    return false;
  }
};

export const pinBoard = async ({
  boardExternalId,
  firebaseId,
}: {
  boardExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.pinBoardByExternalId, {
      firebase_id: firebaseId,
      board_id: boardExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while pinning board.`);
    error(e);
    return false;
  }
};

export const unpinBoard = async ({
  boardExternalId,
  firebaseId,
}: {
  boardExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unpinBoardByExternalId, {
      firebase_id: firebaseId,
      board_id: boardExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while unpinning board.`);
    error(e);
    return false;
  }
};

export const dismissBoardNotifications = async ({
  boardExternalId,
  firebaseId,
}: {
  boardExternalId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.dismissNotificationsByExternalId, {
      firebase_id: firebaseId,
      board_id: boardExternalId,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting board.`);
    error(e);
    return false;
  }
};

export const createThread = async ({
  firebaseId,
  content,
  isLarge,
  anonymityType,
  boardExternalId,
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
  boardExternalId: string;
  whisperTags: string[];
  indexTags: string[];
  categoryTags: string[];
  contentWarnings: string[];
  identityId?: string;
  accessoryId?: string;
}) => {
  return pool.tx("create-thread", async (t) => {
    const newThreadExternalId = uuidv4();
    await t.one(threadsSql.createThread, {
      thread_external_id: newThreadExternalId,
      board_external_id: boardExternalId,
      thread_options: {
        default_view: defaultView,
      },
    });
    log(`Created thread entry for thread ${newThreadExternalId}`);

    await postNewContribution(
      {
        firebaseId,
        identityId,
        accessoryId,
        content,
        isLarge,
        anonymityType,
        whisperTags,
        indexTags,
        contentWarnings,
        categoryTags,
        threadExternalId: newThreadExternalId,
      },
      t
    );
    return newThreadExternalId;
  });
};
