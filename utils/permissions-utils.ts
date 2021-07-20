import debug from "debug";

import {
  DbRolePermissions,
  BoardPermissions,
  QueryTagsType,
  PostPermissions,
  ThreadPermissions,
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

export const canEditBoard = (permissions?: string[]) => {
  return permissions.some(
    (p) =>
      (<any>DbRolePermissions)[p] ==
        DbRolePermissions.edit_board_details.toString() ||
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

export const transformPermissions = (
  permissions?: string[]
): BoardPermissions => {
  log(`Transforming the following user permissions: ${permissions}`);

  return {
    canEditBoardData: canEditBoard(permissions),
    postsPermissions: transformPostPermissions(permissions),
    threadsPermissions: transformThreadPermissions(permissions),
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
