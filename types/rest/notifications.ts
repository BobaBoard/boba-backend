export interface ActivityNotifications {
  id: string;
  has_updates: boolean;
  is_outdated: boolean;
  last_activity_at: string | null;
  last_activity_from_others_at: string | null;
  last_visited_at: string | null;
}

export interface NotificationsResponse {
  has_notifications: boolean;
  is_outdated_notifications: boolean;
  realm_id: string;
  realm_boards: Record<string, ActivityNotifications>;
  pinned_boards: Record<string, ActivityNotifications>;
}
