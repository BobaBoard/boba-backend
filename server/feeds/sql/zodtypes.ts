import { z } from "zod";

// Database type schemas

export const CommentTypeSchema = z.object({
  comment_id: z.string(),
  parent_post_id: z.string(),
  parent_comment_id: z.string(),
  chain_parent_id: z.string().nullable(),
  author: z.number(),
  username: z.string(),
  user_avatar: z.string(),
  secret_identity_name: z.string(),
  secret_identity_avatar: z.string(),
  secret_identity_color: z.string().nullable(),
  accessory_avatar: z.string().optional(),
  content: z.string(),
  created_at: z.string(),
  anonymity_type: z.enum(["everyone", "strangers"]),
  self: z.boolean(),
  friend: z.boolean(),
  is_new: z.boolean(),
  is_own: z.boolean(),
});

export const PostTypeSchema = z.object({
  post_id: z.string(),
  parent_thread_id: z.string(),
  parent_post_id: z.string().nullable(),
  parent_board_id: z.string(),
  parent_board_slug: z.string(),
  author: z.number(),
  username: z.string(),
  user_avatar: z.string(),
  secret_identity_name: z.string(),
  secret_identity_avatar: z.string(),
  secret_identity_color: z.string().nullable(),
  accessory_avatar: z.string().optional(),
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
  comments: z.array(CommentTypeSchema).nullable(),
  is_own: z.boolean(),
  is_new: z.boolean(),
});

export const ThreadTypeSchema = z.object({
  thread_id: z.string(),
  board_slug: z.string(),
  board_id: z.string(),
  realm_slug: z.string(),
  realm_id: z.string(),
  thread_last_activity: z.string(),
  posts: z.array(PostTypeSchema),
  default_view: z.enum(["thread", "gallery", "timeline"]),
  thread_new_comments_amount: z.number(),
  thread_total_comments_amount: z.number(),
  thread_direct_threads_amount: z.number(),
  thread_new_posts_amount: z.number(),
  thread_total_posts_amount: z.number(),
  thread_last_activity_at_micro: z.string().nullable(),
  muted: z.boolean(),
  hidden: z.boolean(),
  starred: z.boolean(),
});export type ZodDbThreadType = z.infer<typeof ThreadTypeSchema>;

export const ThreadSummaryTypeSchema = ThreadTypeSchema.extend({
  thread_last_activity_at_micro: z.string().nullable(),
  }).and(ThreadTypeSchema.omit({ posts: true }))
  .and(PostTypeSchema.omit({
     total_comments_amount: true, 
     new_comments_amount: true, 
     comments: true,
  }));
export type ZodDbThreadSummaryType = z.infer<typeof ThreadSummaryTypeSchema>;
//TODO: come up with good names for this or 
//  replace all current DB types out right

export const FeedTypeSchema = z.object({
  cursor: z.string().nullable(),
  activity: z.array(ThreadSummaryTypeSchema),
});
export type ZodDbFeedType = z.infer<typeof FeedTypeSchema>;

