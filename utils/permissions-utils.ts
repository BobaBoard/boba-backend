import {
  BoardPermissions,
  BoardRestrictions,
  DbRolePermissions,
  PostPermissions,
  RealmPermissions,
  ThreadPermissions,
  type UserBoardPermissions,
  extractBoardRestrictions,
  extractPermissions,
} from "types/permissions.js";

import { type BoardRestrictionsEnum } from "server/boards/sql/types.js";
import { type QueryTagsType } from "types/rest/params.js";
import debug from "debug";
import { getBoardByExternalId } from "server/boards/queries.js";

const info = debug("bobaserver:board:utils-info");

export const hasPermission = (
  permission: DbRolePermissions,
  permissions: string[] = []
) => {
  return permissions.some((p) => p == permission || p == DbRolePermissions.all);
};

export const canPostAs = (permissions?: string[]) => {
  return (
    hasPermission(DbRolePermissions.post_as_role, permissions) ||
    hasPermission(DbRolePermissions.all, permissions)
  );
};

export const extractPostPermissions = (permissions?: string[]) => {
  return extractPermissions(PostPermissions, permissions || []);
};

export const extractThreadPermissions = (permissions?: string[]) => {
  return extractPermissions(ThreadPermissions, permissions || []);
};

export const extractBoardPermissions = (permissions?: string[]) => {
  return extractPermissions(BoardPermissions, permissions || []);
};

export const extractRealmPermissions = (permissions?: string[]) => {
  return extractPermissions(RealmPermissions, permissions || []);
};

export const getUserPermissionsForBoard = (
  permissions?: string[]
): UserBoardPermissions => {
  info(`Transforming the following user permissions: ${permissions}`);
  return {
    board_permissions: extractBoardPermissions(permissions),
    post_permissions: extractPostPermissions(permissions),
    thread_permissions: extractThreadPermissions(permissions),
  };
};

export const canDoTagsEdit = (
  tagsDelta: { added: QueryTagsType; removed: QueryTagsType },
  permissions: PostPermissions[]
) => {
  if (permissions.length == 0) {
    return false;
  }

  const isEditingContentWarnings =
    tagsDelta.added.contentWarnings.length > 0 ||
    tagsDelta.removed.contentWarnings.length > 0;
  const isEditingIndexTags =
    tagsDelta.added.indexTags.length > 0 ||
    tagsDelta.removed.indexTags.length > 0;
  const isEditingCategoryTags =
    tagsDelta.added.categoryTags.length > 0 ||
    tagsDelta.removed.categoryTags.length > 0;
  const isEditingWhisperTags =
    tagsDelta.added.whisperTags.length > 0 ||
    tagsDelta.removed.whisperTags.length > 0;

  return !(
    (isEditingContentWarnings &&
      !permissions.includes(PostPermissions.editContentNotices)) ||
    (isEditingIndexTags &&
      !permissions.includes(PostPermissions.editIndexTags)) ||
    (isEditingCategoryTags &&
      !permissions.includes(PostPermissions.editCategoryTags)) ||
    (isEditingWhisperTags &&
      !permissions.includes(PostPermissions.editWhisperTags))
  );
};

export const getBoardRestrictions = ({
  loggedOutRestrictions,
  loggedInBaseRestrictions,
}: {
  loggedOutRestrictions: string[];
  loggedInBaseRestrictions: string[];
}) => {
  return {
    loggedOutRestrictions: extractBoardRestrictions(loggedOutRestrictions),
    loggedInBaseRestrictions: extractBoardRestrictions(
      loggedInBaseRestrictions
    ),
  };
};

export const canAccessBoardByExternalId = async ({
  boardExternalId,
  firebaseId,
}: {
  boardExternalId: string;
  firebaseId?: string;
}) => {
  const board = await getBoardByExternalId({
    firebaseId,
    boardExternalId,
  });
  info(`Found board`, board);

  if (!board) {
    return false;
  }
  if (board.logged_out_restrictions.includes(BoardRestrictions.LOCK_ACCESS)) {
    return !!firebaseId;
  }

  return hasBoardAccessPermission({ boardMetadata: board, firebaseId });
};

export const hasBoardAccessPermission = ({
  boardMetadata,
  firebaseId,
}: {
  boardMetadata: {
    logged_out_restrictions: BoardRestrictionsEnum[];
  };
  firebaseId: string | undefined;
}) => {
  if (
    boardMetadata.logged_out_restrictions.includes(
      BoardRestrictions.LOCK_ACCESS
    )
  ) {
    return !!firebaseId;
  }

  return true;
};
