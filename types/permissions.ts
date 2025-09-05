/**
 * This enum should be exactly the same as the role_permissions type declared
 * in `db/init/020_roles_and_permissions.sql`.
 *
 * Keep them in sync.
 *
 * TODO: at some point rename both to "Permissions".
 **/
export enum DbRolePermissions {
  all = "all",
  edit_board_details = "edit_board_details",
  delete_board = "delete_board",
  post_as_role = "post_as_role",
  edit_category_tags = "edit_category_tags",
  edit_content_notices = "edit_content_notices",
  move_thread = "move_thread",
  edit_content = "edit_content",
  edit_whisper_tags = "edit_whisper_tags",
  edit_index_tags = "edit_index_tags",
  edit_default_view = "edit_default_view",
  create_realm_invite = "create_realm_invite",
  post_on_realm = "post_on_realm",
  comment_on_realm = "comment_on_realm",
  create_thread_on_realm = "create_thread_on_realm",
  access_locked_boards_on_realm = "access_locked_boards_on_realm",
  view_roles_on_realm = "view_roles_on_realm",
  view_roles_on_board = "view_roles_on_board",
  create_board_on_realm = "create_board_on_realm"
}

export interface UserBoardPermissions {
  board_permissions: BoardPermissions[];
  post_permissions: PostPermissions[];
  thread_permissions: ThreadPermissions[];
}

export enum ThreadPermissions {
  editDefaultView = DbRolePermissions["edit_default_view"],
  moveThread = DbRolePermissions["move_thread"],
}

export enum BoardPermissions {
  editMetadata = DbRolePermissions["edit_board_details"],
  deleteBoard = DbRolePermissions["delete_board"],
  viewRolesOnBoard = DbRolePermissions["view_roles_on_board"],
}

export enum RealmPermissions {
  createRealmInvite = DbRolePermissions["create_realm_invite"],
  postOnRealm = DbRolePermissions["post_on_realm"],
  commentOnRealm = DbRolePermissions["comment_on_realm"],
  createThreadOnRealm = DbRolePermissions["create_thread_on_realm"],
  accessLockedBoardsOnRealm = DbRolePermissions[
    "access_locked_boards_on_realm"
  ],
  viewRolesOnRealm = DbRolePermissions["view_roles_on_realm"],
  createBoard = DbRolePermissions["create_board_on_realm"],
}

export enum PostPermissions {
  editContent = DbRolePermissions["edit_content"],
  editWhisperTags = DbRolePermissions["edit_whisper_tags"],
  editCategoryTags = DbRolePermissions["edit_category_tags"],
  editIndexTags = DbRolePermissions["edit_index_tags"],
  editContentNotices = DbRolePermissions["edit_content_notices"],
}

export const extractPermissions = <T extends {}>(
  targetEnum: T,
  permissions: string[]
): T[keyof T][] => {
  const extractedPermissions = [] as T[keyof T][];
  permissions.forEach((permission) => {
    // Check in the target enum for the key that has the permission
    // string as the value.
    const foundPermission = Object.entries(targetEnum).find(
      ([_, value]) => value === permission
    );
    if (foundPermission) {
      extractedPermissions.push(foundPermission[1] as T[keyof T]);
    }
  });
  return extractedPermissions;
};

/**
 * The set of post permissions associated with every post owner.
 */
export const POST_OWNER_PERMISSIONS = [
  PostPermissions.editCategoryTags,
  PostPermissions.editContentNotices,
  PostPermissions.editIndexTags,
  PostPermissions.editWhisperTags,
];

/**
 * The set of thread permissions associated with every thread owner.
 */
export const THREAD_OWNER_PERMISSIONS = [ThreadPermissions.editDefaultView];

/**
 * The set of realm permissions associated with every realm member.
 */
export const REALM_MEMBER_PERMISSIONS = [
  RealmPermissions.accessLockedBoardsOnRealm,
  RealmPermissions.commentOnRealm,
  RealmPermissions.postOnRealm,
  RealmPermissions.createThreadOnRealm,
];

export enum BoardRestrictions {
  LOCK_ACCESS = "lock_access",
  DELIST = "delist",
}

export const extractBoardRestrictions = (restrictions: string[]) => {
  const extractedRestrictions = [] as BoardRestrictions[];
  restrictions.forEach((restriction) => {
    // Check in the target enum for the key that has the permission
    // string as the value.
    const foundRestriction = Object.entries(BoardRestrictions).find(
      ([_, value]) => value === restriction
    );
    if (foundRestriction) {
      extractedRestrictions.push(foundRestriction[1]);
    }
  });
  return extractedRestrictions;
};
