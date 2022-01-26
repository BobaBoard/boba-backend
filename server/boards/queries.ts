import { DbBoardMetadata } from "Types";
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
  realmId,
}: {
  firebaseId: string;
  realmId?: string;
}): Promise<any> => {
  try {
    return await pool.many(sql.getAllBoards, {
      firebase_id: firebaseId,
      realm_string_id: realmId,
    });
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

export const getBoardByUuid = async ({
  firebaseId,
  boardId,
}: {
  firebaseId: string | undefined;
  boardId: string;
}): Promise<DbBoardMetadata> => {
  try {
    const rows = await pool.oneOrNone(sql.getBoardByUuid, {
      firebase_id: firebaseId,
      board_uuid: boardId,
    });

    if (!rows) {
      log(`Board not found: ${boardId}`);
      return null;
    }

    info(`Got getBoardByUuid query result:`, rows);
    log(`Fetched board ${boardId} for user ${firebaseId}`);
    return rows;
  } catch (e) {
    error(`Error while fetching board by uuid (${boardId}).`);
    error(e);
    return null;
  }
};

const updateCategoriesDescriptions = async (
  tx: ITask<unknown>,
  {
    boardId,
    categoryFilters,
  }: {
    boardId: string;
    categoryFilters: ReturnType<typeof getMetadataDelta>["categoryFilters"];
  }
) => {
  // Delete all old category filters
  await Promise.all(
    categoryFilters.deleted.map(async (filter) => {
      await tx.none(sql.deleteSectionCategories, {
        section_id: filter.id,
        board_uuid: boardId,
        category_names: null,
      });
      await tx.none(sql.deleteSection, {
        section_id: filter.id,
        board_uuid: boardId,
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
          board_uuid: boardId,
          section_id: category.id,
        });
      } else {
        await tx.one(sql.createSection, {
          section_id: category.id,
          title: category.title,
          description: category.description,
          index: category.index,
          board_uuid: boardId,
          type: "category_filter",
        });
      }
      log("Created new category section (or updated old one).");
      if (category.categories.deleted.length > 0) {
        await tx.none(sql.deleteSectionCategories, {
          section_id: category.id,
          board_uuid: boardId,
          category_names: category.categories.deleted,
        });
        log("Removed obsolete categories from filter.");
      }
      if (category.categories.new.length > 0) {
        await tx.manyOrNone(
          postsSQL.createAddCategoriesQuery(category.categories.new)
        );
        await tx.manyOrNone(
          sql.createAddCategoriesToFilterSectionQuery(
            category.id,
            category.categories.new
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
    boardId,
    texts,
  }: {
    boardId: string;
    texts: ReturnType<typeof getMetadataDelta>["texts"];
  }
) => {
  // Delete all old texts
  await Promise.all(
    texts.deleted.map(async (text) => {
      await tx.none(sql.deleteSection, {
        section_id: text.id,
        board_uuid: boardId,
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
          board_uuid: boardId,
          section_id: text.id,
        });
      } else {
        await tx.one(sql.createSection, {
          section_id: text.id,
          title: text.title,
          description: text.description,
          index: text.index,
          board_uuid: boardId,
          type: "text",
        });
      }
    })
  );
  log("Added (and updated) text sections.");
};

export const updateBoardMetadata = async ({
  boardId,
  firebaseId,
  oldMetadata,
  newMetadata,
}: {
  boardId: string;
  firebaseId: string;
  oldMetadata: DbBoardMetadata;
  newMetadata: Partial<DbBoardMetadata>;
}): Promise<any> => {
  try {
    const delta = getMetadataDelta({
      oldMetadata,
      newMetadata,
    });

    log(`Received metadata delta for update to board ${boardId}`);
    info(delta);

    const success = await pool
      .tx("update-descriptions", async (transaction) => {
        if (delta.tagline || delta.accentColor) {
          await transaction.none(sql.updateBoardSettings, {
            board_uuid: boardId,
            tagline: delta.tagline || oldMetadata.tagline,
            settings: {
              accentColor:
                delta.accentColor || oldMetadata.settings?.accentColor,
            },
          });
        }

        await updateCategoriesDescriptions(transaction, {
          boardId,
          categoryFilters: delta.categoryFilters,
        });
        await updateTextDescriptions(transaction, {
          boardId,
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
    return await pool.oneOrNone(sql.getBoardByUuid, {
      board_uuid: boardId,
      firebase_id: firebaseId,
    });
  } catch (e) {
    error(`Error while updating board (${boardId}) metadata.`);
    error(e);
    return false;
  }
};

export const markBoardVisit = async ({
  boardId,
  firebaseId,
}: {
  boardId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.markBoardVisit, {
      firebase_id: firebaseId,
      board_uuid: boardId,
    });
    return true;
  } catch (e) {
    error(`Error while recording thread visit.`);
    error(e);
    return false;
  }
};

export const muteBoard = async ({
  boardId,
  firebaseId,
}: {
  boardId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.muteBoardByUuid, {
      firebase_id: firebaseId,
      board_uuid: boardId,
    });
    return true;
  } catch (e) {
    error(`Error while muting board.`);
    error(e);
    return false;
  }
};

export const unmuteBoard = async ({
  boardId,
  firebaseId,
}: {
  boardId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unmuteBoardByUuid, {
      firebase_id: firebaseId,
      board_uuid: boardId,
    });
    return true;
  } catch (e) {
    error(`Error while unmuting board.`);
    error(e);
    return false;
  }
};

export const pinBoard = async ({
  boardId,
  firebaseId,
}: {
  boardId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.pinBoardByUuid, {
      firebase_id: firebaseId,
      board_uuid: boardId,
    });
    return true;
  } catch (e) {
    error(`Error while pinning board.`);
    error(e);
    return false;
  }
};

export const unpinBoard = async ({
  boardId,
  firebaseId,
}: {
  boardId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.unpinBoardByUuid, {
      firebase_id: firebaseId,
      board_uuid: boardId,
    });
    return true;
  } catch (e) {
    error(`Error while unpinning board.`);
    error(e);
    return false;
  }
};

export const dismissBoardNotifications = async ({
  boardId,
  firebaseId,
}: {
  boardId: string;
  firebaseId: string;
}) => {
  try {
    await pool.none(sql.dismissNotificationsByUuid, {
      firebase_id: firebaseId,
      board_uuid: boardId,
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
  boardStringId,
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
  boardStringId: string;
  whisperTags: string[];
  indexTags: string[];
  categoryTags: string[];
  contentWarnings: string[];
  identityId?: string;
  accessoryId?: string;
}) => {
  return pool.tx("create-thread", async (t) => {
    const threadStringId = uuidv4();
    await t.one(threadsSql.createThread, {
      thread_string_id: threadStringId,
      board_string_id: boardStringId,
      thread_options: {
        default_view: defaultView,
      },
    });
    log(`Created thread entry for thread ${threadStringId}`);

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
        threadId: threadStringId,
      },
      t
    );
    return threadStringId;
  });
};
