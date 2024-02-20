import type { GenericResponse } from "./GenericResponse";

export type DismissBoardsByExternalId401 = any | null;

 export type DismissBoardsByExternalId404 = any | null;

 export type DismissBoardsByExternalId500 = any | null;

 export type DismissBoardsByExternalIdMutationResponse = any | null;

 export type DismissBoardsByExternalIdPathParams = {
    /**
     * @description The external id of the board to dismiss notifications for.
     * @type string uuid
    */
    board_id: string;
};

 export type DismissBoardsByExternalId403 = GenericResponse;
export type DismissBoardsByExternalIdMutation = {
    Response: DismissBoardsByExternalIdMutationResponse;
    PathParams: DismissBoardsByExternalIdPathParams;
    Errors: DismissBoardsByExternalId401 | DismissBoardsByExternalId403 | DismissBoardsByExternalId404 | DismissBoardsByExternalId500;
};