import { z } from "zod";

// Database type schemas

const DbIdentitySchema = z.object({
  username: z.string().nullable(),
  user_avatar: z.string().nullable(),
});

/**
 * Expands object types recursively, thus making the resulting type
 * more readable. Doesn't actually change the type.
 */
export type MakeRecursiveTypeReadable<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: MakeRecursiveTypeReadable<O[K]> }
    : never
  : T;

export const CommentTypeSchema = z.object({
  comment_id: z.string(),
  parent_post_id: z.string(),
  parent_comment_id: z.string().nullable(),
  chain_parent_id: z.string().nullable(),
  author: z.number(),
  username: z.string(),
  user_avatar: z.string(),
  secret_identity_name: z.string(),
  secret_identity_avatar: z.string(),
  secret_identity_color: z.string().nullable(),
  accessory_avatar: z.string().nullable(),
  content: z.string(),
  created_at: z.string(),
  // TODO: deprecate this
  anonymity_type: z.enum(["everyone", "strangers"]),
  self: z.boolean(),
  friend: z.boolean(),
  is_new: z.boolean(),
  is_own: z.boolean(),
});

const DbSecretIdentitySchema = z.object({
  secret_identity_name: z.string(),
  secret_identity_avatar: z.string(),
  secret_identity_color: z.string().nullable(),
  accessory_avatar: z.string().nullable(),
});

const DbCommentTypeSchema = z
  .object({
    comment_id: z.string(),
    parent_post_id: z.string(),
    parent_comment_id: z.string().nullable(),
    chain_parent_id: z.string().nullable(),
    author: z.number(),
    content: z.string(),
    created_at: z.string(),
    anonymity_type: z.enum(["everyone", "strangers"]),
    self: z.boolean(),
    friend: z.boolean(),
    is_new: z.boolean(),
    is_own: z.boolean(),
  })
  .merge(DbIdentitySchema)
  .merge(DbSecretIdentitySchema);
export type ZodDbCommentType = z.infer<typeof DbCommentTypeSchema>;

const ZodDbPostTypeSchema = z
  .object({
    post_id: z.string(),
    parent_thread_id: z.string(),
    parent_post_id: z.string().nullable(),
    parent_board_id: z.string(),
    parent_board_slug: z.string(),
    author: z.number(),
    self: z.boolean(),
    friend: z.boolean(),
    created_at: z.string(),
    content: z.string(),
    type: z.string(),
    index_tags: z.string().array(),
    category_tags: z.string().array(),
    content_warnings: z.string().array(),
    whisper_tags: z.string().array(),
    anonymity_type: z.enum(["everyone", "strangers"]),
    total_comments_amount: z.number(),
    new_comments_amount: z.number(),
    is_own: z.boolean(),
    is_new: z.boolean(),
  })
  .merge(DbIdentitySchema)
  .merge(DbSecretIdentitySchema);

export type ZodDbPostType = z.infer<typeof ZodDbPostTypeSchema>;

const DbThreadTypeSchema = z.object({
  thread_id: z.string(),
  board_slug: z.string(),
  board_id: z.string(),
  realm_slug: z.string(),
  realm_id: z.string(),
  posts: z.array(ZodDbPostTypeSchema),
  comments: z.array(DbCommentTypeSchema),
  default_view: z.enum(["thread", "gallery", "timeline"]),
  thread_new_comments_amount: z.number(),
  thread_total_comments_amount: z.number(),
  thread_direct_threads_amount: z.number(),
  thread_new_posts_amount: z.number(),
  thread_total_posts_amount: z.number(),
  thread_last_activity_at: z.string(),
  muted: z.boolean(),
  hidden: z.boolean(),
  starred: z.boolean(),
});
export type ZodDbThreadType = z.infer<typeof DbThreadTypeSchema>;

export const ThreadSummaryTypeSchema = DbThreadTypeSchema.omit({
  posts: true,
  comments: true,
})
  .merge(DbThreadTypeSchema.omit({ posts: true }))
  .merge(
    ZodDbPostTypeSchema.omit({
      total_comments_amount: true,
      new_comments_amount: true,
      comments: true,
    })
  );

export type ZodDbThreadSummaryType = MakeRecursiveTypeReadable<
  z.infer<typeof ThreadSummaryTypeSchema>
>;

const FeedTypeSchema = z.object({
  cursor: z.string().nullable(),
  activity: z.array(ThreadSummaryTypeSchema),
});
export type ZodDbFeedType = z.infer<typeof FeedTypeSchema>;
