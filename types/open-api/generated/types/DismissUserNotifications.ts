import type { GenericResponse } from "./GenericResponse";

export type DismissUserNotifications500 = any | null;

 export type DismissUserNotificationsMutationResponse = any | null;

 export type DismissUserNotificationsPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

 export type DismissUserNotifications401 = GenericResponse;

 export type DismissUserNotifications403 = GenericResponse;
export type DismissUserNotificationsMutation = {
    Response: DismissUserNotificationsMutationResponse;
    PathParams: DismissUserNotificationsPathParams;
    Errors: DismissUserNotifications401 | DismissUserNotifications403 | DismissUserNotifications500;
};