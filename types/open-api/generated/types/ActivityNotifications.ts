export type ActivityNotifications = {
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @description Whether the board has a notification.
     * @type boolean
    */
    has_updates: boolean;
    /**
     * @description Whether the board's notifications are older than the user's last visit.
     * @type boolean
    */
    is_outdated: boolean;
    /**
     * @description When the board was last updated.
    */
    last_activity_at: (string | null);
    /**
     * @description When the board was last updated by someone other than the current user.
    */
    last_activity_from_others_at: (string | null);
    /**
     * @description When the board was last visited by the current user.
    */
    last_visited_at: (string | null);
};