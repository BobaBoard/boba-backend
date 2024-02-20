import type { FeedActivity } from "./FeedActivity";

/**
 * @description The board was not found.
*/
export type GetUserFeed404 = any | null;

 export type GetUserFeedQueryParams = {
    /**
     * @description The cursor to start feeding the activity of the board from.
     * @type string | undefined
    */
    cursor?: string;
    /**
     * @description Whether to show read threads.
     * @type boolean | undefined
    */
    showRead?: boolean;
    /**
     * @description Whether to only show threads started by the user.
     * @type boolean | undefined
    */
    ownOnly?: boolean;
    /**
     * @description The realm id to filter by.
     * @type string | undefined
    */
    realmId?: string;
} | undefined;

 /**
 * @description The board activity.
*/
export type GetUserFeedQueryResponse = FeedActivity;
export type GetUserFeedQuery = {
    Response: GetUserFeedQueryResponse;
    QueryParams: GetUserFeedQueryParams;
    Errors: GetUserFeed404;
};