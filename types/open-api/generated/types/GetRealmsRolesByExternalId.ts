import type { GenericResponse } from "./GenericResponse";
import type { RealmRoles } from "./RealmRoles";

/**
 * @description There was an error fetching realm roles.
*/
export type GetRealmsRolesByExternalId500 = any | null;

 export type GetRealmsRolesByExternalIdPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

 export type GetRealmsRolesByExternalId401 = GenericResponse;

 export type GetRealmsRolesByExternalId403 = GenericResponse;

 /**
 * @description The realm was not found.
*/
export type GetRealmsRolesByExternalId404 = GenericResponse;

 /**
 * @description The realm roles summary.
*/
export type GetRealmsRolesByExternalIdQueryResponse = RealmRoles;
export type GetRealmsRolesByExternalIdQuery = {
    Response: GetRealmsRolesByExternalIdQueryResponse;
    PathParams: GetRealmsRolesByExternalIdPathParams;
    Errors: GetRealmsRolesByExternalId401 | GetRealmsRolesByExternalId403 | GetRealmsRolesByExternalId404 | GetRealmsRolesByExternalId500;
};