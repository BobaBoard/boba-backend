export interface UserIdentityType {
  name: string;
  // TODO[realms]: make this avatar_url
  avatar: string;
}

export interface SecretIdentityType {
  name: string;
  // TODO[realms]: make this avatar_url
  avatar: string;
  color?: string;
  accessory?: string;
}

export interface ServerCommentType {
  id: string;
  parent_comment_id: string;
  parent_post_id: string;
  created_at: string;
  content: string;
  secret_identity: SecretIdentityType;
  user_identity?: UserIdentityType;
  accessory_avatar?: string;
  chain_parent_id: string | null;
  own: boolean;
  friend: boolean;
  new: boolean;
}

export interface ServerPostType {
  id: string;
  parent_thread_id: string;
  parent_post_id: string;
  secret_identity: SecretIdentityType;
  user_identity?: UserIdentityType;
  accessory_avatar?: string;
  created_at: string;
  own: boolean;
  friend: boolean;
  new: boolean;
  content: string;
  tags?: {
    index_tags: string[];
    whisper_tags: string[];
    category_tags: string[];
    content_warnings: string[];
  };
  comments?: ServerCommentType[];
  total_comments_amount: number;
  new_comments_amount: number;
}

export interface ServerThreadSummaryType {
  starter: ServerPostType;
  id: string;
  parent_board_slug: string;
  direct_threads_amount: number;
  new_posts_amount: number;
  new_comments_amount: number;
  total_comments_amount: number;
  total_posts_amount: number;
  last_activity_at: string;
  muted: boolean;
  default_view: "thread" | "gallery" | "timeline";
  hidden: boolean;
  new: boolean;
}

export interface ServerThreadType extends ServerThreadSummaryType {
  posts: ServerPostType[];
  comments: Record<string, ServerCommentType[]>;
}

export interface ServerFeedType {
  cursor: {
    next: string | null;
  };
  activity: ServerThreadSummaryType[];
}

export interface DbIdentityType {
  id: string;
  username: string;
  user_avatar_reference_id: string;
  display_name: string;
  secret_identity_avatar_reference_id: string;
  friend: boolean;
  self: boolean;
}

export interface DbPostType {
  post_id: string;
  parent_thread_id: string;
  parent_post_id: string;
  parent_board_slug: string;
  author: number;
  username: string;
  user_avatar: string;
  secret_identity_name: string;
  secret_identity_avatar: string;
  secret_identity_color?: string;
  accessory_avatar?: string;
  self: boolean;
  friend: boolean;
  created: string;
  content: string;
  options: {
    wide?: boolean;
  };
  type: string;
  index_tags: string[];
  category_tags: string[];
  content_warnings: string[];
  whisper_tags: string[];
  anonymity_type: "everyone" | "strangers";
  total_comments_amount: number;
  new_comments_amount: number;
  comments: DbCommentType[] | null;
  is_own: boolean;
  is_new: boolean;
}
export interface DbCommentType {
  comment_id: string;
  parent_post: string;
  parent_comment: string;
  chain_parent_id: string | null;
  author: number;
  username: string;
  user_avatar: string;
  secret_identity_name: string;
  secret_identity_avatar: string;
  secret_identity_color: string | null;
  accessory_avatar?: string;
  content: string;
  created: string;
  anonymity_type: "everyone" | "strangers";
  self: boolean;
  friend: boolean;
  is_new: boolean;
  is_own: boolean;
}

export interface DbThreadType {
  thread_id: string;
  board_slug: string;
  thread_last_activity: string;
  posts: DbPostType[];
  default_view: "thread" | "gallery" | "timeline";
  thread_new_comments_amount: number;
  thread_total_comments_amount: number;
  thread_direct_threads_amount: number;
  thread_new_posts_amount: number;
  thread_total_posts_amount: number;
  muted: boolean;
  hidden: boolean;
}

// TODO[realms]: deprecate this
export interface DbActivityThreadType {
  post_id: string;
  parent_post_id: null;
  thread_id: string;
  board_slug: string;
  author: number;
  username: string;
  user_avatar: string;
  secret_identity_name: string;
  secret_identity_avatar: string;
  accessory_avatar?: string;
  created: string;
  content: string;
  index_tags: string[];
  whisper_tags: string[];
  category_tags: string[];
  content_warnings: string[];
  muted: boolean;
  hidden: boolean;
  options: {
    wide?: boolean;
  };
  posts_amount: number;
  threads_amount: number;
  friend: boolean;
  self: boolean;
  new_posts_amount: number;
  new_comments_amount: number;
  is_new: boolean;
  comments_amount: number;
  thread_last_activity: string;
  default_view: "thread" | "gallery" | "timeline";
}

export interface DbThreadSummaryType
  extends Omit<DbThreadType, "posts">,
    Omit<
      DbPostType,
      "total_comments_amount" | "new_comments_amount" | "comments"
    > {
  thread_last_activity_at_micro: string | null;
}

export interface DbFeedType {
  cursor: string | null;
  activity: DbThreadSummaryType[];
}

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

export interface BoardDescription {
  id?: string;
  index: number;
  title: string;
  type: "text" | "category_filter";
  description?: string;
  categories?: string[];
}

export enum restriction_types {
  LOCK_ACCESS = "lock_access",
  DELIST = "delist",
}

export interface DbBoardMetadata {
  slug: string;
  string_id: string;
  avatar_url: string;
  tagline: string;
  settings: {
    accentColor: string;
  };
  descriptions: BoardDescription[];
  posting_identities: {
    id: string;
    avatar_reference_id: string;
    color: string | undefined;
    accessory: string | undefined;
    name: string;
  }[];
  accessories: {
    id: string;
    name: string;
    accessory: string;
  }[];
  permissions: string[];
  logged_out_restrictions: restriction_types[];
  logged_in_base_restrictions: restriction_types[];
}

export interface QueryTagsType {
  whisperTags: string[];
  indexTags: string[];
  categoryTags: string[];
  contentWarnings: string[];
}
