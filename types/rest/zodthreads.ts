import { Identity, SecretIdentity } from "./zodidentity";

import { z } from "zod";

export const Tags = z.object({
  whisper_tags: z.string().array(),
  index_tags: z.string().array(),
  category_tags: z.string().array(),
  content_warnings: z.string().array(),
});

// TODO: check to verify Identity is correctly declared here
export const Post = z.object({
  id: z.string(),
  parent_thread_id: z.string(),
  parent_post_id: z.string().nullable(),
  content: z.string(),
  created_at: z.string(),
  secret_identity: SecretIdentity,
  user_identity: Identity.optional().nullable(),
  own: z.boolean(),
  new: z.boolean(),
  friend: z.boolean(),
  total_comments_amount: z.number(),
  new_comments_amount: z.number(),
  tags: Tags,
});
// TODO: check to verify Identity is correctly declared here
export const Comment = z.object({
  id: z.string(),
  parent_post_id: z.string(),
  parent_comment_id: z.string().nullable(),
  chain_parent_id: z.string().nullable(),
  content: z.string(),
  secret_identity: SecretIdentity,
  user_identity: Identity.optional().nullable(),
  created_at: z.string(),
  own: z.boolean(),
  new: z.boolean(),
  friend: z.boolean(),
});

export const ThreadActivitySummary = z.object({
  new_posts_amount: z.number(),
  new_comments_amount: z.number(),
  total_comments_amount: z.number(),
  total_posts_amount: z.number(),
  direct_threads_amount: z.number(),
  last_activity_at: z.string(),
});

export const ThreadSummary = ThreadActivitySummary.extend({
  id: z.string(),
  parent_board_slug: z.string(),
  parent_board_id: z.string(),
  parent_realm_slug: z.string(),
  parent_realm_id: z.string(),
  starter: Post,
  default_view: z.enum(["thread", "gallery", "timeline"]),
  new: z.boolean(),
  muted: z.boolean(),
  hidden: z.boolean(),
  starred: z.boolean(),
});
export type ZodThreadSummary = z.infer<typeof ThreadSummary>;

// TODO: figure out how to convert ThreadSummary to Zod 

/*export const Thread = ThreadSummary.extend({
  posts: Post.array(),
  comments: z.object({contribution_id: z.string(): Comment.array() }),
});
*/
export const Feed = z.object({
  cursor: z.object({
    next: z.string().nullable(),
  }),
  activity: ThreadSummary.array(),
});
