export interface ServerCommentType {
  comment_id: string;
  secret_identity: {
    name: string;
    avatar: string;
  };
  user_identity?: {
    name: string;
    avatar: string;
  };
  content: string;
  created: string;
}

export interface ServerPostType {
  post_id: string;
  thread_id: string;
  parent_post_id: string;
  secret_identity: {
    name: string;
    avatar: string;
  };
  user_identity?: {
    name: string;
    avatar: string;
  };
  created: string;
  content: string;
  options: {
    wide?: boolean;
  };
  tags: {
    whisper_tags: string[];
  };
  comments?: ServerCommentType[];
  posts_amount: number;
  comments_amount: number;
  threads_amount: number;
  new_posts_amount: number;
  new_comments_amount: number;
  is_new: boolean;
  last_activity: string;
}
