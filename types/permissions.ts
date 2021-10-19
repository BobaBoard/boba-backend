export enum DbRolePermissions {
  all,
  edit_board_details,
  post_as_role,
  edit_category_tags,
  edit_content_notices,
  move_thread,
}

export interface UserBoardPermissions {
  board_permissions: BoardPermissions[];
  post_permissions: PostPermissions[];
  thread_permissions: ThreadPermissions[];
}

export enum ThreadPermissions {
  editDefaultView,
  moveThread = "move_thread",
}

export enum BoardPermissions {
  editMetadata = "edit_metadata",
}

export enum PostPermissions {
  editContent = "edit_content",
  editWhisperTags = "edit_whisper_tags",
  editCategoryTags = "edit_category_tags",
  editIndexTags = "edit_index_tags",
  editContentNotices = "edit_content_notices",
}
