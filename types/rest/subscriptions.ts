import { Post } from "./threads";

export interface Subscription {
  id: string;
  name: string;
  last_activity_at: string | null;
}

export interface SubscriptionFeed {
  cursor: {
    next: string | null;
  };
  subscription: Subscription;
  activity: Post[];
}
