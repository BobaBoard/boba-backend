import debug from "debug";
import { getBoardBySlug } from "server/boards/queries";

import {
  DbRolePermissions,
  PostPermissions,
  ThreadPermissions,
  BoardPermissions,
  UserBoardPermissions,
  extractPermissions,
} from "types/permissions";
import { QueryTagsType, restriction_types } from "Types";

const info = debug("bobaserver::permissions-utils-info");

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
  if (board.logged_out_restrictions.includes(restriction_types.LOCK_ACCESS)) {
    return !!firebaseId;
  }
  return true;
};
