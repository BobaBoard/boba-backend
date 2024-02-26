import type { GenericResponse } from "./GenericResponse";

/**
 * @description User was not found.
*/
export type VisitBoardsByExternalId401 = {
    /**
     * @type string | undefined
    */
    message?: string;
};

 export type VisitBoardsByExternalId500 = any | null;

 export type VisitBoardsByExternalIdPathParams = {
    /**
     * @description The external id of the board to mark as visited.
     * @type string uuid
    */
    board_id: string;
};

 export type VisitBoardsByExternalIdQueryResponse = any | null;

 export type VisitBoardsByExternalId403 = GenericResponse;
export type VisitBoardsByExternalIdQuery = {
    Response: VisitBoardsByExternalIdQueryResponse;
    PathParams: VisitBoardsByExternalIdPathParams;
    Errors: VisitBoardsByExternalId401 | VisitBoardsByExternalId403 | VisitBoardsByExternalId500;
};