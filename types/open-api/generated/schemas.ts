import { z } from "zod";

const BoardSummary = z.object({
  id: z.string().uuid(),
  realm_id: z.string(),
  slug: z.string(),
  avatar_url: z.string(),
  tagline: z.string(),
  accent_color: z.string(),
  logged_in_only: z.boolean(),
  delisted: z.boolean(),
});
const BaseDescription = z.object({
  id: z.string().uuid(),
  index: z.number(),
  title: z.string(),
});
const TextDescription = BaseDescription.and(
  z.object({ type: z.enum(["text"]), description: z.string() })
);
const CategoryFilterDescription = BaseDescription.and(
  z.object({
    type: z.enum(["category_filter"]),
    categories: z.array(z.string()),
  })
);
const Description = z.union([TextDescription, CategoryFilterDescription]);
const BoardMetadata = BoardSummary.and(
  z.object({ descriptions: z.array(Description) })
);
const LoggedInBoardSummary = BoardSummary.and(
  z.object({ muted: z.boolean(), pinned: z.boolean() })
);
const Accessory = z.object({
  id: z.string().uuid(),
  name: z.string(),
  accessory: z.string(),
});
const BoardPermissions = z.array(
  z.enum(["edit_board_details", "view_roles_on_board"])
);
const PostPermissions = z.array(
  z.enum([
    "edit_content",
    "edit_whisper_tags",
    "edit_category_tags",
    "edit_index_tags",
    "edit_content_notices",
  ])
);
const ThreadPermission = z.array(z.enum(["move_thread"]));
const Permissions = z.object({
  board_permissions: BoardPermissions,
  post_permissions: PostPermissions,
  thread_permissions: ThreadPermission,
});
const PostingIdentity = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar_url: z.string().optional(),
  color: z.union([z.string(), z.null()]).optional(),
  accessory: z.union([z.string(), z.null()]).optional(),
});
const LoggedInBoardMetadata = LoggedInBoardSummary.and(BoardMetadata).and(
  z.object({
    accessories: z.array(Accessory),
    permissions: Permissions,
    posting_identities: z.array(PostingIdentity),
  })
);
const CreateThread = z.object({
  content: z.string(),
  forceAnonymous: z.union([z.boolean(), z.null()]).optional(),
  defaultView: z.enum(["thread", "gallery", "timeline"]).optional(),
  identityId: z.string().uuid().optional(),
  accessoryId: z.string().uuid().optional(),
  whisper_tags: z.array(z.string()).optional(),
  index_tags: z.array(z.string()).optional(),
  content_warnings: z.array(z.string()).optional(),
  category_tags: z.array(z.string()).optional(),
});
const SecretIdentity = z.object({
  name: z.string(),
  avatar: z.string(),
  color: z.union([z.string(), z.null()]).optional(),
  accessory: z.union([z.string(), z.null()]).optional(),
});
const Identity = z.object({ name: z.string(), avatar: z.string() });
const Tags = z.object({
  whisper_tags: z.array(z.string()),
  index_tags: z.array(z.string()),
  category_tags: z.array(z.string()),
  content_warnings: z.array(z.string()),
});
const Contribution = z.object({
  id: z.string().uuid(),
  parent_thread_id: z.string().uuid(),
  parent_post_id: z.union([z.string(), z.null()]),
  content: z.string(),
  created_at: z.string(),
  secret_identity: SecretIdentity,
  user_identity: z.union([Identity, z.null()]),
  new: z.boolean(),
  own: z.boolean(),
  friend: z.boolean(),
  total_comments_amount: z.number(),
  new_comments_amount: z.number(),
  tags: Tags,
});
const Comment = z.object({
  id: z.string().uuid(),
  parent_post_id: z.string().uuid(),
  parent_comment_id: z.union([z.string(), z.null()]),
  chain_parent_id: z.union([z.string(), z.null()]),
  content: z.string(),
  secret_identity: SecretIdentity,
  user_identity: z.union([Identity, z.null()]),
  created_at: z.string(),
  own: z.boolean(),
  new: z.boolean(),
  friend: z.boolean(),
});
const ThreadActivitySummary = z.object({
  new_posts_amount: z.number(),
  new_comments_amount: z.number(),
  total_comments_amount: z.number(),
  total_posts_amount: z.number(),
  direct_threads_amount: z.number(),
  last_activity_at: z.string(),
});
const ThreadSummary = z
  .object({
    id: z.string().uuid(),
    parent_board_slug: z.string(),
    parent_board_id: z.string(),
    parent_realm_slug: z.string(),
    parent_realm_id: z.string(),
    starter: Contribution,
    default_view: z.enum(["thread", "gallery", "timeline"]),
    new: z.boolean(),
    muted: z.boolean(),
    hidden: z.boolean(),
    starred: z.boolean(),
  })
  .and(ThreadActivitySummary);
