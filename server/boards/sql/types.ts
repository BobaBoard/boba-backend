import { z } from "zod";

export const BoardPermissionsEnumSchema = z.enum([
  "all",
  "edit_board_details",
  "delete_board",
  "post_as_role",
  "edit_category_tags",
  "edit_content_notices",
  "move_thread",
  "edit_content",
  "edit_whisper_tags",
  "edit_index_tags",
  "edit_default_view",
  "create_realm_invite",
  "post_on_realm",
  "comment_on_realm",
  "create_thread_on_realm",
  "access_locked_boards_on_realm",
  "view_roles_on_realm",
  "view_roles_on_board",
  "create_board_on_realm",
]);
export const BoardRestrictionsEnumSchema = z.enum(["lock_access", "delist"]);
export type BoardRestrictionsEnum = z.infer<typeof BoardRestrictionsEnumSchema>;

export const BoardIdentitySchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string(),
  // NOTE: this is the url of the accessory
  accessory: z.string().nullable(),
  color: z.string().nullable(),
});

export const BoardAccessorySchema = z.object({
  id: z.string(),
  name: z.string(),
  // NOTE: this is the url of the accessory
  accessory: z.string(),
});

export const BoardTextDescriptionSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  type: z.literal("text"),
  description: z.string(),
  categories: z.null(),
});

export const BoardCategoryDescriptionSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  type: z.literal("category_filter"),
  categories: z.array(z.string()),
  // TODO: this should just be null, unless we decide to make the categories also
  // have description. Right now, some categories sections are saved with an empty
  // description, which is the worst of both worlds.
  description: z.string().nullable(),
});

export const BoardSettingsSchema = z.object({
  accentColor: z.string(),
});

export const BoardByExternalIdSchema = z.object({
  external_id: z.string(),
  realm_external_id: z.string(),
  slug: z.string(),
  tagline: z.string(),
  avatar_url: z.string(),
  descriptions: z.array(
    z.discriminatedUnion("type", [
      BoardTextDescriptionSchema,
      BoardCategoryDescriptionSchema,
    ])
  ),
  accessories: z.array(BoardAccessorySchema),
  posting_identities: z.array(BoardIdentitySchema),
  muted: z.boolean(),
  pinned_order: z.number().nullable(),
  permissions: z.array(BoardPermissionsEnumSchema),
  logged_out_restrictions: z.array(BoardRestrictionsEnumSchema),
  logged_in_base_restrictions: z.array(BoardRestrictionsEnumSchema),
  settings: BoardSettingsSchema,
});
export type BoardByExternalId = z.infer<typeof BoardByExternalIdSchema>;

export const DbRealmBoardSchema = z.object({
  // TODO: rename this as external_id
  string_id: z.string(),
  realm_external_id: z.string(),
  slug: z.string(),
  tagline: z.string(),
  avatar_reference_id: z.string(),
  settings: BoardSettingsSchema,
  board_categories_external_id: z.string(),
  last_post_at: z.date().nullable(),
  last_comment_at: z.date().nullable(),
  last_activity_at: z.date().nullable(),
  last_activity_from_others_at: z.date().nullable(),
  last_visit_at: z.date().nullable(),
  muted: z.boolean(),
  pinned_order: z.number().nullable(),
  has_updates: z.boolean(),
  logged_out_restrictions: z.array(BoardRestrictionsEnumSchema),
  logged_in_base_restrictions: z.array(BoardRestrictionsEnumSchema),
});

export type DbRealmBoardType = z.infer<typeof DbRealmBoardSchema>;
