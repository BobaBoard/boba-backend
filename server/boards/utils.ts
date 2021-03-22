import { BoardDescription, DbBoardMetadata } from "../../Types";
import { cache, CacheKeys } from "../cache";
import { getBoardBySlug } from "./queries";
import debug from "debug";
import { processBoardMetadata } from "../response-utils";
const info = debug("bobaserver:board:utils-info");
const log = debug("bobaserver:board:utils-log");

/**
 * Returns a delta between the old metadata of a Board and the new one.
 */
export const getMetadataDelta = ({
  oldMetadata,
  newMetadata,
}: {
  oldMetadata: Partial<DbBoardMetadata>;
  newMetadata: Partial<DbBoardMetadata>;
}): {
  tagline?: string;
  accentColor?: string;
  texts: {
    deleted: { id: string }[];
    newAndUpdated: BoardDescription[];
  };
  categoryFilters: {
    deleted: { id: string }[];
    newAndUpdated: {
      id: string;
      index: number;
      title: string;
      type: "text" | "category_filter";
      description?: string;
      categories: {
        deleted: string[];
        new: string[];
      };
    }[];
  };
} => {
  const oldTexts =
    oldMetadata.descriptions?.filter((desc) => desc.type == "text") || [];
  const oldCategoryFilters =
    oldMetadata.descriptions?.filter(
      (desc) => desc.type == "category_filter"
    ) || [];
  const newTexts = newMetadata.descriptions.filter(
    (desc) => desc.type == "text"
  );
  const newCategoryFilters = newMetadata.descriptions.filter(
    (desc) => desc.type == "category_filter"
  );

  // Deleted texts will be in oldTexts but not newTexts
  const deletedTexts = oldTexts.filter(
    (oldText) => !newTexts.some((newText) => newText.id == oldText.id)
  );
  // There's no special handling needed for new and updated texts.
  const newAndUpdatedTexts = newTexts;

  // Deleted filters will be in oldCategoryFilters but not newCategoryFilters
  const deletedFilters = oldCategoryFilters.filter(
    (oldFilter) =>
      !newCategoryFilters.some((newFilter) => newFilter.id == oldFilter.id)
  );

  const newAndUpdatedFilters = newCategoryFilters.map((newFilter) => {
    const oldFilter = oldCategoryFilters.find(
      (oldFilter) => oldFilter.id == newFilter.id
    );

    // Deleted categories will be in oldFilter's but not newFilter's.
    // If there's no oldFilter, by definition nothing will have been deleted.
    const deletedCategories = oldFilter
      ? oldFilter.categories.filter(
          (oldCategory) =>
            !newFilter.categories.some(
              (newCategory) =>
                oldCategory.toLowerCase() == newCategory.toLowerCase()
            )
        )
      : [];

    // New categories will be in newFilter's but not oldFilter's.
    // If there's no oldFilter, by definition everything will be new
    const newCategories = oldFilter
      ? newFilter.categories.filter(
          (newCategory) =>
            !oldFilter.categories.some(
              (oldCategory) =>
                oldCategory.toLowerCase() == newCategory.toLowerCase()
            )
        )
      : newFilter.categories;

    return {
      ...newFilter,
      categories: {
        deleted: deletedCategories,
        new: newCategories,
      },
    };
  });

  return {
    accentColor:
      oldMetadata.settings.accentColor != newMetadata.settings.accentColor
        ? newMetadata.settings.accentColor
        : undefined,
    tagline:
      oldMetadata.tagline != newMetadata.tagline
        ? newMetadata.tagline
        : undefined,
    texts: {
      deleted: deletedTexts.map((text) => ({ id: text.id })),
      newAndUpdated: newAndUpdatedTexts,
    },
    categoryFilters: {
      deleted: deletedFilters.map((filter) => ({ id: filter.id })),
      // TODO: type this correctly
      // @ts-ignore
      newAndUpdated: newAndUpdatedFilters,
    },
  };
};

export const getBoardMetadata = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId?: string;
}) => {
  if (!firebaseId) {
    const cachedBoard = await cache().hget(CacheKeys.BOARD, slug);
    if (cachedBoard) {
      log(`Found cached metadata for board ${slug}`);
      return JSON.parse(cachedBoard);
    }
  }

  const board = await getBoardBySlug({
    firebaseId,
    slug,
  });
  info(`Found board`, board);

  if (!board) {
    return;
  }

  const boardMetadata = processBoardMetadata({
    metadata: board,
    isLoggedIn: !!firebaseId,
  });
  if (!firebaseId) {
    cache().hset(CacheKeys.BOARD, slug, JSON.stringify(boardMetadata));
  }
  log(`Processed board metadata (${slug}) for user ${firebaseId}`);
  return boardMetadata;
};

export const canAccessBoard = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId?: string;
}) => {
  // We use the logged out one because it hits cache.
  const boardMetadata = await getBoardMetadata({ slug });
  info(boardMetadata);
  if (boardMetadata.loggedInOnly) {
    return !!firebaseId;
  }
  return true;
};
