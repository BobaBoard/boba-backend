import debug from "debug";

import { DbRolePermissions, BoardPermissions } from "../Types";

const log = debug("bobaserver::permissions-utils-log");

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

export const transformPermissions = (
  permissions?: string[]
): BoardPermissions => {
  log(`Transforming the following user permissions: ${permissions}`);

  return {
    canEditBoardData: canEditBoard(permissions),
  };
};
