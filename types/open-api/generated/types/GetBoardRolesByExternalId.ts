import type { GenericResponse } from "./GenericResponse";
import type { RealmRoles } from "./RealmRoles";

/**
 * @description There was an error fetching board roles.
*/
export type GetBoardRolesByExternalId500 = any | null;

 export type GetBoardRolesByExternalIdPathParams = {
    /**
     * @description The id of the board.
     * @type string uuid
    */
    board_id: string;
};

 export type GetBoardRolesByExternalId401 = GenericResponse;

 export type GetBoardRolesByExternalId403 = GenericResponse;

 /**
 * @description The board was not found.
*/
export type GetBoardRolesByExternalId404 = GenericResponse;

 /**
 * @description The board roles summary.
*/
export type GetBoardRolesByExternalIdQueryResponse = RealmRoles;
export type GetBoardRolesByExternalIdQuery = {
    Response: GetBoardRolesByExternalIdQueryResponse;
    PathParams: GetBoardRolesByExternalIdPathParams;
    Errors: GetBoardRolesByExternalId401 | GetBoardRolesByExternalId403 | GetBoardRolesByExternalId404 | GetBoardRolesByExternalId500;
};