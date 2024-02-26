import type { ActivityNotifications } from "./ActivityNotifications";

export type NotificationsResponse = {
    /**
     * @type boolean
    */
    has_notifications: boolean;
    /**
     * @type boolean
    */
    is_outdated_notifications: boolean;
    /**
     * @type string
    */
    realm_id: string;
    /**
     * @description A map from board id to its NotificationStatus for each realm board.
    If `realm_id` is not present in the params, it will be empty.
    
     * @type object
    */
    realm_boards: {
        [key: string]: ActivityNotifications;
    };
    /**
     * @description A map from board id to its NotiicationStatus for each pinned board.
    
     * @type object
    */
    pinned_boards: {
        [key: string]: ActivityNotifications;
    };
};