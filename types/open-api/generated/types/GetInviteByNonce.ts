import type { GenericResponse } from "./GenericResponse";
import type { InviteStatus } from "./InviteStatus";

export type GetInviteByNoncePathParams = {
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
 * @description The invite with the given code was not found.
*/
export type GetInviteByNonce404 = GenericResponse;

 /**
 * @description The realm amd status of the requested invite.
*/
export type GetInviteByNonceQueryResponse = InviteStatus;
export type GetInviteByNonceQuery = {
    Response: GetInviteByNonceQueryResponse;
    PathParams: GetInviteByNoncePathParams;
    Errors: GetInviteByNonce404;
};