const Thread = z
  .object({
    posts: z.array(Contribution),
    comments: z.record(z.array(Comment)),
  })
  .and(ThreadSummary);
const BoardDescription = z
  .object({
    descriptions: z.array(Description),
    accentColor: z.string(),
    tagline: z.string(),
  })
  .partial();
const RealmRoles = z
  .object({
    roles: z.array(
      z.object({
        user_id: z.string().uuid().optional(),
        username: z.string(),
        role_string_id: z.string().uuid(),
        role_name: z.string(),
        label: z.string(),
      })
    ),
  })
  .partial();
const genericResponse = z.object({ message: z.string() }).partial();
const Cursor = z.object({
  next: z.union([
    z.union([z.string(), z.null()]),
    z.array(z.union([z.string(), z.null()])),
  ]),
});
const FeedActivity = z
  .object({ cursor: Cursor, activity: z.array(ThreadSummary) })
  .partial();
const IdentityParams = z
  .object({
    accessory_id: z.union([z.string(), z.null()]),
    identity_id: z.union([z.string(), z.null()]),
    forceAnonymous: z.union([z.boolean(), z.null()]),
  })
  .partial();
const postContribution_Body = z
  .object({ content: z.string() })
  .partial()
  .and(Tags)
  .and(IdentityParams);
const CommentRequestBody = z.object({ contents: z.array(z.string()) });
const postComment_Body = CommentRequestBody.and(IdentityParams);
const BaseBlock = z.object({
  id: z.string().uuid(),
  index: z.number(),
  title: z.string(),
});
const TextBlock = BaseBlock.and(
  z.object({ type: z.enum(["text"]), description: z.string() })
);
const RulesBlock = BaseBlock.and(
  z.object({
    type: z.enum(["rules"]),
    rules: z.array(
      z.object({
        index: z.number(),
        title: z.string(),
        description: z.string(),
        pinned: z.boolean(),
      })
    ),
  })
);
const SubscriptionBlock = BaseBlock.and(
  z.object({
    type: z.enum(["subscription"]),
    subscription_id: z.string().uuid(),
  })
);
const UiBlock = z.union([TextBlock, RulesBlock, SubscriptionBlock]);
const BooleanSetting = z.object({
  name: z.string(),
  type: z.enum(["BOOLEAN"]),
  value: z.boolean(),
});
const Setting = BooleanSetting;
const RealmSettings = z.object({
  root: z.object({ cursor: z.object({}).partial() }).partial(),
  index_page: z.array(Setting),
  board_page: z.array(Setting),
  thread_page: z.array(Setting),
});
const RealmPermissions = z.array(
  z.enum([
    "create_realm_invite",
    "post_on_realm",
    "comment_on_realm",
    "create_thread_on_realm",
    "access_locked_boards_on_realm",
    "view_roles_on_realm",
  ])
);
const Realm = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  icon: z.string().url(),
  homepage: z.object({ blocks: z.array(UiBlock) }),
  settings: RealmSettings,
  realm_permissions: RealmPermissions,
  boards: z.array(BoardSummary),
});
const BoardActivitySummary = z.object({
  last_post_at: z.union([z.string(), z.null()]),
  last_comment_at: z.union([z.string(), z.null()]),
  last_activity_at: z.union([z.string(), z.null()]),
  last_activity_from_others_at: z.union([z.string(), z.null()]),
  last_visit_at: z.union([z.string(), z.null()]),
});
const RealmActivity = z
  .object({
    id: z.string().uuid(),
    boards: z.record(
      z.object({ id: z.string().uuid() }).partial().and(BoardActivitySummary)
    ),
  })
  .partial();
const ActivityNotifications = z.object({
  id: z.string().uuid(),
  has_updates: z.boolean(),
  is_outdated: z.boolean(),
  last_activity_at: z.union([z.string(), z.null()]),
  last_activity_from_others_at: z.union([z.string(), z.null()]),
  last_visited_at: z.union([z.string(), z.null()]),
});
const NotificationsResponse = z.object({
  has_notifications: z.boolean(),
  is_outdated_notifications: z.boolean(),
  realm_id: z.string(),
  realm_boards: z.record(ActivityNotifications),
  pinned_boards: z.record(ActivityNotifications),
});
const InviteWithDetails = z.object({
  realm_id: z.string().uuid(),
  invite_url: z.string(),
  invitee_email: z.string().email().optional(),
  own: z.boolean(),
  issued_at: z.string(),
  expires_at: z.string(),
  label: z.string().optional(),
});
const createInviteByRealmId_Body = z
  .object({ email: z.string().email(), label: z.string() })
  .partial();
