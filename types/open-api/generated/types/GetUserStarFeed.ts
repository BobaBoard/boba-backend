import type { FeedActivity } from "./FeedActivity";

export type GetUserStarFeedQueryParams = {
    /**
     * @description The cursor to start feeding the activity of the user star feed from.
     * @type string | undefined
    */
    cursor?: string;
} | undefined;

 /**
 * @description Star Feed activity
*/
export type GetUserStarFeedQueryResponse = FeedActivity;
export type GetUserStarFeedQuery = {
    Response: GetUserStarFeedQueryResponse;
    QueryParams: GetUserStarFeedQueryParams;
};