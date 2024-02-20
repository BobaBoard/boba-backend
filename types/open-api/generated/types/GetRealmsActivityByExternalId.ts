import type { RealmActivity } from "./RealmActivity";

/**
 * @description The realm was not found.
*/
export type GetRealmsActivityByExternalId404 = any | null;

 export type GetRealmsActivityByExternalIdPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

 /**
 * @description The realm activity summary.
*/
export type GetRealmsActivityByExternalIdQueryResponse = RealmActivity;
export type GetRealmsActivityByExternalIdQuery = {
    Response: GetRealmsActivityByExternalIdQueryResponse;
    PathParams: GetRealmsActivityByExternalIdPathParams;
    Errors: GetRealmsActivityByExternalId404;
};