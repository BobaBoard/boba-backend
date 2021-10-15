import {
  BoardDescription,
  DbBoardMetadata,
  restriction_types,
} from "../../Types";
import { CacheKeys, cache } from "../cache";
import {
  processBoardMetadata,
  processBoardsSummary,
} from "utils/response-utils";

import debug from "debug";
import { getBoardBySlug } from "./queries";

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
    const cachedBoard = await cache().hget(CacheKeys.BOARD_METADATA, slug);
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

  const boardSummary = processBoardsSummary({
    boards: [board],
    isLoggedIn: !!firebaseId,
  });
  const boardMetadata = processBoardMetadata({
    metadata: board,
    isLoggedIn: !!firebaseId,
  });
  const finalMetadata = {
    ...boardSummary[0],
    ...boardMetadata,
  };
  if (!firebaseId) {
    cache().hset(CacheKeys.BOARD_METADATA, slug, JSON.stringify(finalMetadata));
  }
  log(`Processed board metadata (${slug}) for user ${firebaseId}`);
  return finalMetadata;
};
