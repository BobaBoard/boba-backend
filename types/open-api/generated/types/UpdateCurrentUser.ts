/**
 * @description User was not found in request that requires authentication.
*/
export type UpdateCurrentUser401 = any | null;

 /**
 * @description User is not authorized to perform the action.
*/
export type UpdateCurrentUser403 = any | null;

 /**
 * @description request body
*/
export type UpdateCurrentUserMutationRequest = {
    /**
     * @description The username of the user.
     * @type string
    */
    username: string;
    /**
     * @description The avatar url of the user.
     * @type string uri
    */
    avatarUrl: string;
};

 /**
 * @description The user data.
*/
export type UpdateCurrentUserMutationResponse = {
    /**
     * @type string
    */
    username: string;
    /**
     * @type string uri
    */
    avatar_url: string;
};
export type UpdateCurrentUserMutation = {
    Response: UpdateCurrentUserMutationResponse;
    Request: UpdateCurrentUserMutationRequest;
    Errors: UpdateCurrentUser401 | UpdateCurrentUser403;
};