const Invite = z.object({
  realm_id: z.string().uuid(),
  invite_url: z.string(),
});
const InviteStatus = z.object({
  realm_id: z.string().uuid(),
  realm_slug: z.string(),
  invite_status: z.enum(["pending", "used", "expired"]),
  requires_email: z.boolean(),
});
const acceptInviteByNonce_Body = z.object({
  email: z.string().email(),
  password: z.string(),
});
const AcceptedInviteResponse = z.object({
  realm_id: z.string().uuid(),
  realm_slug: z.string(),
});
const Subscription = z.object({
  id: z.string().uuid(),
  name: z.string(),
  last_activity_at: z.union([z.string(), z.null()]),
});
const SubscriptionActivity = z.object({
  cursor: Cursor.optional(),
  subscription: Subscription,
  activity: z.array(Contribution),
});
const updateThreadExternalId_Body = z
  .object({
    defaultView: z.enum(["thread", "gallery", "timeline"]),
    parentBoardId: z.string().uuid(),
  })
  .partial();
const updateCurrentUser_Body = z.object({
  username: z.string(),
  avatarUrl: z.string().url(),
});
const BobaDexSeason = z.object({
  id: z.string().uuid(),
  realm_id: z.string(),
  name: z.string(),
  identities_count: z.number(),
  caught_identities: z.array(
    z.object({ index: z.number(), identity: PostingIdentity })
  ),
});
const BobaDex = z.object({ seasons: z.array(BobaDexSeason) });
const UserSettings = z.object({ decorations: z.array(Setting) }).partial();
const updateUserSettings_Body = z.object({
  name: z.string(),
  value: z.union([z.string(), z.boolean()]),
});

export const BoardSummarySchema = BoardSummary;
export const BaseDescriptionSchema = BaseDescription;
export const TextDescriptionSchema = TextDescription;
export const CategoryFilterDescriptionSchema = CategoryFilterDescription;
export const DescriptionSchema = Description;
export const BoardMetadataSchema = BoardMetadata;
export const LoggedInBoardSummarySchema = LoggedInBoardSummary;
export const AccessorySchema = Accessory;
export const BoardPermissionsSchema = BoardPermissions;
export const PostPermissionsSchema = PostPermissions;
export const ThreadPermissionSchema = ThreadPermission;
export const PermissionsSchema = Permissions;
export const PostingIdentitySchema = PostingIdentity;
export const LoggedInBoardMetadataSchema = LoggedInBoardMetadata;
export const CreateThreadSchema = CreateThread;
export const SecretIdentitySchema = SecretIdentity;
export const IdentitySchema = Identity;
export const TagsSchema = Tags;
export const ContributionSchema = Contribution;
export const CommentSchema = Comment;
export const ThreadActivitySummarySchema = ThreadActivitySummary;
export const ThreadSummarySchema = ThreadSummary;
export const ThreadSchema = Thread;
export const BoardDescriptionSchema = BoardDescription;
export const RealmRolesSchema = RealmRoles;
export const genericResponseSchema = genericResponse;
export const CursorSchema = Cursor;
export const FeedActivitySchema = FeedActivity;
export const IdentityParamsSchema = IdentityParams;
export const postContribution_BodySchema = postContribution_Body;
export const CommentRequestBodySchema = CommentRequestBody;
export const postComment_BodySchema = postComment_Body;
export const BaseBlockSchema = BaseBlock;
export const TextBlockSchema = TextBlock;
export const RulesBlockSchema = RulesBlock;
export const SubscriptionBlockSchema = SubscriptionBlock;
export const UiBlockSchema = UiBlock;
export const BooleanSettingSchema = BooleanSetting;
export const SettingSchema = Setting;
export const RealmSettingsSchema = RealmSettings;
export const RealmPermissionsSchema = RealmPermissions;
export const RealmSchema = Realm;
export const BoardActivitySummarySchema = BoardActivitySummary;
export const RealmActivitySchema = RealmActivity;
export const ActivityNotificationsSchema = ActivityNotifications;
export const NotificationsResponseSchema = NotificationsResponse;
export const InviteWithDetailsSchema = InviteWithDetails;
export const createInviteByRealmId_BodySchema = createInviteByRealmId_Body;
export const InviteSchema = Invite;
export const InviteStatusSchema = InviteStatus;
export const acceptInviteByNonce_BodySchema = acceptInviteByNonce_Body;
export const AcceptedInviteResponseSchema = AcceptedInviteResponse;
export const SubscriptionSchema = Subscription;
export const SubscriptionActivitySchema = SubscriptionActivity;
export const updateThreadExternalId_BodySchema = updateThreadExternalId_Body;
export const updateCurrentUser_BodySchema = updateCurrentUser_Body;
export const BobaDexSeasonSchema = BobaDexSeason;
export const BobaDexSchema = BobaDex;
export const UserSettingsSchema = UserSettings;
export const updateUserSettings_BodySchema = updateUserSettings_Body;

