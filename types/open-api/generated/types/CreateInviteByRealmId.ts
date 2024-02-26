import type { GenericResponse } from "./GenericResponse";
import type { Invite } from "./Invite";

/**
 * @description The invite data.
*/
export type CreateInviteByRealmIdMutationRequest = {
    /**
     * @type string | undefined email
    */
    email?: string;
    /**
     * @type string | undefined
    */
    label?: string;
};

 export type CreateInviteByRealmIdPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

 export type CreateInviteByRealmId401 = GenericResponse;

 export type CreateInviteByRealmId403 = GenericResponse;

 /**
 * @description The realm was not found.
*/
export type CreateInviteByRealmId404 = GenericResponse;

 /**
 * @description The invite metadata.
*/
export type CreateInviteByRealmIdMutationResponse = Invite;
export type CreateInviteByRealmIdMutation = {
    Response: CreateInviteByRealmIdMutationResponse;
    Request: CreateInviteByRealmIdMutationRequest;
    PathParams: CreateInviteByRealmIdPathParams;
    Errors: CreateInviteByRealmId401 | CreateInviteByRealmId403 | CreateInviteByRealmId404;
};