import type { GenericResponse } from "./GenericResponse";
import type { InviteWithDetails } from "./InviteWithDetails";

export type GetInvitesByRealmIdPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

 export type GetInvitesByRealmId401 = GenericResponse;

 export type GetInvitesByRealmId403 = GenericResponse;

 /**
 * @description The realm was not found.
*/
export type GetInvitesByRealmId404 = GenericResponse;

 /**
 * @description The metadata of all pending invites for the current realm.
*/
export type GetInvitesByRealmIdQueryResponse = {
    /**
     * @type array | undefined
    */
    invites?: InviteWithDetails[];
};
export type GetInvitesByRealmIdQuery = {
    Response: GetInvitesByRealmIdQueryResponse;
    PathParams: GetInvitesByRealmIdPathParams;
    Errors: GetInvitesByRealmId401 | GetInvitesByRealmId403 | GetInvitesByRealmId404;
};