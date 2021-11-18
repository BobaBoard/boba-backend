import debug from "debug";
import { getBoardBySlug, getBoardByUuid } from "server/boards/queries";

import {
  DbRolePermissions,
  PostPermissions,
  ThreadPermissions,
  BoardPermissions,
  UserBoardPermissions,
  extractPermissions,
  BoardRestrictions,
  extractBoardRestrictions,
} from "types/permissions";
import { DbBoardMetadata, QueryTagsType } from "Types";

const info = debug("bobaserver:board:utils-info");
const log = debug("bobaserver::permissions-utils-log");

export const hasPermission = (
  permission: DbRolePermissions,
  permissions?: string[]
) => {
  return permissions.some((p) => p == permission || p == DbRolePermissions.all);
};

export const canPostAs = (permissions?: string[]) => {
  return permissions.some(
    (p) =>
      (<any>Permissions)[p] == DbRolePermissions.post_as_role.toString() ||
      (<any>Permissions)[p] == DbRolePermissions.all.toString()
  );
};

export const extractPostPermissions = (permissions?: string[]) => {
  return extractPermissions(PostPermissions, permissions);
};

export const extractThreadPermissions = (permissions?: string[]) => {
  return extractPermissions(ThreadPermissions, permissions);
};

export const extractBoardPermissions = (permissions?: string[]) => {
  return extractPermissions(BoardPermissions, permissions);
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

export const canAccessBoard = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId?: string;
}) => {
  const board = await getBoardBySlug({
    firebaseId,
    slug,
  });

  if (!board) {
    return false;
  }
  if (board.logged_out_restrictions.includes(BoardRestrictions.LOCK_ACCESS)) {
    return !!firebaseId;
  }

  return hasBoardAccessPermission({ boardMetadata: board, firebaseId });
};

export const canAccessBoardByUuid = async ({
  boardId,
  firebaseId,
}: {
  boardId: string;
  firebaseId?: string;
}) => {
  const board = await getBoardByUuid({
    firebaseId,
    boardId,
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
  boardMetadata: DbBoardMetadata;
  firebaseId: string;
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
