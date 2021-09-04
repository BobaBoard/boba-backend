import debug from "debug";
import { getBoardBySlug } from "../server/boards/queries";

import {
  DbRolePermissions,
  QueryTagsType,
  PostPermissions,
  ThreadPermissions,
  BoardPermissions,
  UserBoardPermissions,
  restriction_types,
} from "../Types";

const log = debug("bobaserver::permissions-utils-log");

export const hasPermission = (
  permission: DbRolePermissions,
  permissions?: string[]
) => {
  return permissions.some(
    (p) =>
      (<any>DbRolePermissions)[p] == permission.toString() ||
      (<any>DbRolePermissions)[p] == DbRolePermissions.all.toString()
  );
};

export const canPostAs = (permissions?: string[]) => {
  return permissions.some(
    (p) =>
      (<any>DbRolePermissions)[p] ==
        DbRolePermissions.post_as_role.toString() ||
      (<any>DbRolePermissions)[p] == DbRolePermissions.all.toString()
  );
};

export const transformPostPermissions = (permissions?: string[]) => {
  const postsPermissions = [];
  if (hasPermission(DbRolePermissions.edit_category_tags, permissions)) {
    postsPermissions.push(PostPermissions.editCategoryTags);
  }
  if (hasPermission(DbRolePermissions.edit_content_notices, permissions)) {
    postsPermissions.push(PostPermissions.editContentNotices);
  }
  return postsPermissions;
};

export const transformThreadPermissions = (permissions?: string[]) => {
  const threadPermissions = [];
  if (hasPermission(DbRolePermissions.move_thread, permissions)) {
    threadPermissions.push(ThreadPermissions.moveThread);
  }
  return threadPermissions;
};

export const transformBoardPermissions = (permissions?: string[]) => {
  const boardPermissions = [];
  if (hasPermission(DbRolePermissions.edit_board_details, permissions)) {
    boardPermissions.push(BoardPermissions.editMetadata);
  }
  return boardPermissions;
};

export const transformPermissions = (
  permissions?: string[]
): UserBoardPermissions => {
  log(`Transforming the following user permissions: ${permissions}`);

  return {
    board_permissions: transformBoardPermissions(permissions),
    post_permissions: transformPostPermissions(permissions),
    thread_permissions: transformThreadPermissions(permissions),
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