export const endpoints = {
  getBoardsByExternalId: {
    method: "get",
    path: "/boards/:board_id",
    alias: "getBoardsByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.union([BoardMetadata, LoggedInBoardMetadata]),
    errors: [
      {
        status: 401,
        description: `User was not found and board requires authentication.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 403,
        description: `User is not authorized to fetch the metadata of this board.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 404,
        description: `The board was not found.`,
        schema: z.void(),
      },
    ],
  },
  createThread: {
    method: "post",
    path: "/boards/:board_id",
    alias: "createThread",
    description: `Creates a new thread in the specified board.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `request body`,
        type: "Body",
        schema: CreateThread,
      },
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: Thread,
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  patchBoardsByExternalId: {
    method: "patch",
    path: "/boards/:board_id",
    alias: "patchBoardsByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `request body`,
        type: "Body",
        schema: BoardDescription,
      },
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: LoggedInBoardMetadata,
    errors: [
      {
        status: 401,
        description: `User was not found.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to update the metadata of this board.`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `The board was not found.`,
        schema: z.void(),
      },
    ],
  },
  muteBoardsByExternalId: {
    method: "post",
    path: "/boards/:board_id/mute",
    alias: "muteBoardsByExternalId",
    description: `Mutes the specified board for the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  unmuteBoardsByExternalId: {
    method: "delete",
    path: "/boards/:board_id/mute",
    alias: "unmuteBoardsByExternalId",
    description: `Unmutes the specified board for the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  dismissBoardsByExternalId: {
    method: "delete",
    path: "/boards/:board_id/notifications",
    alias: "dismissBoardsByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `User is not logged in.`,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  pinBoardsByExternalId: {
    method: "post",
    path: "/boards/:board_id/pin",
    alias: "pinBoardsByExternalId",
    description: `Pins the specified board for the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  unpinBoardsByExternalId: {
    method: "delete",
    path: "/boards/:board_id/pin",
    alias: "unpinBoardsByExternalId",
    description: `Unpins the specified board for the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  getBoardRolesByExternalId: {
    method: "get",
    path: "/boards/:board_id/roles",
    alias: "getBoardRolesByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: RealmRoles,
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        description: `The board was not found.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 500,
        description: `There was an error fetching board roles.`,
        schema: z.void(),
      },
    ],
  },
  visitBoardsByExternalId: {
    method: "get",
    path: "/boards/:board_id/visits",
    alias: "visitBoardsByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `User was not found.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  getBoardsFeedByExternalId: {
    method: "get",
    path: "/feeds/boards/:board_id",
    alias: "getBoardsFeedByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "board_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: FeedActivity,
    errors: [
      {
        status: 404,
        description: `The board was not found.`,
        schema: z.void(),
      },
    ],
  },
  getRealmActivity: {
    method: "get",
    path: "/feeds/realms/:realm_id",
    alias: "getRealmActivity",
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: FeedActivity,
    errors: [
      {
        status: 404,
        description: `The realm was not found.`,
        schema: z.void(),
      },
    ],
  },
  getPersonalFeed: {
    method: "get",
    path: "/feeds/users/@me",
    alias: "getPersonalFeed",
    requestFormat: "json",
    parameters: [
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: FeedActivity,
    errors: [
      {
        status: 404,
        description: `The board was not found.`,
        schema: z.void(),
      },
    ],
  },
  getUserStarFeed: {
    method: "get",
    path: "/feeds/users/@me/stars",
    alias: "getUserStarFeed",
    requestFormat: "json",
    parameters: [
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: FeedActivity,
  },
  postComment: {
    method: "post",
    path: "/posts/:post_id/comments",
    alias: "postComment",
    description: `Creates a comment nested under the contribution with id {post_id}.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `The details of the comment to post.`,
        type: "Body",
        schema: postComment_Body,
      },
      {
        name: "post_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ comments: z.array(Comment) }).partial(),
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to perform the action.`,
        schema: z.void(),
      },
    ],
  },
  postContribution: {
    method: "post",
    path: "/posts/:post_id/contributions",
    alias: "postContribution",
    description: `Posts a contribution replying to the one with id {postId}.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `The details of the contribution to post.`,
        type: "Body",
        schema: postContribution_Body,
      },
      {
        name: "post_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ contribution: Contribution }).partial(),
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to perform the action.`,
        schema: z.void(),
      },
    ],
  },
  editContribution: {
    method: "patch",
    path: "/posts/:post_id/contributions",
    alias: "editContribution",
    description: `Edits a contribution (for now just its tags).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `The details of the contribution to edit.`,
        type: "Body",
        schema: Tags,
      },
      {
        name: "post_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ contribution: Contribution }).partial(),
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to perform the action.`,
        schema: z.void(),
      },
    ],
  },
  getRealmsActivityByExternalId: {
    method: "get",
    path: "/realms/:realm_id/activity",
    alias: "getRealmsActivityByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: RealmActivity,
    errors: [
      {
        status: 404,
        description: `The realm was not found.`,
        schema: z.void(),
      },
    ],
  },
  getInvitesByRealmId: {
    method: "get",
    path: "/realms/:realm_id/invites",
    alias: "getInvitesByRealmId",
    description: `See https://github.com/essential-randomness/bobaserver/issues/56 for future design intentions to return all invites.`,
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ invites: z.array(InviteWithDetails) }).partial(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        description: `The realm was not found.`,
        schema: z.object({ message: z.string() }).partial(),
      },
    ],
  },
  createInviteByRealmId: {
    method: "post",
    path: "/realms/:realm_id/invites",
    alias: "createInviteByRealmId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `The invite data.`,
        type: "Body",
        schema: createInviteByRealmId_Body,
      },
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: Invite,
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        description: `The realm was not found.`,
        schema: z.object({ message: z.string() }).partial(),
      },
    ],
  },
  getInviteByNonce: {
    method: "get",
    path: "/realms/:realm_id/invites/:nonce",
    alias: "getInviteByNonce",
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "nonce",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: InviteStatus,
    errors: [
      {
        status: 404,
        description: `The invite with the given code was not found.`,
        schema: z.object({ message: z.string() }).partial(),
      },
    ],
  },
  acceptInviteByNonce: {
    method: "post",
    path: "/realms/:realm_id/invites/:nonce",
    alias: "acceptInviteByNonce",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `The user data for the invite. Only required if the user does not already have an account.`,
        type: "Body",
        schema: acceptInviteByNonce_Body,
      },
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "nonce",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: AcceptedInviteResponse,
    errors: [
      {
        status: 400,
        description: `Request does not contain email and password require to create new user account.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 403,
        description: `The invite is not valid anymore, or the user&#x27;s email does not correspond to the invited one.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 404,
        description: `The invite with the given code was not found, or the requested realm does not exist.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 409,
        description: `The user is already a member of the requested realm.`,
        schema: z.object({ message: z.string() }).partial(),
      },
    ],
  },
  getCurrentUserNotifications: {
    method: "get",
    path: "/realms/:realm_id/notifications",
    alias: "getCurrentUserNotifications",
    description: `Gets notifications data for the current user, including pinned boards.
If &#x60;realm_id&#x60; is present, also fetch notification data for the current realm.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: NotificationsResponse,
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to perform the action.`,
        schema: z.void(),
      },
    ],
  },
  dismissUserNotifications: {
    method: "delete",
    path: "/realms/:realm_id/notifications",
    alias: "dismissUserNotifications",
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  getRealmsRolesByExternalId: {
    method: "get",
    path: "/realms/:realm_id/roles",
    alias: "getRealmsRolesByExternalId",
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: RealmRoles,
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        description: `The realm was not found.`,
        schema: z.object({ message: z.string() }).partial(),
      },
      {
        status: 500,
        description: `There was an error fetching realm roles.`,
        schema: z.void(),
      },
    ],
  },
  getRealmsBySlug: {
    method: "get",
    path: "/realms/slug/:realm_slug",
    alias: "getRealmsBySlug",
    requestFormat: "json",
    parameters: [
      {
        name: "realm_slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Realm,
    errors: [
      {
        status: 404,
        description: `The realm was not found.`,
        schema: z.void(),
      },
    ],
  },
  getSubscription: {
    method: "get",
    path: "/subscriptions/:subscription_id",
    alias: "getSubscription",
    requestFormat: "json",
    parameters: [
      {
        name: "subscription_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: SubscriptionActivity,
    errors: [
      {
        status: 404,
        description: `The subscription was not found.`,
        schema: z.void(),
      },
    ],
  },
  getThreadByExternalId: {
    method: "get",
    path: "/threads/:thread_id",
    alias: "getThreadByExternalId",
    description: `Fetches data for the specified thread.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: Thread,
    errors: [
      {
        status: 401,
        description: `User was not found and thread requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  updateThreadExternalId: {
    method: "patch",
    path: "/threads/:thread_id",
    alias: "updateThreadExternalId",
    description: `Updates the default view that the thread uses or the parent board of the thread.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `request body`,
        type: "Body",
        schema: updateThreadExternalId_Body,
      },
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  hideThreadByExternalId: {
    method: "post",
    path: "/threads/:thread_id/hide",
    alias: "hideThreadByExternalId",
    description: `Hides the specified thread for the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  unhideThreadByExternalId: {
    method: "delete",
    path: "/threads/:thread_id/hide",
    alias: "unhideThreadByExternalId",
    description: `Unhides the specified thread for the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  muteThreadByExternalId: {
    method: "post",
    path: "/threads/:thread_id/mute",
    alias: "muteThreadByExternalId",
    description: `Mutes the specified thread for the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  unmuteThreadByExternalId: {
    method: "delete",
    path: "/threads/:thread_id/mute",
    alias: "unmuteThreadByExternalId",
    description: `Unmutes a specified thread.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  starThreadByExternalId: {
    method: "post",
    path: "/threads/:thread_id/stars",
    alias: "starThreadByExternalId",
    description: `Adds selected thread to current user Star Feed.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  unstarThreadByExternalId: {
    method: "delete",
    path: "/threads/:thread_id/stars",
    alias: "unstarThreadByExternalId",
    description: `Deletes selected thread from current user Star Feed.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  visitThreadByExternalId: {
    method: "post",
    path: "/threads/:thread_id/visits",
    alias: "visitThreadByExternalId",
    description: `Records a visit to a thread by the current user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "thread_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        schema: z.void(),
      },
      {
        status: 403,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  getCurrentUser: {
    method: "get",
    path: "/users/@me",
    alias: "getCurrentUser",
    requestFormat: "json",
    response: z
      .object({ username: z.string(), avatar_url: z.string().url() })
      .partial(),
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to perform the action.`,
        schema: z.void(),
      },
    ],
  },
  updateCurrentUser: {
    method: "patch",
    path: "/users/@me",
    alias: "updateCurrentUser",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `request body`,
        type: "Body",
        schema: updateCurrentUser_Body,
      },
    ],
    response: z.object({ username: z.string(), avatar_url: z.string().url() }),
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to perform the action.`,
        schema: z.void(),
      },
    ],
  },
  getCurrentUserBobadex: {
    method: "get",
    path: "/users/@me/bobadex",
    alias: "getCurrentUserBobadex",
    requestFormat: "json",
    response: BobaDex,
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
    ],
  },
  getCurrentUserPinnedBoardsForRealm: {
    method: "get",
    path: "/users/@me/pins/realms/:realm_id",
    alias: "getCurrentUserPinnedBoardsForRealm",
    requestFormat: "json",
    parameters: [
      {
        name: "realm_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({
      pinned_boards: z.record(
        LoggedInBoardSummary.and(z.object({ index: z.number() }))
      ),
    }),
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `User is not authorized to perform the action.`,
        schema: z.void(),
      },
    ],
  },
  getUserSettings: {
    method: "get",
    path: "/users/@me/settings",
    alias: "getUserSettings",
    requestFormat: "json",
    response: UserSettings,
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
    ],
  },
  updateUserSettings: {
    method: "patch",
    path: "/users/@me/settings",
    alias: "updateUserSettings",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `request body`,
        type: "Body",
        schema: updateUserSettings_Body,
      },
    ],
    response: UserSettings,
    errors: [
      {
        status: 401,
        description: `User was not found in request that requires authentication.`,
        schema: z.void(),
      },
    ],
  },
};
