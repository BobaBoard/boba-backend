import { Identity, SecretIdentity } from "./identity";

export interface Tags {
  whisper_tags: string[];
  index_tags: string[];
  category_tags: string[];
  content_warnings: string[];
}

export interface Post {
  id: string;
  parent_thread_id: string;
  parent_post_id: string | null;
  content: string;
  created_at: string;
  secret_identity: SecretIdentity;
  user_identity?: Identity | null;
  own: boolean;
  new: boolean;
  friend: boolean;
  total_comments_amount: number;
  new_comments_amount: number;
  tags: Tags;
}

export interface Comment {
  id: string;
  parent_post_id: string;
  parent_comment_id: string | null;
  chain_parent_id: string | null;
  content: string;
  secret_identity: SecretIdentity;
  user_identity?: Identity | null;
  created_at: string;
  own: boolean;
  new: boolean;
  friend: boolean;
}

export interface ThreadActivitySummary {
  new_posts_amount: number;
  new_comments_amount: number;
  total_comments_amount: number;
  total_posts_amount: number;
  direct_threads_amount: number;
  last_activity_at: string;
}

export interface ThreadSummary extends ThreadActivitySummary {
  id: string;
  parent_board_slug: string;
  parent_board_id: string;
  parent_realm_slug: string;
  parent_realm_id: string;
  starter: Post;
  default_view: "thread" | "gallery" | "timeline";
  new: boolean;
  muted: boolean;
  hidden: boolean;
  starred: boolean;
}

export interface Thread extends ThreadSummary {
  posts: Post[];
  comments: { [contribution_id: string]: Comment[] };
}

export interface Feed {
  cursor: {
    next: string | null;
  };
  activity: ThreadSummary[];
}
