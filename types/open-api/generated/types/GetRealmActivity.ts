import type { FeedActivity } from "./FeedActivity";

/**
 * @description The realm was not found.
*/
export type GetRealmActivity404 = any | null;

 export type GetRealmActivityPathParams = {
    /**
     * @description The external id of the realm to fetch the activity of.
     * @type string
    */
    realm_id: string;
};

 export type GetRealmActivityQueryParams = {
    /**
     * @description The cursor to start feeding the activity of the board from.
     * @type string | undefined
    */
    cursor?: string;
} | undefined;

 /**
 * @description The realm's activity.
*/
export type GetRealmActivityQueryResponse = FeedActivity;
export type GetRealmActivityQuery = {
    Response: GetRealmActivityQueryResponse;
    PathParams: GetRealmActivityPathParams;
    QueryParams: GetRealmActivityQueryParams;
    Errors: GetRealmActivity404;
};