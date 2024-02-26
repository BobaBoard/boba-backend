import type { LoggedInBoardSummary } from "./LoggedInBoardSummary";

/**
 * @description User was not found in request that requires authentication.
*/
export type GetCurrentUserPinnedBoardsForRealm401 = any | null;

 /**
 * @description User is not authorized to perform the action.
*/
export type GetCurrentUserPinnedBoardsForRealm403 = any | null;

 export type GetCurrentUserPinnedBoardsForRealmPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

 /**
 * @description The user data.
*/
export type GetCurrentUserPinnedBoardsForRealmQueryResponse = {
    /**
     * @description A map from board id to its LoggedInSummary for each pinned board.
    
     * @type object
    */
    pinned_boards: {
        [key: string]: (LoggedInBoardSummary & {
            /**
             * @type number
            */
            index: number;
        });
    };
};
export type GetCurrentUserPinnedBoardsForRealmQuery = {
    Response: GetCurrentUserPinnedBoardsForRealmQueryResponse;
    PathParams: GetCurrentUserPinnedBoardsForRealmPathParams;
    Errors: GetCurrentUserPinnedBoardsForRealm401 | GetCurrentUserPinnedBoardsForRealm403;
};