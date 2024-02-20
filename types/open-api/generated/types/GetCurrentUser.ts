/**
 * @description User was not found in request that requires authentication.
*/
export type GetCurrentUser401 = any | null;

 /**
 * @description User is not authorized to perform the action.
*/
export type GetCurrentUser403 = any | null;

 /**
 * @description The user data.
*/
export type GetCurrentUserQueryResponse = {
    /**
     * @type string | undefined
    */
    username?: string;
    /**
     * @type string | undefined uri
    */
    avatar_url?: string;
};
export type GetCurrentUserQuery = {
    Response: GetCurrentUserQueryResponse;
    Errors: GetCurrentUser401 | GetCurrentUser403;
};