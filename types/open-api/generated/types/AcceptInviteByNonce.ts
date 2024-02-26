import type { GenericResponse } from "./GenericResponse";
import type { AcceptedInviteResponse } from "./AcceptedInviteResponse";

/**
 * @description The user data for the invite. Only required if the user does not already have an account.
*/
export type AcceptInviteByNonceMutationRequest = {
    /**
     * @type string email
    */
    email: string;
    /**
     * @type string
    */
    password: string;
};

 export type AcceptInviteByNoncePathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
    /**
     * @description The invite code.
     * @type string
    */
    nonce: string;
};

 /**
 * @description Request does not contain email and password require to create new user account.
*/
export type AcceptInviteByNonce400 = GenericResponse;

 /**
 * @description The invite is not valid anymore, or the user's email does not correspond to the invited one.
*/
export type AcceptInviteByNonce403 = GenericResponse;

 /**
 * @description The invite with the given code was not found, or the requested realm does not exist.
*/
export type AcceptInviteByNonce404 = GenericResponse;

 /**
 * @description The user is already a member of the requested realm.
*/
export type AcceptInviteByNonce409 = GenericResponse;

 /**
 * @description The invite was successfully accepted.
*/
export type AcceptInviteByNonceMutationResponse = AcceptedInviteResponse;
export type AcceptInviteByNonceMutation = {
    Response: AcceptInviteByNonceMutationResponse;
    Request: AcceptInviteByNonceMutationRequest;
    PathParams: AcceptInviteByNoncePathParams;
    Errors: AcceptInviteByNonce400 | AcceptInviteByNonce403 | AcceptInviteByNonce404 | AcceptInviteByNonce409;
};