export interface BoardNotifications {
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
  realm_boards: Record<string, BoardNotifications>;
  pinned_boards: Record<string, BoardNotifications>;
}
