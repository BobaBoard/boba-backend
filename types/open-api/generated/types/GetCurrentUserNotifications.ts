import type { NotificationsResponse } from "./NotificationsResponse";

/**
 * @description User was not found in request that requires authentication.
*/
export type GetCurrentUserNotifications401 = any | null;

 /**
 * @description User is not authorized to perform the action.
*/
export type GetCurrentUserNotifications403 = any | null;

 export type GetCurrentUserNotificationsPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

 /**
 * @description The notifications data.
*/
export type GetCurrentUserNotificationsQueryResponse = NotificationsResponse;
export type GetCurrentUserNotificationsQuery = {
    Response: GetCurrentUserNotificationsQueryResponse;
    PathParams: GetCurrentUserNotificationsPathParams;
    Errors: GetCurrentUserNotifications401 | GetCurrentUserNotifications403;
};